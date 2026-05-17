import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { appConfig, hasSupabaseAdminConfig } from "@/lib/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  if (!appConfig.stripe.secretKey || !appConfig.stripe.webhookSecret) {
    return NextResponse.json({ received: true, configured: false });
  }

  const stripe = new Stripe(appConfig.stripe.secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 401 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      appConfig.stripe.webhookSecret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 401 });
  }

  if (event.type === "payment_intent.succeeded" && hasSupabaseAdminConfig()) {
    const intent = event.data.object as Stripe.PaymentIntent;
    const reference = intent.metadata.reference;
    if (reference) {
      const supabase = createSupabaseAdminClient();
      await supabase
        .from("payments")
        .update({ status: "paid", metadata: intent })
        .eq("provider", "stripe")
        .eq("provider_reference", reference);
    }
  }

  return NextResponse.json({ received: true });
}
