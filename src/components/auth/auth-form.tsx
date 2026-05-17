"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Globe2, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Select } from "@/components/ui/select";
import { demoAccountOptions, demoWorkspaceBranding } from "@/lib/demo-session";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccountEmail, setSelectedAccountEmail] = useState("admin@kampalahospital.ug");
  const next = searchParams.get("next") ?? "/dashboard";
  const configured = hasSupabaseConfig();
  const selectedAccount = demoAccountOptions.find((account) => account.email === selectedAccountEmail);
  const selectedBrand = selectedAccount ? demoWorkspaceBranding[selectedAccount.workspaceId] : null;
  const isPlatformOwner = selectedAccount?.isPlatformAdmin;
  const authLabel = isPlatformOwner || configured || !selectedBrand ? "MediLink" : selectedBrand.name;
  const authTagline = isPlatformOwner
    ? "Platform Control"
    : configured || !selectedBrand
      ? "Healthcare Management System"
      : selectedBrand.tagline;
  const authColor = configured || !selectedBrand ? "#7c3aed" : selectedBrand.primaryColor;
  const authInitials = isPlatformOwner || configured || !selectedBrand ? "ML" : selectedBrand.initials;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const accountEmail = String(form.get("accountEmail") ?? "");

    if (!configured) {
      if (mode === "register") {
        setError("Connect Supabase to create a live clinic or pharmacy workspace.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/demo-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountEmail, next }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Unable to open demo portal");
        router.push(payload.next ?? next);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to open demo portal");
      } finally {
        setLoading(false);
      }
      return;
    }

    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const supabase = createSupabaseBrowserClient();

    setLoading(true);
    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
      } else {
        const tenantName = String(form.get("tenantName"));
        const tenantKind = String(form.get("tenantKind"));
        const fullName = String(form.get("fullName"));
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard`,
            data: {
              full_name: fullName,
              tenant_name: tenantName,
              tenant_slug: slugify(tenantName),
              tenant_kind: tenantKind,
              role: "admin",
            },
          },
        });
        if (authError) throw authError;
      }

      router.push(next);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function googleLogin() {
    setError(null);
    if (!configured) {
      setError("Supabase env vars are missing. Add them to enable Google login.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Logo
            label={authLabel}
            tagline={authTagline}
            initials={authInitials}
            color={authColor}
          />
          <CardTitle className="mt-6">
            {mode === "login" ? `Sign in to ${authLabel}` : "Create your workspace"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Access an isolated clinic, hospital, or pharmacy portal with role-based permissions."
              : "Provision a clinic, hospital, or pharmacy tenant with a secure owner account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              Supabase is not configured, so local demo login is enabled. Choose a role-based demo account below.
            </div>
          ) : null}
          <form className="grid gap-4" onSubmit={submit}>
            {!configured && mode === "login" ? (
              <Select
                label="Demo account"
                name="accountEmail"
                value={selectedAccountEmail}
                onChange={(event) => setSelectedAccountEmail(event.target.value)}
              >
                {demoAccountOptions.map((account) => (
                  <option key={account.email} value={account.email}>
                    {account.email} - {account.description}
                  </option>
                ))}
              </Select>
            ) : null}
            {mode === "register" ? (
              <>
                <Select label="Workspace type" name="tenantKind" defaultValue="clinic">
                  <option value="clinic">Clinic</option>
                  <option value="hospital">Hospital</option>
                  <option value="pharmacy">Pharmacy</option>
                </Select>
                <Input label="Clinic, hospital, or pharmacy name" name="tenantName" placeholder="Kampala Hospital" required />
                <Input label="Owner full name" name="fullName" placeholder="Dr. Sarah Namusoke" required />
              </>
            ) : null}
            {configured || mode === "register" ? (
              <>
                <Input label="Email" name="email" type="email" placeholder="owner@clinic.ug" required />
                <Input label="Password" name="password" type="password" minLength={8} required />
              </>
            ) : null}
            {error ? (
              <p className="rounded-lg bg-rose-50 p-3 text-sm leading-6 text-rose-700">{error}</p>
            ) : null}
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {mode === "login" && !configured ? "Open portal" : mode === "login" ? "Sign in" : "Create workspace"}
            </Button>
          </form>
          {configured ? (
            <>
              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <Button variant="secondary" className="w-full" onClick={googleLogin}>
                <Globe2 className="size-4" />
                Continue with Google
              </Button>
            </>
          ) : null}
          <p className="mt-5 text-center text-sm text-slate-500">
            {mode === "login" ? "New clinic?" : "Already registered?"}{" "}
            <a
              className="font-semibold text-sky-700 hover:text-sky-800"
              href={mode === "login" ? "/register" : "/login"}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
