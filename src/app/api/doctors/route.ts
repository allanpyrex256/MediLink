import { NextRequest, NextResponse } from "next/server";
import { canManageClinicalSetup, getAuthenticatedApiProfile } from "@/lib/api-profile";
import { hasSupabaseConfig } from "@/lib/config";
import {
  buildDoctorInsert,
  buildLocalDemoDoctor,
  doctorCreateSchema,
} from "@/lib/dashboard-create";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import { saveLocalDemoDoctor } from "@/lib/local-demo-store";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`doctors:${ip}`, 25);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many doctor requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = doctorCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid doctor details", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = buildDemoDashboardData(workspaceId);
    const doctor = await saveLocalDemoDoctor({
      workspaceId,
      doctor: buildLocalDemoDoctor(parsed.data, demo.tenant.id),
    });

    return NextResponse.json({ data: doctor, demo: true }, { status: 201 });
  }

  const { supabase, profile } = await getAuthenticatedApiProfile();

  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageClinicalSetup(profile.role)) {
    return NextResponse.json({ error: "Only administrators can add doctors." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("doctors")
    .insert(buildDoctorInsert(parsed.data, profile.tenant_id))
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data }, { status: 201 });
}
