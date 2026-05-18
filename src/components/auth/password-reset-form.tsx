"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

type Step = "request" | "verify" | "password";

export function PasswordResetForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasSupabaseConfig()) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) return;

    const supabase = createSupabaseBrowserClient();
    setLoading(true);
    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ error: exchangeError }) => {
        if (exchangeError) throw exchangeError;
        window.history.replaceState({}, document.title, "/reset-password");
        setStep("password");
        setMessage("Email verified. Choose a new password.");
      })
      .catch((caught) => {
        setError(caught instanceof Error ? caught.message : "Unable to verify this reset link.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/password-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(payload.error ?? "Unable to send reset OTP.");

      setMessage(payload.data?.message ?? "If this is the account creator email, a reset OTP has been sent.");
      setStep("verify");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send reset OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtpAndReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await resetPassword({ verifyOtp: true });
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await resetPassword({ verifyOtp: false });
  }

  async function resetPassword({ verifyOtp }: { verifyOtp: boolean }) {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!hasSupabaseConfig()) {
        throw new Error("Password reset needs Supabase to be configured.");
      }

      const cleanOtp = otp.replace(/\D/g, "");
      if (verifyOtp && cleanOtp.length < 6) {
        throw new Error("Enter the 6-digit OTP from the account creator email.");
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const supabase = createSupabaseBrowserClient();

      if (verifyOtp) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: cleanOtp,
          type: "email",
        });

        if (verifyError) throw verifyError;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      await supabase.auth.signOut();
      router.push("/login?reset=success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  const isVerifyStep = step === "verify";
  const isPasswordStep = step === "password";

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="grid size-12 place-items-center rounded-lg bg-sky-100 text-sky-700">
            {isVerifyStep ? <Mail className="size-6" /> : <KeyRound className="size-6" />}
          </div>
          <CardTitle className="mt-6">Reset creator password</CardTitle>
          <CardDescription>
            Use the email that created the MediLink workspace, then enter the OTP sent to that inbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <p className="mb-4 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>{message}</span>
            </p>
          ) : null}
          {error ? (
            <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm leading-6 text-rose-700">{error}</p>
          ) : null}

          {step === "request" ? (
            <form className="grid gap-4" onSubmit={requestOtp}>
              <Input
                label="Account creator email"
                name="email"
                type="email"
                placeholder="owner@clinic.ug"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                Send reset OTP
              </Button>
            </form>
          ) : null}

          {isVerifyStep ? (
            <form className="grid gap-4" onSubmit={verifyOtpAndReset}>
              <Input
                label="Account creator email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Input
                label="Email OTP"
                name="otp"
                inputMode="numeric"
                maxLength={8}
                placeholder="123456"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
              />
              <PasswordInput
                label="New password"
                name="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <PasswordInput
                label="Confirm new password"
                name="confirmPassword"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                Reset password
              </Button>
              <Button type="button" variant="secondary" disabled={loading} onClick={() => setStep("request")}>
                Use a different email
              </Button>
            </form>
          ) : null}

          {isPasswordStep ? (
            <form className="grid gap-4" onSubmit={updatePassword}>
              <PasswordInput
                label="New password"
                name="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <PasswordInput
                label="Confirm new password"
                name="confirmPassword"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                Save new password
              </Button>
            </form>
          ) : null}

          <p className="mt-5 text-center text-sm text-slate-500">
            Remembered it?{" "}
            <Link className="font-semibold text-sky-700 hover:text-sky-800" href="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
