import { NextRequest, NextResponse } from "next/server";
import { appConfig, hasSupabaseAdminConfig } from "@/lib/config";
import { requireWebhookSecret } from "@/lib/security/webhooks";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const invalidWebhook = requireWebhookSecret(request, {
    provider: "MTN MoMo",
    secret: appConfig.mtn.webhookSecret,
  });
  if (invalidWebhook) return invalidWebhook;

  const payload = await request.json().catch(() => null);
  const reference =
    payload?.referenceId ?? payload?.externalId ?? payload?.financialTransactionId;
  const status = String(payload?.status ?? "").toUpperCase();

  if (hasSupabaseAdminConfig() && reference) {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("payments")
      .update({
        status:
          status === "SUCCESSFUL" ? "paid" : status === "FAILED" ? "failed" : "processing",
        metadata: payload,
      })
      .eq("provider", "mtn_momo")
      .eq("provider_reference", reference);
  }

  return NextResponse.json({ received: true });
}
