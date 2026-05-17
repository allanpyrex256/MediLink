import { NextRequest, NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import { hasSupabaseAdminConfig } from "@/lib/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("verif-hash");

  if (appConfig.flutterwave.webhookHash && signature !== appConfig.flutterwave.webhookHash) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

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
