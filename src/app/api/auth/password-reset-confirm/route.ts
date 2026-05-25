import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseAdminConfig, hasSupabaseConfig } from "@/lib/config";
import { validatePassword } from "@/lib/password-policy";
import { resetPasswordWithOtp } from "@/lib/password-reset";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const confirmSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = confirmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter the email, 6-digit OTP, and new password." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`password-reset-confirm:${ip}:${email}`, 10, 10 * 60_000);

  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many reset attempts. Request a new OTP and try again." },
      { status: 429 },
    );
  }

  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Password reset is not configured for this deployment." },
      { status: 503 },
    );
  }

  const passwordError = validatePassword(parsed.data.password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  try {
    await resetPasswordWithOtp(
      createSupabaseAdminClient(),
      email,
      parsed.data.otp,
      parsed.data.password,
    );
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "The reset OTP is invalid or expired.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      message: "Password updated. Sign in with the new password.",
    },
  });
}
