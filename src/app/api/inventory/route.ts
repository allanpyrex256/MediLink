import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/config";
import {
  buildInventoryInsert,
  buildLocalDemoInventoryItem,
  inventoryCreateSchema,
} from "@/lib/dashboard-create";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import { canManagePharmacy, getAuthenticatedApiProfile } from "@/lib/api-profile";
import { saveLocalDemoInventoryItem } from "@/lib/local-demo-store";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`inventory:${ip}`, 40);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many inventory requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = inventoryCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid inventory details", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = buildDemoDashboardData(workspaceId);
    const item = await saveLocalDemoInventoryItem({
      workspaceId,
      item: buildLocalDemoInventoryItem(parsed.data, demo.tenant.id),
    });

    return NextResponse.json({ data: item, demo: true }, { status: 201 });
  }

  const { supabase, profile } = await getAuthenticatedApiProfile();

  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManagePharmacy(profile.role)) {
    return NextResponse.json({ error: "Only administrators and pharmacists can add stock." }, { status: 403 });
  }

  const insert = buildInventoryInsert(parsed.data, profile.tenant_id);
  let { data, error } = await supabase
    .from("inventory_items")
    .insert(insert)
    .select("*")
    .single();

  if (error && isMissingUnitCostColumn(error.message)) {
    const legacyInsert = omitUnitCost(insert);
    const retry = await supabase
      .from("inventory_items")
      .insert(legacyInsert)
      .select("*")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data }, { status: 201 });
}

function isMissingUnitCostColumn(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("unit_cost") && normalized.includes("column");
}

function omitUnitCost<T extends { unit_cost?: number }>(insert: T) {
  const legacyInsert = { ...insert };
  delete legacyInsert.unit_cost;
  return legacyInsert;
}
