import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseAdminConfig } from "@/lib/config";
import { normalizeUgandanPhone, phoneAuthEmail } from "@/lib/phone";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const phoneLoginUpgradeSchema = z.object({
  phone: z.string().trim().min(7),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`phone-login-upgrade:${ip}`, 20, 10 * 60_000);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many login attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = phoneLoginUpgradeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }

  const phone = normalizeUgandanPhone(parsed.data.phone);
  const authEmail = phoneAuthEmail(phone);

  if (!phone || !authEmail) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json({ data: { ready: false } });
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("id, email")
    .eq("phone", phone)
    .maybeSingle();

  if (profile?.email?.toLowerCase() !== authEmail) {
    return NextResponse.json({ data: { ready: false } });
  }

  const { data: authData, error: getUserError } = await admin.auth.admin.getUserById(profile.id);

  if (getUserError || !authData.user) {
    return NextResponse.json({ data: { ready: false } });
  }

  if (authData.user.email?.toLowerCase() === authEmail) {
    return NextResponse.json({ data: { ready: true } });
  }

  const { error } = await admin.auth.admin.updateUserById(profile.id, {
    email: authEmail,
    email_confirm: true,
    user_metadata: {
      ...authData.user.user_metadata,
      phone,
    },
  });

  return NextResponse.json({ data: { ready: !error } });
}
