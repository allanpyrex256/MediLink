import { appConfig } from "@/lib/config";
import type {
  PaymentAdapter,
  PaymentIntentRequest,
  PaymentIntentResponse,
} from "@/lib/payments/types";
import { PaymentConfigurationError, medilinkReference } from "@/lib/payments/types";

function assertMtnConfig() {
  const missing = [
    ["MTN_MOMO_SUBSCRIPTION_KEY", appConfig.mtn.subscriptionKey],
    ["MTN_MOMO_API_USER", appConfig.mtn.apiUser],
    ["MTN_MOMO_API_KEY", appConfig.mtn.apiKey],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => String(name));

  if (missing.length) {
    throw new PaymentConfigurationError("mtn_momo", missing);
  }
}

async function getMtnToken() {
  assertMtnConfig();

  const credentials = Buffer.from(
    `${appConfig.mtn.apiUser}:${appConfig.mtn.apiKey}`,
  ).toString("base64");

  const response = await fetch(`${appConfig.mtn.baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Ocp-Apim-Subscription-Key": appConfig.mtn.subscriptionKey as string,
    },
  });

  const payload = (await response.json().catch(() => null)) as {
    access_token?: string;
  } | null;

  if (!response.ok || !payload?.access_token) {
    throw new Error("Unable to get MTN MoMo access token");
  }

  return payload.access_token;
}

export const mtnMomoAdapter: PaymentAdapter = {
  provider: "mtn_momo",

  async createIntent(input: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const token = await getMtnToken();
    const reference = medilinkReference("MLK-MTN");
    const payerNumber = input.phone.replace(/^\+?256/, "256").replace(/\D/g, "");

    const response = await fetch(
      `${appConfig.mtn.baseUrl}/collection/v1_0/requesttopay`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Reference-Id": reference,
          "X-Target-Environment": appConfig.mtn.targetEnvironment,
          "Ocp-Apim-Subscription-Key": appConfig.mtn.subscriptionKey as string,
        },
        body: JSON.stringify({
          amount: String(input.amount),
          currency: input.currency,
          externalId: input.appointmentId,
          payer: {
            partyIdType: "MSISDN",
            partyId: payerNumber,
          },
          payerMessage: "Appointment payment",
          payeeNote: `Appointment ${input.appointmentId}`,
        }),
      },
    );

    if (!response.ok && response.status !== 202) {
      throw new Error(`MTN MoMo RequestToPay failed with ${response.status}`);
    }

    return {
      provider: "mtn_momo",
      reference,
      status: "processing",
      instructions:
        "An MTN Mobile Money approval prompt has been sent to the patient.",
      raw: { httpStatus: response.status },
    };
  },

  async verify(reference: string): Promise<PaymentIntentResponse> {
    const token = await getMtnToken();
    const response = await fetch(
      `${appConfig.mtn.baseUrl}/collection/v1_0/requesttopay/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": appConfig.mtn.targetEnvironment,
          "Ocp-Apim-Subscription-Key": appConfig.mtn.subscriptionKey as string,
        },
      },
    );

    const payload = (await response.json().catch(() => null)) as {
      status?: "SUCCESSFUL" | "FAILED" | "PENDING";
    } | null;

    if (!response.ok) {
      throw new Error(`MTN MoMo status lookup failed with ${response.status}`);
    }

    return {
      provider: "mtn_momo",
      reference,
      status:
        payload?.status === "SUCCESSFUL"
          ? "paid"
          : payload?.status === "FAILED"
            ? "failed"
            : "processing",
      raw: payload,
    };
  },
};
