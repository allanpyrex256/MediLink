import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const resetSchema = z.object({
  email: z.string().email(),
});

const genericMessage =
  "If this is the account creator email, a reset OTP has been sent.";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`password-reset:${ip}`, 8, 10 * 60_000);

  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many reset attempts. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Password reset needs Supabase to be configured." },
      { status: 503 },
    );
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Password reset needs SUPABASE_SERVICE_ROLE_KEY so creator emails can be verified." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid account creator email." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const supabase = createSupabaseAdminClient();
  const { data: profile } = await supabase
    .from("users")
    .select("id, role, is_platform_admin")
    .ilike("email", email)
    .maybeSingle();

  const isCreator = profile?.role === "admin" || profile?.is_platform_admin;

  if (!isCreator) {
    return NextResponse.json({ data: { message: genericMessage } });
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${request.nextUrl.origin}/reset-password`,
      shouldCreateUser: false,
    },
  });

  if (error) {
    return NextResponse.json(
      { error: "Unable to send the reset OTP right now. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: { message: genericMessage } });
}
