import { NextRequest, NextResponse } from "next/server";
import { canManageClinicalSetup, getAuthenticatedApiProfile } from "@/lib/api-profile";
import { hasSupabaseConfig } from "@/lib/config";
import {
  branchCreateSchema,
  buildBranchInsert,
  buildLocalDemoBranch,
} from "@/lib/dashboard-create";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import { saveLocalDemoBranch } from "@/lib/local-demo-store";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`branches:${ip}`, 25);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many branch requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = branchCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid branch details", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = buildDemoDashboardData(workspaceId);
    const branch = await saveLocalDemoBranch({
      workspaceId,
      branch: buildLocalDemoBranch(parsed.data, demo.tenant.id),
    });

    return NextResponse.json({ data: branch, demo: true }, { status: 201 });
  }

  const { supabase, profile } = await getAuthenticatedApiProfile();

  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageClinicalSetup(profile.role)) {
    return NextResponse.json({ error: "Only administrators can add branches." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("branches")
    .insert(buildBranchInsert(parsed.data, profile.tenant_id))
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data }, { status: 201 });
}
