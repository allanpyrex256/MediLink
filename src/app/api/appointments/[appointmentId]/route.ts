import { NextRequest, NextResponse } from "next/server";
import {
  appointmentDecisionSchema,
  isSlotAvailable,
} from "@/lib/appointments";
import { hasSupabaseConfig, isDemoModeAllowed } from "@/lib/config";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import {
  hydrateLocalDemoDashboardData,
  saveLocalDemoAppointment,
  saveLocalDemoNotification,
} from "@/lib/local-demo-store";
import { sendAppointmentConfirmation } from "@/lib/notifications/service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Appointment, Doctor, Patient, Tenant, UserRole } from "@/lib/types";

type RouteContext = {
  params: Promise<{ appointmentId: string }>;
};

const decisionRoles: UserRole[] = ["admin", "doctor", "dentist", "receptionist"];

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { appointmentId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = appointmentDecisionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid appointment decision", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.action === "reschedule" && !parsed.data.scheduledAt) {
    return NextResponse.json(
      { error: "Choose a new appointment date and time before rescheduling." },
      { status: 400 },
    );
  }

  if (!hasSupabaseConfig()) {
    if (!isDemoModeAllowed()) {
      return NextResponse.json(
        { error: "Appointments need Supabase configuration." },
        { status: 503 },
      );
    }

    return updateLocalDemoAppointment(request, appointmentId, parsed.data);
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
    .select("tenant_id, role, is_platform_admin")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 401 });
  }

  const { data: appointment } = await supabase
    .from("appointments")
    .select("*, patient:patients(*), doctor:doctors(*), tenant:tenants(*)")
    .eq("id", appointmentId)
    .single();

  const current = appointment as
    | (Appointment & { patient?: Patient; doctor?: Doctor; tenant?: Tenant })
    | null;

  if (!current) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const isPlatformAdmin = Boolean(profile.is_platform_admin);
  const canDecide =
    isPlatformAdmin ||
    (profile.tenant_id === current.tenant_id &&
      decisionRoles.includes(profile.role as UserRole));

  if (!canDecide) {
    return NextResponse.json(
      { error: "Only authorized care staff can approve or reschedule appointments." },
      { status: 403 },
    );
  }

  const nextScheduledAt = parsed.data.scheduledAt ?? current.scheduled_at;

  if (parsed.data.action === "reschedule") {
    const { data: existing } = await supabase
      .from("appointments")
      .select("*")
      .eq("tenant_id", current.tenant_id)
      .eq("doctor_id", current.doctor_id)
      .neq("id", appointmentId)
      .in("status", ["pending", "confirmed"]);

    const available = isSlotAvailable(
      (existing ?? []) as Appointment[],
      current.doctor_id,
      nextScheduledAt,
      current.duration_minutes,
    );

    if (!available) {
      return NextResponse.json(
        { error: "That new appointment time is not available." },
        { status: 409 },
      );
    }
  }

  const decisionNote = decisionNotes(current.notes, parsed.data.note);
  const { data: updated, error } = await supabase
    .from("appointments")
    .update({
      status: "confirmed",
      scheduled_at: nextScheduledAt,
      notes: decisionNote,
    })
    .eq("id", appointmentId)
    .select("*, patient:patients(*), doctor:doctors(*), tenant:tenants(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const decided = updated as Appointment & {
    patient?: Patient;
    doctor?: Doctor;
    tenant?: Tenant;
  };
  const notificationBody = appointmentNotificationBody(
    parsed.data.action,
    decided.tenant ?? current.tenant,
    decided.doctor ?? current.doctor,
    decided,
  );

  if (decided.patient) {
    await supabase.from("notifications").insert({
      tenant_id: decided.tenant_id,
      patient_id: decided.patient_id,
      appointment_id: decided.id,
      channel: "sms",
      destination: decided.patient.phone,
      subject:
        parsed.data.action === "reschedule"
          ? "Appointment rescheduled"
          : "Appointment approved",
      body: notificationBody,
      status: "queued",
    });
  }

  if (decided.tenant && decided.doctor && decided.patient) {
    await sendAppointmentConfirmation({
      tenant: decided.tenant,
      appointment: decided,
      doctor: decided.doctor,
      patient: decided.patient,
    });
  }

  return NextResponse.json({
    data: decided,
    notification: notificationBody,
  });
}

async function updateLocalDemoAppointment(
  request: NextRequest,
  appointmentId: string,
  decision: {
    action: "approve" | "reschedule";
    scheduledAt?: string;
    note?: string;
  },
) {
  const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
  const demo = await hydrateLocalDemoDashboardData(
    buildDemoDashboardData(workspaceId),
    workspaceId,
  );
  const appointment = demo.appointments.find((item) => item.id === appointmentId);

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const nextScheduledAt = decision.scheduledAt ?? appointment.scheduled_at;

  if (decision.action === "reschedule") {
    const available = isSlotAvailable(
      demo.appointments.filter((item) => item.id !== appointment.id),
      appointment.doctor_id,
      nextScheduledAt,
      appointment.duration_minutes,
    );

    if (!available) {
      return NextResponse.json(
        { error: "That new appointment time is not available." },
        { status: 409 },
      );
    }
  }

  const updatedAppointment: Appointment = {
    ...appointment,
    scheduled_at: nextScheduledAt,
    status: "confirmed",
    notes: decisionNotes(appointment.notes, decision.note),
  };
  const storedAppointment = await saveLocalDemoAppointment({
    workspaceId,
    appointment: updatedAppointment,
  });
  const notificationBody = appointmentNotificationBody(
    decision.action,
    demo.tenant,
    appointment.doctor,
    updatedAppointment,
  );

  await saveLocalDemoNotification({
    workspaceId,
    notification: {
      id: `local-not-${crypto.randomUUID()}`,
      tenant_id: appointment.tenant_id,
      user_id: null,
      patient_id: appointment.patient_id,
      appointment_id: appointment.id,
      channel: "sms",
      destination: appointment.patient?.phone ?? "patient phone",
      subject:
        decision.action === "reschedule"
          ? "Appointment rescheduled"
          : "Appointment approved",
      body: notificationBody,
      status: "queued",
      created_at: new Date().toISOString(),
    },
  });

  return NextResponse.json({
    data: storedAppointment,
    demo: true,
    notification: notificationBody,
  });
}

function decisionNotes(existingNotes: string | null, note?: string) {
  if (!note) return existingNotes;

  return [existingNotes, `Staff note: ${note}`].filter(Boolean).join("\n");
}

function appointmentNotificationBody(
  action: "approve" | "reschedule",
  tenant: Tenant | undefined,
  doctor: Doctor | undefined,
  appointment: Appointment,
) {
  const when = new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(appointment.scheduled_at));
  const facility = tenant?.name ?? "the facility";
  const doctorName = doctor?.full_name ? ` with ${doctor.full_name}` : "";

  if (action === "reschedule") {
    return `Your appointment at ${facility}${doctorName} has been rescheduled to ${when}.`;
  }

  return `Your appointment at ${facility}${doctorName} has been approved for ${when}.`;
}
