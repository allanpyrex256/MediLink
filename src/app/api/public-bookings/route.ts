import { NextRequest, NextResponse } from "next/server";
import {
  isSlotAvailable,
  publicAppointmentCreateSchema,
} from "@/lib/appointments";
import { hasSupabaseAdminConfig } from "@/lib/config";
import { saveLocalDemoPublicBooking } from "@/lib/local-demo-store";
import { demoWorkspaceIdForSlug, getPublicBookingData } from "@/lib/public-booking";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const body = await request.json().catch(() => null);
  const parsed = publicAppointmentCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking details", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const limited = rateLimit(`public-bookings:${parsed.data.tenantSlug}:${ip}`, 20);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many booking requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const bookingData = await getPublicBookingData(parsed.data.tenantSlug);
  if (!bookingData) {
    return NextResponse.json({ error: "Booking page not found" }, { status: 404 });
  }

  const doctor = bookingData.doctors.find((item) => item.id === parsed.data.doctorId);
  if (!doctor) {
    return NextResponse.json({ error: "Selected doctor is unavailable" }, { status: 404 });
  }

  const available = isSlotAvailable(
    bookingData.bookedAppointments,
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

  if (!hasSupabaseAdminConfig()) {
    const workspaceId = demoWorkspaceIdForSlug(parsed.data.tenantSlug);
    if (!workspaceId) {
      return NextResponse.json({ error: "Booking page not found" }, { status: 404 });
    }

    const stored = await saveLocalDemoPublicBooking({
      workspaceId,
      tenant: bookingData.tenant,
      doctor,
      patientName: parsed.data.patientName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      sex: parsed.data.sex,
      dateOfBirth: parsed.data.dateOfBirth,
      scheduledAt: parsed.data.scheduledAt,
      durationMinutes: parsed.data.durationMinutes,
      reason: parsed.data.reason,
    });

    return NextResponse.json(
      {
        data: {
          id: stored.appointment.id,
          tenantId: bookingData.tenant.id,
          doctorId: parsed.data.doctorId,
          scheduledAt: parsed.data.scheduledAt,
          durationMinutes: parsed.data.durationMinutes,
          reason: parsed.data.reason,
          patientName: parsed.data.patientName,
          phone: parsed.data.phone,
          status: "pending",
          paymentStatus: "pending",
          confirmationReference: stored.confirmationReference,
        },
        demo: true,
      },
      { status: 201 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data: existingPatient } = await supabase
    .from("patients")
    .select("*")
    .eq("tenant_id", bookingData.tenant.id)
    .eq("phone", parsed.data.phone)
    .maybeSingle();

  const patient =
    existingPatient ??
    (
      await supabase
        .from("patients")
        .insert({
          tenant_id: bookingData.tenant.id,
          full_name: parsed.data.patientName,
          phone: parsed.data.phone,
          email: parsed.data.email ?? null,
          sex: parsed.data.sex,
          date_of_birth: parsed.data.dateOfBirth ?? null,
          medical_history: [],
          allergies: [],
        })
        .select("*")
        .single()
    ).data;

  if (!patient) {
    return NextResponse.json(
      { error: "Unable to create patient record for this booking." },
      { status: 400 },
    );
  }

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      tenant_id: bookingData.tenant.id,
      doctor_id: parsed.data.doctorId,
      patient_id: patient.id,
      scheduled_at: parsed.data.scheduledAt,
      duration_minutes: parsed.data.durationMinutes,
      reason: parsed.data.reason,
      notes: "Booked from the public MediLink booking page.",
      fee: doctor.consultation_fee,
      status: "pending",
      payment_status: "pending",
      created_by: null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("notifications").insert({
    tenant_id: bookingData.tenant.id,
    patient_id: patient.id,
    appointment_id: appointment.id,
    channel: "sms",
    destination: parsed.data.phone,
    subject: "Appointment request received",
    body: `Your appointment request at ${bookingData.tenant.name} has been received and is pending confirmation.`,
    status: "queued",
  });

  return NextResponse.json(
    {
      data: {
        ...appointment,
        confirmationReference: `MLK-${String(appointment.id).slice(0, 8).toUpperCase()}`,
      },
    },
    { status: 201 },
  );
}
