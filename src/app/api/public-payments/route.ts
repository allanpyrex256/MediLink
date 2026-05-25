import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseAdminConfig, isDemoModeAllowed } from "@/lib/config";
import {
  getPublicTenantProfile,
  publicReference,
} from "@/lib/public-directory";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const publicPaymentSchema = z.object({
  tenantSlug: z.string().min(2),
  customerName: z.string().min(2),
  phone: z.string().min(7),
  amount: z.number().positive(),
  reason: z.string().min(3),
  provider: z.enum(["mtn_momo", "airtel_money"]),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const body = await request.json().catch(() => null);
  const parsed = publicPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payment request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const limited = rateLimit(`public-payments:${parsed.data.tenantSlug}:${ip}`, 20);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many payment requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const profile = await getPublicTenantProfile(parsed.data.tenantSlug);
  if (!profile) {
    return NextResponse.json({ error: "Business page not found" }, { status: 404 });
  }

  const reference = publicReference("MLK-PAY");

  if (!hasSupabaseAdminConfig()) {
    if (!isDemoModeAllowed()) {
      return NextResponse.json(
        { error: "Public payments need Supabase admin configuration." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        data: {
          reference,
          status: "pending",
          demo: true,
        },
      },
      { status: 201 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("payments").insert({
    tenant_id: profile.tenant.id,
    appointment_id: null,
    patient_id: null,
    provider: parsed.data.provider,
    provider_reference: reference,
    amount: parsed.data.amount,
    currency: "UGX",
    status: "pending",
    phone: parsed.data.phone,
    metadata: {
      source: "public_payment_page",
      customer_name: parsed.data.customerName,
      reason: parsed.data.reason,
      instructions:
        "Public customer payment request captured. Staff should reconcile or trigger provider collection.",
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("notifications").insert({
    tenant_id: profile.tenant.id,
    channel: "in_app",
    destination: profile.tenant.email,
    subject: "Public payment request received",
    body: `${parsed.data.customerName} requested to pay UGX ${parsed.data.amount.toLocaleString("en-UG")} for ${parsed.data.reason}. Phone: ${parsed.data.phone}. Reference: ${reference}.`,
    status: "queued",
  });

  return NextResponse.json(
    {
      data: {
        reference,
        status: "pending",
      },
    },
    { status: 201 },
  );
}
