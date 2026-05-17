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
    },
    body: JSON.stringify({
      from: appConfig.email.from,
      ...message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email send failed with ${response.status}`);
  }

  return response.json();
}
