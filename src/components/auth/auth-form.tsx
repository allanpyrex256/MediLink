"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { demoAccountOptions, demoWorkspaceBranding } from "@/lib/demo-session";
import { normalizeUgandanPhone, phoneLoginIdentifier } from "@/lib/phone";
import { dashboardRoleLabel, defaultDashboardPath } from "@/lib/rbac";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";

const tenantKinds = [
  { value: "pharmacy", label: "Pharmacy / drug shop" },
  { value: "clinic", label: "Clinic" },
] as const;

function isEmailIdentifier(value: string) {
  return value.includes("@");
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const next = searchParams.get("next");
  const selectedDemoAccount = demoAccountOptions.find((account) => account.phone === selectedDemoPhone);
  const selectedBrand = selectedDemoAccount ? demoWorkspaceBranding[selectedDemoAccount.workspaceId] : null;
  const authLabel = configured || !selectedBrand ? "MediLink" : selectedBrand.name;
  const authTagline = configured || !selectedBrand ? "Healthcare and pharmacy SaaS" : selectedBrand.tagline;
  const authColor = configured || !selectedBrand ? "#7c3aed" : selectedBrand.primaryColor;
  const authInitials = configured || !selectedBrand ? "ML" : selectedBrand.initials;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      if (mode === "login") {
        await login(form);
      } else {
        await registerOwner(form);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed");
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

    const supabase = createSupabaseBrowserClient();
    const credentials = isEmailIdentifier(identifier)
      ? { email: identifier.toLowerCase(), password }
      : { phone: phoneLoginIdentifier(identifier), password };
    const { error: authError } = await supabase.auth.signInWithPassword(credentials);

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

    router.push(next ?? defaultDashboardPath(profile?.role, profile?.is_platform_admin));
    router.refresh();
  }

  async function registerOwner(form: FormData) {
    if (!configured) {
      throw new Error("Connect Supabase to create live owner accounts.");
    }

    const phone = normalizeUgandanPhone(String(form.get("phone") ?? ""));
    const password = String(form.get("password") ?? "");
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

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ phone, password });
    if (signInError) throw signInError;

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Logo label={authLabel} tagline={authTagline} initials={authInitials} color={authColor} />
          <CardTitle className="mt-6">
            {mode === "login" ? "Sign in with phone or email" : "Create owner account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Use the phone number or email and password assigned to your MediLink account."
              : "The first account becomes the owner. Staff accounts are added later by the owner."}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <PasswordInput label="Password" name="password" minLength={8} required />

            {error ? (
              <p className="rounded-lg bg-rose-50 p-3 text-sm leading-6 text-rose-700">{error}</p>
            ) : null}

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {mode === "login" ? "Sign in" : "Create owner account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {mode === "login" ? "New business owner?" : "Already have an account?"}{" "}
            <a className="font-semibold text-sky-700 hover:text-sky-800" href={mode === "login" ? "/register" : "/login"}>
              {mode === "login" ? "Create owner account" : "Sign in"}
            </a>
          </p>
          {mode === "login" ? (
            <p className="mt-3 text-center text-sm">
              <a className="font-semibold text-sky-700 hover:text-sky-800" href="/reset-password">
                Forgot password?
              </a>
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function AuthFormFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="h-12 w-40 rounded-lg bg-slate-200" />
          <div className="mt-6 h-7 w-56 rounded-lg bg-slate-200" />
          <div className="mt-3 h-12 rounded-lg bg-slate-100" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="h-11 rounded-lg bg-slate-100" />
            <div className="h-11 rounded-lg bg-slate-100" />
            <div className="h-12 rounded-lg bg-slate-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
