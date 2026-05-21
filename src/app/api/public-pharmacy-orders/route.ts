import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseAdminConfig } from "@/lib/config";
import {
  getPublicTenantProfile,
  publicFulfillmentDate,
  publicReference,
} from "@/lib/public-directory";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const publicPharmacyOrderSchema = z.object({
  tenantSlug: z.string().min(2),
  customerName: z.string().min(2),
  phone: z.string().min(7),
  medicine: z.string().min(2),
  quantity: z.number().int().positive(),
  prescriber: z.string().optional(),
  pickupOption: z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.enum(["mtn_momo", "airtel_money", "cash"]),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const body = await request.json().catch(() => null);
  const parsed = publicPharmacyOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid medicine request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const deliveryAddress = parsed.data.deliveryAddress?.trim() ?? "";

  if (parsed.data.pickupOption === "delivery" && !deliveryAddress) {
    return NextResponse.json(
      { error: "Delivery address is required for medicine delivery requests." },
      { status: 400 },
    );
  }

  const limited = rateLimit(`public-pharmacy:${parsed.data.tenantSlug}:${ip}`, 20);
  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many medicine requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const profile = await getPublicTenantProfile(parsed.data.tenantSlug);
  if (!profile) {
    return NextResponse.json({ error: "Business page not found" }, { status: 404 });
  }

  const reference = publicReference("MLK-RX");

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      {
        data: {
          reference,
          status: "received",
          demo: true,
          fulfillmentMethod: parsed.data.pickupOption,
          deliveryAddress: parsed.data.pickupOption === "delivery" ? deliveryAddress : null,
        },
      },
      { status: 201 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase
    .from("prescription_orders")
    .insert({
      tenant_id: profile.tenant.id,
      patient_name: parsed.data.customerName,
      customer_phone: parsed.data.phone,
      prescriber: parsed.data.prescriber || "Customer request",
      medicine: parsed.data.medicine,
      quantity: parsed.data.quantity,
      status: "received",
      total_amount: 0,
      fulfillment_due: publicFulfillmentDate(),
      fulfillment_method: parsed.data.pickupOption,
      delivery_address: parsed.data.pickupOption === "delivery" ? deliveryAddress : null,
      payment_method: parsed.data.paymentMethod,
      customer_notes: parsed.data.notes || null,
      created_by: null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("notifications").insert({
    tenant_id: profile.tenant.id,
    channel: "in_app",
    destination: profile.tenant.email,
    subject: "Public medicine request received",
    body: `${parsed.data.customerName} requested ${parsed.data.quantity} x ${parsed.data.medicine}. Phone: ${parsed.data.phone}. ${fulfillmentSummary(parsed.data.pickupOption, deliveryAddress)} Payment: ${paymentLabel(parsed.data.paymentMethod)}. Notes: ${parsed.data.notes || "None"}. Reference: ${reference}.`,
    status: "queued",
  });

  return NextResponse.json(
    {
      data: {
        ...order,
        reference,
      },
    },
    { status: 201 },
  );
}

function fulfillmentSummary(method: "pickup" | "delivery", deliveryAddress: string) {
  if (method === "delivery") {
    return `Delivery address: ${deliveryAddress}.`;
  }

  return "Customer will pick up at the pharmacy.";
}

function paymentLabel(method: "mtn_momo" | "airtel_money" | "cash") {
  if (method === "mtn_momo") return "MTN MoMo";
  if (method === "airtel_money") return "Airtel Money";
  return "Cash";
}
