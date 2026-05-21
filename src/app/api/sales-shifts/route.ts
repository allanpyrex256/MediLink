import { NextRequest, NextResponse } from "next/server";
import { canManageFinance, getAuthenticatedApiProfile } from "@/lib/api-profile";
import {
  buildLocalDemoSalesShift,
  buildSalesShiftOpenInsert,
  salesShiftOpenSchema,
} from "@/lib/dashboard-create";
import { hasSupabaseConfig } from "@/lib/config";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import { getLocalDemoWorkspaceState, saveLocalDemoSalesShift } from "@/lib/local-demo-store";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`sales-shifts:${ip}`, 25);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many shift requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = salesShiftOpenSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid shift details", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = buildDemoDashboardData(workspaceId);
    const local = await getLocalDemoWorkspaceState(workspaceId);
    const shifts = mergeById(demo.salesShifts, local.salesShifts);
    const existingShift = shifts.find(
      (shift) => getShiftDate(shift) === parsed.data.shiftDate && shift.seller_id === demo.user.id,
    );

    if (existingShift) {
      return NextResponse.json({ error: "This seller already has a shift for this day." }, { status: 409 });
    }

    const shift = await saveLocalDemoSalesShift({
      workspaceId,
      shift: buildLocalDemoSalesShift(parsed.data, demo.tenant.id, demo.user.id),
    });

    return NextResponse.json({ data: shift, demo: true }, { status: 201 });
  }

  const { supabase, profile } = await getAuthenticatedApiProfile();

  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageFinance(profile.role)) {
    return NextResponse.json({ error: "Only administrators, receptionists, and pharmacists can open shifts." }, { status: 403 });
  }

  const { data: existingShift } = await supabase
    .from("sales_shifts")
    .select("id")
    .eq("tenant_id", profile.tenant_id)
    .eq("seller_id", profile.id)
    .eq("shift_date", parsed.data.shiftDate)
    .maybeSingle();

  if (existingShift) {
    return NextResponse.json({ error: "This seller already has a shift for this day." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("sales_shifts")
    .insert(buildSalesShiftOpenInsert(parsed.data, profile.tenant_id, profile.id))
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data }, { status: 201 });
}

function mergeById<T extends { id: string }>(base: T[], overrides: T[]) {
  const rows = new Map(base.map((item) => [item.id, item]));
  for (const item of overrides) rows.set(item.id, item);
  return Array.from(rows.values());
}

function getShiftDate(shift: { shift_date?: string; opened_at: string }) {
  return shift.shift_date ?? shift.opened_at.slice(0, 10);
}
