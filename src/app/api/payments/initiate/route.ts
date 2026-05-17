import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseConfig } from "@/lib/config";
import { createPaymentIntent } from "@/lib/payments/service";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const paymentSchema = z.object({
  tenantId: z.string().uuid(),
  appointmentId: z.string().min(1),
  patientId: z.string().min(1),
  provider: z.enum(["flutterwave", "mtn_momo", "airtel_money", "stripe"]),
  amount: z.number().positive(),
  currency: z.string().default("UGX"),
  phone: z.string().min(7),
  email: z.string().email(),
  patientName: z.string().min(2),
  network: z.enum(["mtn", "airtel"]).optional(),
});

const webhookPath = {
  flutterwave: "flutterwave",
  mtn_momo: "mtn",
  airtel_money: "airtel",
  stripe: "stripe",
} as const;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`payments:${ip}`, 20);

  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many payment attempts. Please try again shortly." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = paymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payment payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>> | null = null;
  let paymentAppointmentId: string | null = parsed.data.appointmentId;
  let paymentPatientId: string | null = parsed.data.patientId;
  let paymentMetadata: Record<string, unknown> = {};

  if (hasSupabaseConfig()) {
    supabase = await createSupabaseServerClient();
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

    const { data: tenant } = await supabase
      .from("tenants")
      .select("tenant_kind")
      .eq("id", parsed.data.tenantId)
      .single();

    if (tenant?.tenant_kind === "pharmacy" && parsed.data.appointmentId.startsWith("rx-")) {
      const orderId = parsed.data.appointmentId.slice(3);
      const { data: prescription } = await supabase
        .from("prescription_orders")
        .select("id, tenant_id, patient_name, total_amount")
        .eq("id", orderId)
        .eq("tenant_id", parsed.data.tenantId)
        .single();

      if (!prescription) {
        return NextResponse.json(
          { error: "Prescription order does not belong to this pharmacy." },
          { status: 404 },
        );
      }

      paymentAppointmentId = null;
      paymentPatientId = null;
      paymentMetadata = {
        prescription_order_id: prescription.id,
        prescription_patient_name: prescription.patient_name,
      };
    } else {
      const { data: appointment } = await supabase
        .from("appointments")
        .select("id, tenant_id, patient_id, fee")
        .eq("id", parsed.data.appointmentId)
        .eq("tenant_id", parsed.data.tenantId)
        .single();

      if (!appointment || appointment.patient_id !== parsed.data.patientId) {
        return NextResponse.json(
          { error: "Appointment does not belong to this tenant or patient." },
          { status: 404 },
        );
      }
    }
  }

  const intent = await createPaymentIntent({
    ...parsed.data,
    callbackUrl: `${request.nextUrl.origin}/api/payments/webhook/${webhookPath[parsed.data.provider]}`,
  });

  if (supabase) {
    await supabase.from("payments").insert({
      tenant_id: parsed.data.tenantId,
      appointment_id: paymentAppointmentId,
      patient_id: paymentPatientId,
      provider: parsed.data.provider,
      provider_reference: intent.reference,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      status: intent.status,
      phone: parsed.data.phone,
      metadata: {
        ...paymentMetadata,
        instructions: intent.instructions,
        raw: intent.raw,
      },
    });
  }

  return NextResponse.json({ data: intent }, { status: 201 });
}
