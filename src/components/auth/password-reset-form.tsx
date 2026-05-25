"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { ToastMessage, ToastViewport } from "@/components/ui/toast";
import { validatePassword } from "@/lib/password-policy";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

function nextToastId() {
  return Date.now();
}

function friendlyResetError(caught: unknown) {
  const message = caught instanceof Error ? caught.message : "";
  const normalized = message.toLowerCase();

  if (normalized.includes("expired") || normalized.includes("invalid")) {
    return "The reset OTP is invalid or expired. Request a new OTP and try again.";
  }

  if (normalized.includes("weak_password")) {
    return "Choose a stronger password before continuing.";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }

  return message || "Unable to reset password.";
}

export function PasswordResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configured = hasSupabaseConfig();
  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const recoveryCode = searchParams.get("code");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoverySessionReady, setRecoverySessionReady] = useState(false);
  const [loading, setLoading] = useState(Boolean(recoveryCode));
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const passwordsMismatch = Boolean(confirmPassword && password !== confirmPassword);

  const showToast = useCallback((kind: ToastMessage["kind"], title: string, message?: string) => {
    setToast({ id: nextToastId(), kind, title, message });
  }, []);

  useEffect(() => {
    if (!configured) return;
    if (!recoveryCode) return;

    const supabase = createSupabaseBrowserClient();

    supabase.auth
      .exchangeCodeForSession(recoveryCode)
      .then(({ error }) => {
        if (error) throw error;

        setRecoverySessionReady(true);
        window.history.replaceState({}, document.title, "/reset-password");
        showToast("success", "Email verified", "Choose a new password to finish the reset.");
      })
      .catch((caught) => {
        showToast("error", "Reset link failed", friendlyResetError(caught));
      })
      .finally(() => setLoading(false));
  }, [configured, recoveryCode, showToast]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      if (!configured) {
        throw new Error("Password reset is not configured for this deployment.");
      }

      const passwordError = validatePassword(password);
      if (passwordError) throw new Error(passwordError);
      if (password !== confirmPassword) throw new Error("Passwords do not match.");

      const supabase = createSupabaseBrowserClient();

      if (recoverySessionReady) {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
      } else {
        const cleanEmail = email.trim().toLowerCase();
        const cleanOtp = otp.replace(/\D/g, "");

        if (!cleanEmail) throw new Error("Enter the email that received the OTP.");
        if (cleanOtp.length !== 6) throw new Error("Enter the 6-digit OTP from the MediLink email.");

        const response = await fetch("/api/auth/password-reset-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            otp: cleanOtp,
            password,
          }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error ?? "The reset OTP is invalid or expired.");
        }
      }

      await supabase.auth.signOut({ scope: "global" }).catch(() => null);

      showToast(
        "success",
        "Password updated",
        "All previous sessions have been signed out. Use your new password to sign in.",
      );
      window.setTimeout(() => router.push("/login?reset=success"), 1200);
    } catch (caught) {
      showToast("error", "Password reset failed", friendlyResetError(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create a new password"
      description="Enter the MediLink OTP from your email, then choose a strong password for your workspace account."
    >
      <ToastViewport toast={toast} onDismiss={dismissToast} />

      {recoverySessionReady ? (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Email verified</p>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Set a new password to finish securing this account.
            </p>
          </div>
        </div>
      ) : null}

      <form className="grid gap-4" onSubmit={submit}>
        {!recoverySessionReady ? (
          <>
            <Input
              label="Owner or admin email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="owner@clinic.ug"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Email OTP"
              name="otp"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </>
        ) : null}

        <PasswordInput
          label="New password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <PasswordStrengthMeter password={password} />
        <PasswordInput
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        {passwordsMismatch ? (
          <p className="rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-700">
            Passwords do not match.
          </p>
        ) : null}

        <Button type="submit" size="lg" disabled={loading || passwordsMismatch} className="w-full">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
          {loading ? "Updating password" : "Save new password"}
        </Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900"
        >
          <KeyRound className="size-4" aria-hidden="true" />
          Request a new OTP
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
