import { appConfig } from "@/lib/config";
import type {
  PaymentAdapter,
  PaymentIntentRequest,
  PaymentIntentResponse,
} from "@/lib/payments/types";
import { PaymentConfigurationError, medilinkReference } from "@/lib/payments/types";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getFlutterwaveAccessToken() {
  const clientId = appConfig.flutterwave.clientId;
  const clientSecret = appConfig.flutterwave.clientSecret;
  const missing = [
    !clientId ? "FLUTTERWAVE_CLIENT_ID" : null,
    !clientSecret ? "FLUTTERWAVE_CLIENT_SECRET" : null,
  ].filter(Boolean) as string[];

  if (missing.length > 0 || !clientId || !clientSecret) {
    throw new PaymentConfigurationError("flutterwave", missing);
  }

  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }

  const response = await fetch(appConfig.flutterwave.authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    access_token?: string;
    expires_in?: number;
  } | null;

  if (!response.ok || !payload?.access_token) {
    throw new Error(`Flutterwave token request failed with ${response.status}`);
  }

  const expiresIn = Number(payload.expires_in ?? 600);
  cachedToken = {
    token: payload.access_token,
    expiresAt: Date.now() + Math.max(expiresIn - 60, 60) * 1000,
  };

  return cachedToken.token;
}

async function flutterwaveFetch<T>(
  path: string,
  options: RequestInit & { idempotencyKey?: string } = {},
) {
  const token = await getFlutterwaveAccessToken();
  const { headers, idempotencyKey, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Authorization", `Bearer ${token}`);
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("X-Trace-Id", crypto.randomUUID());

  if (idempotencyKey) {
    requestHeaders.set("X-Idempotency-Key", idempotencyKey);
  }

  const response = await fetch(`${appConfig.flutterwave.apiBaseUrl}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
  });

  const payload = (await response.json().catch(() => null)) as T;

  if (!response.ok) {
    throw new Error(`Flutterwave request failed with ${response.status}`);
  }

  return payload;
}

function ugandanNationalNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("256")) return digits.slice(3);
  if (digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export const flutterwaveAdapter: PaymentAdapter = {
  provider: "flutterwave",

  async createIntent(input: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const reference = medilinkReference("MLK-FLW");
    const [first = input.patientName, ...rest] = input.patientName.split(" ");
    const last = rest.join(" ") || "Patient";
    const phoneNumber = ugandanNationalNumber(input.phone);

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
          number: phoneNumber,
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
          phone_number: phoneNumber,
        },
      }),
    });

    const charge = await flutterwaveFetch<{
      data: {
        id: string;
        status?: string;
        next_action?: {
          payment_instruction?: { note?: string };
          redirect_url?: { url?: string };
        };
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
      checkoutUrl: charge.data.next_action?.redirect_url?.url,
      instructions:
        charge.data.next_action?.payment_instruction?.note ??
        (charge.data.next_action?.redirect_url?.url
          ? "Open the Flutterwave checkout link to complete this test payment."
          : undefined) ??
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
