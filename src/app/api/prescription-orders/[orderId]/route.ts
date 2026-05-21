import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import { sendWhatsApp } from "@/lib/notifications/whatsapp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PrescriptionOrder, Tenant, UserRole } from "@/lib/types";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

const orderActionSchema = z.object({
  action: z.literal("mark_ready"),
});

const pharmacyOrderRoles: UserRole[] = [
  "admin",
  "doctor",
  "dentist",
  "receptionist",
  "pharmacist",
];

type PrescriptionOrderWithTenant = PrescriptionOrder & {
  tenant?: Tenant;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { orderId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = orderActionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid prescription order action." }, { status: 400 });
  }

  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Prescription order notifications need Supabase admin configuration." },
      { status: 503 },
    );
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

  const canManage =
    Boolean(profile.is_platform_admin) ||
    pharmacyOrderRoles.includes(profile.role as UserRole);

  if (!canManage) {
    return NextResponse.json(
      { error: "Only pharmacy or care staff can update prescription orders." },
      { status: 403 },
    );
  }

  const admin = createSupabaseAdminClient();
  const { data: existing } = await admin
    .from("prescription_orders")
    .select("*, tenant:tenants(*)")
    .eq("id", orderId)
    .single();
  const order = existing as PrescriptionOrderWithTenant | null;

  if (!order) {
    return NextResponse.json({ error: "Prescription order not found." }, { status: 404 });
  }

  if (!profile.is_platform_admin && profile.tenant_id !== order.tenant_id) {
    return NextResponse.json(
      { error: "Prescription order does not belong to your workspace." },
      { status: 403 },
    );
  }

  if (!order.customer_phone) {
    return NextResponse.json(
      { error: "This order has no customer phone number for WhatsApp notification." },
      { status: 400 },
    );
  }
  const customerPhone = order.customer_phone;

  const { data: updated, error: updateError } = await admin
    .from("prescription_orders")
    .update({ status: "ready" })
    .eq("id", order.id)
    .select("*, tenant:tenants(*)")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const readyOrder = updated as PrescriptionOrderWithTenant;
  const notificationBody = readyMessage(readyOrder);
  const notificationSubject =
    readyOrder.fulfillment_method === "delivery"
      ? "Medicine ready for delivery"
      : "Medicine ready for pickup";
  const sentAt = new Date().toISOString();
  let notificationStatus: "sent" | "failed" = "sent";
  let providerMessageId: string | null = null;
  let notificationError: string | null = null;

  try {
    const result = await sendWhatsApp({
      to: customerPhone,
      body: notificationBody,
    });
    providerMessageId = whatsappProviderMessageId(result);

    await admin
      .from("prescription_orders")
      .update({ ready_notification_sent_at: sentAt })
      .eq("id", readyOrder.id);

    readyOrder.ready_notification_sent_at = sentAt;
  } catch (caught) {
    notificationStatus = "failed";
    notificationError =
      caught instanceof Error ? caught.message : "Unable to send WhatsApp notification.";
  }

  await admin.from("notifications").insert({
    tenant_id: readyOrder.tenant_id,
    channel: "whatsapp",
    destination: customerPhone,
    subject: notificationSubject,
    body: notificationBody,
    status: notificationStatus,
    provider_message_id: providerMessageId,
  });

  return NextResponse.json({
    data: readyOrder,
    notification: {
      status: notificationStatus,
      message:
        notificationStatus === "sent"
          ? "Customer notified on WhatsApp."
          : `Order marked ready, but WhatsApp failed: ${notificationError}`,
    },
  });
}

function readyMessage(order: PrescriptionOrderWithTenant) {
  const pharmacyName = order.tenant?.name ?? "the pharmacy";
  const medicine = `${order.quantity} x ${order.medicine}`;

  if (order.fulfillment_method === "delivery") {
    return `${pharmacyName}: your medicine order (${medicine}) is ready for delivery to ${order.delivery_address ?? "your delivery address"}.`;
  }

  return `${pharmacyName}: your medicine order (${medicine}) is ready for pickup.`;
}

function whatsappProviderMessageId(result: unknown) {
  if (!result || typeof result !== "object") return null;

  const messages = (result as { messages?: Array<{ id?: string }> }).messages;
  return messages?.[0]?.id ?? null;
}
