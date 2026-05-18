import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/config";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import {
  hydrateLocalDemoDashboardData,
  saveLocalDemoPatient,
} from "@/lib/local-demo-store";
import {
  buildLocalDemoPatient,
  buildPatientInsert,
  patientCreateSchema,
} from "@/lib/patients";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const staffRoles = ["admin", "doctor", "dentist", "receptionist"] as const;

export async function GET(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = await hydrateLocalDemoDashboardData(
      buildDemoDashboardData(workspaceId),
      workspaceId,
    );

    return NextResponse.json({ data: demo.patients, demo: true });
  }

  const supabase = await createSupabaseServerClient();
  const profile = await getAuthenticatedProfile(supabase);

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`patients:${ip}`, 40);

  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many patient requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = patientCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid patient details", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = buildDemoDashboardData(workspaceId);
    const patient = await saveLocalDemoPatient({
      workspaceId,
      patient: buildLocalDemoPatient(parsed.data, demo.tenant.id),
    });

    return NextResponse.json({ data: patient, demo: true }, { status: 201 });
  }

  const supabase = await createSupabaseServerClient();
  const profile = await getAuthenticatedProfile(supabase);

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManagePatients(profile.role)) {
    return NextResponse.json({ error: "Only authorized care staff can add patients." }, { status: 403 });
  }

  const insert = buildPatientInsert(parsed.data, profile.tenant_id);
  const { data, error } = await supabase
    .from("patients")
    .insert(insert)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

function canManagePatients(role: string) {
  return staffRoles.some((staffRole) => staffRole === role);
}

async function getAuthenticatedProfile(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  return profile as { tenant_id: string; role: (typeof staffRoles)[number] | "pharmacist" | "patient" } | null;
}
