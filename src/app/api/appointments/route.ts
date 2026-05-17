import { NextRequest, NextResponse } from "next/server";
import { appointmentCreateSchema, isSlotAvailable } from "@/lib/appointments";
import { hasSupabaseConfig } from "@/lib/config";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import {
  hydrateLocalDemoDashboardData,
  saveLocalDemoAppointment,
} from "@/lib/local-demo-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
  const demo = await hydrateLocalDemoDashboardData(
    buildDemoDashboardData(workspaceId),
    workspaceId,
  );
  return NextResponse.json({ data: demo.appointments });
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`appointments:${ip}`, 30);

  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many appointment requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = appointmentCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid appointment payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = await hydrateLocalDemoDashboardData(
      buildDemoDashboardData(workspaceId),
      workspaceId,
    );
    const available = isSlotAvailable(
      demo.appointments,
      parsed.data.doctorId,
      parsed.data.scheduledAt,
      parsed.data.durationMinutes,
    );

    if (!available) {
      return NextResponse.json(
        { error: "This appointment slot is no longer available." },
        { status: 409 },
      );
    }

    const appointment = await saveLocalDemoAppointment({
      workspaceId,
      appointment: {
        id: `local-apt-${crypto.randomUUID()}`,
        tenant_id: parsed.data.tenantId,
        doctor_id: parsed.data.doctorId,
        patient_id: parsed.data.patientId,
        scheduled_at: parsed.data.scheduledAt,
        duration_minutes: parsed.data.durationMinutes,
        reason: parsed.data.reason,
        notes: "Created from the local demo admin portal.",
        fee: parsed.data.fee,
        status: "pending",
        payment_status: "pending",
        created_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({ data: appointment, demo: true }, { status: 201 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.tenant_id !== parsed.data.tenantId) {
    return NextResponse.json({ error: "Forbidden tenant" }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from("appointments")
    .select("*")
    .eq("tenant_id", parsed.data.tenantId)
    .eq("doctor_id", parsed.data.doctorId)
    .in("status", ["pending", "confirmed"]);

  const available = isSlotAvailable(
    existing ?? [],
    parsed.data.doctorId,
    parsed.data.scheduledAt,
    parsed.data.durationMinutes,
  );

  if (!available) {
    return NextResponse.json(
      { error: "This appointment slot is already booked." },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      tenant_id: parsed.data.tenantId,
      doctor_id: parsed.data.doctorId,
      patient_id: parsed.data.patientId,
      scheduled_at: parsed.data.scheduledAt,
      duration_minutes: parsed.data.durationMinutes,
      reason: parsed.data.reason,
      fee: parsed.data.fee,
      status: "pending",
      payment_status: "pending",
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
