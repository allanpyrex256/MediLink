"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { ToastMessage, ToastViewport } from "@/components/ui/toast";
import { demoAccountOptions, demoWorkspaceBranding } from "@/lib/demo-session";
import { validatePassword } from "@/lib/password-policy";
import { normalizeUgandanPhone, phoneAuthEmail, phoneLoginIdentifier } from "@/lib/phone";
import { dashboardRoleLabel, defaultDashboardPath } from "@/lib/rbac";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { getOrCreateAuthTabId, withAuthTabParam } from "@/lib/supabase/session-scope";

const tenantKinds = [
  { value: "pharmacy", label: "Pharmacy / drug shop" },
  { value: "clinic", label: "Clinic" },
] as const;

function isEmailIdentifier(value: string) {
  return value.includes("@");
}

function nextToastId() {
  return Date.now();
}

function friendlyAuthError(caught: unknown) {
  const message = caught instanceof Error ? caught.message : "";
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "The phone, email, or password is incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "This account is not ready yet. Contact the workspace owner.";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }

  return message || "Authentication failed.";
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  return (
    <Suspense fallback={<AuthFormFallback />}>
      <AuthFormContent mode={mode} />
    </Suspense>
  );
}

function AuthFormContent({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configured = hasSupabaseConfig();
  const demoAccounts = useMemo(
    () => demoAccountOptions.filter((account) => !account.isPlatformAdmin),
    [],
  );
  const [selectedDemoPhone, setSelectedDemoPhone] = useState(demoAccounts[0]?.phone ?? "+256700000201");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const next = searchParams.get("next");
  const resetSuccess = searchParams.get("reset") === "success";
  const [toast, setToast] = useState<ToastMessage | null>(() =>
    resetSuccess
      ? {
          id: nextToastId(),
          kind: "success",
          title: "Password updated",
          message: "Sign in with your new password.",
        }
      : null,
  );
  const dismissToast = useCallback(() => setToast(null), []);
  const selectedDemoAccount = demoAccountOptions.find((account) => account.phone === selectedDemoPhone);
  const selectedBrand = selectedDemoAccount ? demoWorkspaceBranding[selectedDemoAccount.workspaceId] : null;
  const authLabel = configured || !selectedBrand ? "MediLink" : selectedBrand.name;
  const authTagline = configured || !selectedBrand ? "Healthcare and pharmacy SaaS" : selectedBrand.tagline;
  const authColor = configured || !selectedBrand ? "#7c3aed" : selectedBrand.primaryColor;
  const authInitials = configured || !selectedBrand ? "ML" : selectedBrand.initials;
  const passwordsMismatch = mode === "register" && Boolean(confirmPassword && password !== confirmPassword);

  const showToast = useCallback((kind: ToastMessage["kind"], title: string, message?: string) => {
    setToast({ id: nextToastId(), kind, title, message });
  }, []);

  useEffect(() => {
    if (!resetSuccess) return;

    window.history.replaceState({}, document.title, "/login");
  }, [resetSuccess]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      if (mode === "login") {
        await login(form);
      } else {
        const passwordError = validatePassword(password);
        if (passwordError) throw new Error(passwordError);
        if (password !== confirmPassword) throw new Error("Passwords do not match.");
        await registerOwner(form);
      }
    } catch (caught) {
      showToast("error", mode === "login" ? "Sign in failed" : "Account setup failed", friendlyAuthError(caught));
    } finally {
      setLoading(false);
    }
  }

  async function login(form: FormData) {
    if (!configured) {
      const account = demoAccountOptions.find((item) => item.phone === selectedDemoPhone);
      const password = String(form.get("password") ?? "");

      if (!account) throw new Error("Choose a demo account.");
      if (password && password !== account.password) throw new Error("Demo password is demo12345.");

      const response = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountPhone: selectedDemoPhone,
          next: next ?? defaultDashboardPath(account.role, account.isPlatformAdmin),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to open demo account");

      router.push(payload.next ?? defaultDashboardPath(account.role, account.isPlatformAdmin));
      router.refresh();
      return;
    }

    const identifier = String(form.get("identifier") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!identifier) throw new Error("Enter your phone number or email.");

    const authTabId = getOrCreateAuthTabId();
    const supabase = createSupabaseBrowserClient();
    const isEmail = isEmailIdentifier(identifier);
    const phone = isEmail ? "" : phoneLoginIdentifier(identifier);
    const authEmail = phoneAuthEmail(phone);
    if (!isEmail && !authEmail) throw new Error("Enter a valid phone number.");
    const credentials = isEmail
      ? { email: identifier.toLowerCase(), password }
      : { email: authEmail, password };
    let { error: authError } = await supabase.auth.signInWithPassword(credentials);

    if (authError && phone) {
      const upgraded = await upgradePhoneLogin(phone);
      if (upgraded) {
        ({ error: authError } = await supabase.auth.signInWithPassword(credentials));
      }
    }

    if (authError) throw authError;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase
          .from("users")
          .select("role, is_platform_admin")
          .eq("id", user.id)
          .single()
      : { data: null };

    router.push(withAuthTabParam(next ?? defaultDashboardPath(profile?.role, profile?.is_platform_admin), authTabId));
    router.refresh();
  }

  async function registerOwner(form: FormData) {
    if (!configured) {
      throw new Error("Live owner account creation is not configured.");
    }

    const phone = normalizeUgandanPhone(String(form.get("phone") ?? ""));
    const password = String(form.get("password") ?? "");
    const authEmail = phoneAuthEmail(phone);
    const response = await fetch("/api/auth/owner-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: String(form.get("businessName") ?? ""),
        ownerName: String(form.get("ownerName") ?? ""),
        tenantKind: String(form.get("tenantKind") ?? "pharmacy"),
        phone,
        password,
        region: String(form.get("region") ?? "Uganda"),
        address: String(form.get("address") ?? "Pending setup"),
      }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(payload.error ?? "Unable to create owner account");

    const authTabId = getOrCreateAuthTabId();
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: authEmail, password });
    if (signInError) throw signInError;

    router.push(withAuthTabParam("/dashboard", authTabId));
    router.refresh();
  }

  return (
    <AuthShell
      brandColor={authColor}
      brandInitials={authInitials}
      brandLabel={authLabel}
      brandTagline={authTagline}
      title={mode === "login" ? "Sign in to MediLink" : "Create owner account"}
      description={
        mode === "login"
          ? "Use the phone number or email assigned to your workspace."
          : "Create the first owner account for a new workspace."
      }
    >
      <ToastViewport toast={toast} onDismiss={dismissToast} />

      {!configured ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
          Demo mode is active. Use password <span className="font-bold">demo12345</span>.
        </div>
      ) : null}

      <form className="grid gap-4" onSubmit={submit}>
        {mode === "register" ? (
          <>
            <Select label="Business type" name="tenantKind" defaultValue="pharmacy">
              {tenantKinds.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </Select>
            <Input label="Business name" name="businessName" placeholder="MediLink Pharmacy" required />
            <Input label="Owner name" name="ownerName" placeholder="Allan Kato" required />
            <Input label="Town or region" name="region" placeholder="Kampala" />
            <Input label="Address" name="address" placeholder="Main branch" />
          </>
        ) : !configured ? (
          <Select
            label="Demo account"
            name="accountPhone"
            value={selectedDemoPhone}
            onChange={(event) => setSelectedDemoPhone(event.target.value)}
          >
            {demoAccounts.map((account) => (
              <option key={account.phone} value={account.phone}>
                {account.phone} / {account.email} - {dashboardRoleLabel(account.role)} - {account.fullName}
              </option>
            ))}
          </Select>
        ) : (
          <Input
            label="Phone number or email"
            name="identifier"
            type="text"
            placeholder="+256 700 000 000 or admin@clinic.ug"
            autoComplete="username"
            required
          />
        )}

        {mode === "register" ? (
          <Input label="Owner phone number" name="phone" type="tel" placeholder="+256 700 000 000" required />
        ) : null}
        <PasswordInput
          label="Password"
          name="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {mode === "register" ? (
          <>
            <PasswordStrengthMeter password={password} />
            <PasswordInput
              label="Confirm password"
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
          </>
        ) : null}

        {mode === "login" ? (
          <div className="-mt-1 flex justify-end">
            <Link className="text-sm font-bold text-sky-700 hover:text-sky-900" href="/forgot-password">
              Forgot Password?
            </Link>
          </div>
        ) : null}

        <Button type="submit" size="lg" disabled={loading || passwordsMismatch} className="w-full">
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {loading
            ? mode === "login"
              ? "Signing in"
              : "Creating account"
            : mode === "login"
              ? "Sign in"
              : "Create owner account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        {mode === "login" ? "New business owner?" : "Already have an account?"}{" "}
        <Link className="font-semibold text-sky-700 hover:text-sky-800" href={mode === "login" ? "/register" : "/login"}>
          {mode === "login" ? "Create owner account" : "Sign in"}
        </Link>
      </p>
    </AuthShell>
  );
}

async function upgradePhoneLogin(phone: string) {
  const response = await fetch("/api/auth/phone-login-upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  }).catch(() => null);

  if (!response?.ok) return false;

  const payload = await response.json().catch(() => ({}));
  return Boolean(payload.data?.ready);
}

function AuthFormFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="h-12 w-40 rounded-lg bg-slate-200" />
        <div className="mt-6 h-7 w-56 rounded-lg bg-slate-200" />
        <div className="mt-3 h-12 rounded-lg bg-slate-100" />
        <div className="mt-6 grid gap-4">
          <div className="h-11 rounded-lg bg-slate-100" />
          <div className="h-11 rounded-lg bg-slate-100" />
          <div className="h-12 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
