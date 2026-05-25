import { appConfig } from "@/lib/config";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(message: EmailMessage) {
  if (!appConfig.email.resendApiKey) {
    return {
      queued: true,
      provider: "demo",
      reason: "RESEND_API_KEY is not configured",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${appConfig.email.resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "medilink/1.0",
    },
    body: JSON.stringify({
      from: appConfig.email.from,
      ...message,
    }),
  });

  if (!response.ok) {
    const providerMessage = await response
      .json()
      .then((payload) => providerErrorMessage(payload))
      .catch(() => "");

    throw new Error(friendlyEmailProviderError(response.status, providerMessage));
  }

  return response.json();
}

function providerErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";

  const record = payload as Record<string, unknown>;
  const message = record.message ?? record.error;

  return typeof message === "string" ? message : "";
}

function friendlyEmailProviderError(status: number, providerMessage: string) {
  if (status === 403) {
    const details = providerMessage ? ` ${providerMessage}` : "";

    return `Email provider rejected the sender or recipient.${details} Verify the sending domain in Resend, then set EMAIL_FROM to an address on that verified domain.`;
  }

  return providerMessage
    ? `Email provider failed with ${status}: ${providerMessage}`
    : `Email provider failed with ${status}.`;
}
