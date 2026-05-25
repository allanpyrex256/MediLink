import { NextRequest, NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import { hasSupabaseAdminConfig } from "@/lib/config";
import { requireWebhookSecret } from "@/lib/security/webhooks";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const invalidWebhook = requireWebhookSecret(request, {
    provider: "Flutterwave",
    secret: appConfig.flutterwave.webhookHash,
    headers: ["verif-hash"],
    queryParams: [],
  });
  if (invalidWebhook) return invalidWebhook;

  const payload = await request.json().catch(() => null);
  const reference =
    payload?.data?.reference ?? payload?.data?.tx_ref ?? payload?.txRef ?? null;
  const status = String(payload?.data?.status ?? payload?.status ?? "").toLowerCase();

  if (hasSupabaseAdminConfig() && reference) {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("payments")
      .update({
        status: status === "successful" || status === "succeeded" ? "paid" : "failed",
        metadata: payload,
      })
      .eq("provider", "flutterwave")
      .eq("provider_reference", reference);
  }

  return NextResponse.json({ received: true });
}
