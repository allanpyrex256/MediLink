import { appConfig } from "@/lib/config";

export interface WhatsAppMessage {
  to: string;
  body: string;
}

export async function sendWhatsApp(message: WhatsAppMessage) {
  if (!appConfig.whatsapp.token || !appConfig.whatsapp.phoneNumberId) {
    return {
      queued: true,
      provider: "demo",
      reason:
        "WHATSAPP_CLOUD_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not configured",
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${appConfig.whatsapp.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${appConfig.whatsapp.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: message.to.replace(/\D/g, ""),
        type: "text",
        text: {
          preview_url: false,
          body: message.body,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`WhatsApp send failed with ${response.status}`);
  }

  return response.json();
}
