import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseAdminConfig } from "@/lib/config";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const invitationId = user?.user_metadata?.staff_invitation_id;

    if (typeof invitationId === "string" && user?.email && hasSupabaseAdminConfig()) {
      const admin = createSupabaseAdminClient();

      await admin
        .from("staff_invitations")
        .update({
          accepted_at: new Date().toISOString(),
          status: "accepted",
        })
        .eq("id", invitationId)
        .ilike("email", user.email);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
