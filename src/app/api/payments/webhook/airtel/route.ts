import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdminConfig } from "@/lib/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  const transaction = payload?.data?.transaction ?? payload?.transaction ?? {};
  const reference = transaction.id ?? transaction.reference ?? payload?.reference;
  const status = String(transaction.status ?? payload?.status ?? "").toLowerCase();

  if (hasSupabaseAdminConfig() && reference) {
    const supabase = createSupabaseAdminClient();
    await supabase
      .from("payments")
      .update({
        status:
          status === "success" || status === "ts"
            ? "paid"
            : status === "failed" || status === "tf"
              ? "failed"
              : "processing",
        metadata: payload,
      })
      .eq("provider", "airtel_money")
      .eq("provider_reference", reference);
  }

  return NextResponse.json({ received: true });
}
