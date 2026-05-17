import { isLocalDemoPaymentAllowed } from "@/lib/config";
import { airtelMoneyAdapter } from "@/lib/payments/airtel";
import { flutterwaveAdapter } from "@/lib/payments/flutterwave";
import { mtnMomoAdapter } from "@/lib/payments/mtn";
import { stripeAdapter } from "@/lib/payments/stripe";
import type {
  PaymentAdapter,
  PaymentIntentRequest,
  PaymentIntentResponse,
} from "@/lib/payments/types";
import { PaymentConfigurationError, medilinkReference } from "@/lib/payments/types";
import type { PaymentProvider } from "@/lib/types";

const adapters: Record<PaymentProvider, PaymentAdapter> = {
  flutterwave: flutterwaveAdapter,
  mtn_momo: mtnMomoAdapter,
  airtel_money: airtelMoneyAdapter,
  stripe: stripeAdapter,
};

export async function createPaymentIntent(
  input: PaymentIntentRequest,
): Promise<PaymentIntentResponse> {
  try {
    return await adapters[input.provider].createIntent(input);
  } catch (error) {
    if (error instanceof PaymentConfigurationError && isLocalDemoPaymentAllowed()) {
      return {
        provider: input.provider,
        reference: medilinkReference("MLK-DEMO"),
        status: "processing",
        instructions:
          "Demo mode: provider credentials are not configured, so no real mobile money prompt was sent.",
        raw: {
          demo: true,
          missingConfiguration: error.message,
        },
      };
    }

    throw error;
  }
}

export async function verifyPayment(provider: PaymentProvider, reference: string) {
  return adapters[provider].verify(reference);
}
