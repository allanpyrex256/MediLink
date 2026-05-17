import { appConfig } from "@/lib/config";
import type {
  PaymentAdapter,
  PaymentIntentRequest,
  PaymentIntentResponse,
} from "@/lib/payments/types";
import { PaymentConfigurationError, medilinkReference } from "@/lib/payments/types";

async function flutterwaveFetch<T>(
  path: string,
  options: RequestInit & { idempotencyKey?: string } = {},
) {
  if (!appConfig.flutterwave.secretKey) {
    throw new PaymentConfigurationError("flutterwave", [
      "FLUTTERWAVE_SECRET_KEY",
    ]);
  }

  const response = await fetch(`${appConfig.flutterwave.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${appConfig.flutterwave.secretKey}`,
      "Content-Type": "application/json",
      "X-Trace-Id": crypto.randomUUID(),
      ...(options.idempotencyKey
        ? { "X-Idempotency-Key": options.idempotencyKey }
        : {}),
      ...(options.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as T;

  if (!response.ok) {
    throw new Error(`Flutterwave request failed with ${response.status}`);
  }

  return payload;
}

export const flutterwaveAdapter: PaymentAdapter = {
  provider: "flutterwave",

  async createIntent(input: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const reference = medilinkReference("MLK-FLW");
    const [first = input.patientName, ...rest] = input.patientName.split(" ");
    const last = rest.join(" ") || "Patient";

    const customer = await flutterwaveFetch<{
      data: { id: string };
    }>("/customers", {
      method: "POST",
      idempotencyKey: `${reference}-customer`,
      body: JSON.stringify({
        email: input.email,
        name: { first, last },
        phone: {
          country_code: "256",
          number: input.phone.replace(/^\+?256/, ""),
        },
        meta: {
          tenant_id: input.tenantId,
          patient_id: input.patientId,
        },
      }),
    });

    const paymentMethod = await flutterwaveFetch<{
      data: { id: string };
    }>("/payment-methods", {
      method: "POST",
      idempotencyKey: `${reference}-method`,
      body: JSON.stringify({
        type: "mobile_money",
        mobile_money: {
          country_code: "256",
          network: input.network?.toUpperCase() ?? "MTN",
          phone_number: input.phone.replace(/^\+?256/, ""),
        },
      }),
    });

    const charge = await flutterwaveFetch<{
      data: {
        id: string;
        status?: string;
        next_action?: { payment_instruction?: { note?: string } };
      };
    }>("/charges", {
      method: "POST",
      idempotencyKey: `${reference}-charge`,
      body: JSON.stringify({
        currency: input.currency,
        customer_id: customer.data.id,
        payment_method_id: paymentMethod.data.id,
        amount: input.amount,
        reference,
        meta: {
          tenant_id: input.tenantId,
          appointment_id: input.appointmentId,
          patient_id: input.patientId,
          ...(input.metadata ?? {}),
        },
      }),
    });

    return {
      provider: "flutterwave",
      reference,
      status: charge.data.status === "succeeded" ? "paid" : "processing",
      instructions:
        charge.data.next_action?.payment_instruction?.note ??
        "Ask the patient to approve the mobile money prompt on their phone.",
      raw: charge,
    };
  },

  async verify(reference: string): Promise<PaymentIntentResponse> {
    const charge = await flutterwaveFetch<{
      data: { status?: string; id?: string };
    }>(`/charges/${reference}`, { method: "GET" });

    return {
      provider: "flutterwave",
      reference,
      status: charge.data.status === "succeeded" ? "paid" : "processing",
      raw: charge,
    };
  },
};
