"use client";

import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToastMessage, ToastViewport } from "@/components/ui/toast";

function nextToastId() {
  return Date.now();
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  function showToast(kind: ToastMessage["kind"], title: string, message?: string) {
    setToast({ id: nextToastId(), kind, title, message });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send reset instructions.");
      }

      setSent(true);
      showToast(
        "success",
        "Reset OTP sent",
        payload.data?.message ?? "Check your email for the MediLink reset OTP.",
      );
    } catch (caught) {
      showToast(
        "error",
        "Reset request failed",
        caught instanceof Error ? caught.message : "Unable to send reset instructions.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      description="Enter the owner or admin email for your MediLink workspace. We will send a one-time password to that address."
    >
      <ToastViewport toast={toast} onDismiss={dismissToast} />
      <form className="grid gap-4" onSubmit={submit}>
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
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          Send reset OTP
        </Button>
      </form>

      {sent ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Check your email</p>
              <p className="mt-1 text-sm leading-6 text-emerald-800">
                Enter the OTP on the reset page to create a new password.
              </p>
              <Link
                href={`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Continue to reset
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <Link
        href="/login"
        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to sign in
      </Link>
    </AuthShell>
  );
}
