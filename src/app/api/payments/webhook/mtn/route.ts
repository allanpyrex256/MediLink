import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdminConfig } from "@/lib/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
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
