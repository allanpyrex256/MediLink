import { appConfig } from "@/lib/config";
import type {
  PaymentAdapter,
  PaymentIntentRequest,
  PaymentIntentResponse,
} from "@/lib/payments/types";
import { PaymentConfigurationError, medilinkReference } from "@/lib/payments/types";

function assertAirtelConfig() {
  const missing = [
    ["AIRTEL_MONEY_CLIENT_ID", appConfig.airtel.clientId],
    ["AIRTEL_MONEY_CLIENT_SECRET", appConfig.airtel.clientSecret],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => String(name));

  if (missing.length) {
    throw new PaymentConfigurationError("airtel_money", missing);
  }
}

async function getAirtelToken() {
  assertAirtelConfig();

  const response = await fetch(`${appConfig.airtel.baseUrl}/auth/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: appConfig.airtel.clientId,
      client_secret: appConfig.airtel.clientSecret,
      grant_type: "client_credentials",
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    access_token?: string;
  } | null;

  if (!response.ok || !payload?.access_token) {
    throw new Error("Unable to get Airtel Money access token");
  }

  return payload.access_token;
}

export const airtelMoneyAdapter: PaymentAdapter = {
  provider: "airtel_money",

  async createIntent(input: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const token = await getAirtelToken();
    const reference = medilinkReference("MLK-AIR");
    const msisdn = input.phone.replace(/^\+?256/, "").replace(/\D/g, "");

    const response = await fetch(
      `${appConfig.airtel.baseUrl}${appConfig.airtel.collectionPath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Country": appConfig.airtel.country,
          "X-Currency": appConfig.airtel.currency,
        },
        body: JSON.stringify({
          reference,
          subscriber: {
            country: appConfig.airtel.country,
            currency: input.currency,
            msisdn,
          },
          transaction: {
            amount: input.amount,
            country: appConfig.airtel.country,
            currency: input.currency,
            id: reference,
          },
          meta: {
            appointment_id: input.appointmentId,
            tenant_id: input.tenantId,
          },
        }),
      },
    );

    const payload = await response.json().catch(() => null);

    if (!response.ok && response.status !== 202) {
      throw new Error(`Airtel Money collection failed with ${response.status}`);
    }

    return {
      provider: "airtel_money",
      reference,
      status: "processing",
      instructions:
        "An Airtel Money approval request has been sent to the patient.",
      raw: payload,
    };
  },

  async verify(reference: string): Promise<PaymentIntentResponse> {
    const token = await getAirtelToken();
    const response = await fetch(
      `${appConfig.airtel.baseUrl}${appConfig.airtel.statusPath}/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "X-Country": appConfig.airtel.country,
          "X-Currency": appConfig.airtel.currency,
        },
      },
    );

    const payload = (await response.json().catch(() => null)) as {
      data?: { transaction?: { status?: string } };
    } | null;

    if (!response.ok) {
      throw new Error(`Airtel Money status lookup failed with ${response.status}`);
    }

    const status = payload?.data?.transaction?.status?.toLowerCase();

    return {
      provider: "airtel_money",
      reference,
      status:
        status === "success" || status === "ts"
          ? "paid"
          : status === "failed" || status === "tf"
            ? "failed"
            : "processing",
      raw: payload,
    };
  },
};
