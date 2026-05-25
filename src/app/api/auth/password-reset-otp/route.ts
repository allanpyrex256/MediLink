import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import {
  canReceivePasswordResetOtp,
  getPasswordResetAccountByEmail,
  isDeliverablePasswordResetEmail,
  passwordResetOtpMessage,
  passwordResetRedirectUrl,
  sendPasswordResetOtp,
} from "@/lib/password-reset";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const resetSchema = z.object({
  email: z.string().email(),
});

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
      { error: "Password reset is not configured for this deployment." },
      { status: 503 },
    );
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Admin password reset email delivery is not configured." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = resetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid owner or admin email." }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const supabase = createSupabaseAdminClient();
  const profile = await getPasswordResetAccountByEmail(supabase, email);

  if (!canReceivePasswordResetOtp(profile) || !isDeliverablePasswordResetEmail(profile?.email ?? "")) {
    return NextResponse.json({ data: { message: passwordResetOtpMessage } });
  }

  try {
    await sendPasswordResetOtp(supabase, email, passwordResetRedirectUrl);
  } catch (caught) {
    const message = caught instanceof Error
      ? caught.message
      : "Unable to send the reset OTP right now. Please try again.";
    const status = message.includes("not configured") ? 503 : 500;

    return NextResponse.json(
      { error: message },
      { status },
    );
  }

  return NextResponse.json({ data: { message: passwordResetOtpMessage } });
}
