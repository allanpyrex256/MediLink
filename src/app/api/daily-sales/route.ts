import { NextRequest, NextResponse } from "next/server";
import { canManageFinance, getAuthenticatedApiProfile } from "@/lib/api-profile";
import { hasSupabaseConfig } from "@/lib/config";
import {
  buildDailySaleInsert,
  buildLocalDemoDailySale,
  dailySaleCreateSchema,
} from "@/lib/dashboard-create";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import { saveLocalDemoDailySale } from "@/lib/local-demo-store";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`daily-sales:${ip}`, 60);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many sales requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = dailySaleCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid sale details", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = buildDemoDashboardData(workspaceId);
    const sale = await saveLocalDemoDailySale({
      workspaceId,
      sale: buildLocalDemoDailySale(parsed.data, demo.tenant.id, demo.user.id),
    });

    return NextResponse.json({ data: sale, demo: true }, { status: 201 });
  }

  const { supabase, profile } = await getAuthenticatedApiProfile();

  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageFinance(profile.role)) {
    return NextResponse.json({ error: "Only administrators, receptionists, and pharmacists can record sales." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("daily_sales")
    .insert(buildDailySaleInsert(parsed.data, profile.tenant_id, profile.id))
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data }, { status: 201 });
}
