import Stripe from "stripe";
import { appConfig } from "@/lib/config";
import type {
  PaymentAdapter,
  PaymentIntentRequest,
  PaymentIntentResponse,
} from "@/lib/payments/types";
import { PaymentConfigurationError, medilinkReference } from "@/lib/payments/types";

function getStripeClient() {
  if (!appConfig.stripe.secretKey) {
    throw new PaymentConfigurationError("stripe", ["STRIPE_SECRET_KEY"]);
  }

  return new Stripe(appConfig.stripe.secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });
}

export const stripeAdapter: PaymentAdapter = {
  provider: "stripe",

  async createIntent(input: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const stripe = getStripeClient();
    const reference = medilinkReference("MLK-STR");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(input.amount),
      currency: input.currency.toLowerCase(),
      receipt_email: input.email,
      metadata: {
        reference,
        tenant_id: input.tenantId,
        appointment_id: input.appointmentId,
        patient_id: input.patientId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      provider: "stripe",
      reference,
      status: "processing",
      instructions: "Complete payment using the Stripe client secret.",
      checkoutUrl: paymentIntent.client_secret ?? undefined,
      raw: paymentIntent,
    };
  },

  async verify(reference: string): Promise<PaymentIntentResponse> {
    const stripe = getStripeClient();
    const results = await stripe.paymentIntents.search({
      query: `metadata['reference']:'${reference}'`,
      limit: 1,
    });
    const intent = results.data[0];

    return {
      provider: "stripe",
      reference,
      status: intent?.status === "succeeded" ? "paid" : "processing",
      raw: intent,
    };
  },
};
