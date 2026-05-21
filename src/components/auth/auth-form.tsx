"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Globe2, Loader2 } from "lucide-react";
import { FormEvent, Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { demoAccountOptions, demoWorkspaceBranding } from "@/lib/demo-session";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { formatUgx, slugify } from "@/lib/utils";

const signupPlans = [
  {
    value: "starter",
    label: "Starter",
    description: "Small clinics, dental practices, and pharmacies",
    amount: 50_000,
  },
  {
    value: "dental",
    label: "Dentistry",
    description: "Dental practices with appointments, treatment notes, and billing",
    amount: 60_000,
  },
  {
    value: "growth",
    label: "Clinic",
    description: "Growing clinics, dental practices, and pharmacies",
    amount: 100_000,
  },
  {
    value: "enterprise",
    label: "Hospital",
    description: "Hospitals and larger facilities",
    amount: 200_000,
  },
] as const;

const billingCycles = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
] as const;

const tenantKinds = [
  { value: "clinic", label: "Clinic" },
  { value: "dentistry", label: "Dentistry" },
  { value: "hospital", label: "Hospital" },
  { value: "pharmacy", label: "Pharmacy" },
] as const;

const paymentMethods = [
  { value: "stripe", label: "Mastercard" },
  { value: "mtn_momo", label: "MTN MoMo" },
  { value: "airtel_money", label: "Airtel Money" },
  { value: "bank_transfer", label: "Bank transfer" },
] as const;

type SignupPlan = (typeof signupPlans)[number]["value"];
type SignupBillingCycle = (typeof billingCycles)[number]["value"];
type SignupTenantKind = (typeof tenantKinds)[number]["value"];
type SignupPaymentMethod = (typeof paymentMethods)[number]["value"];

function normalizeSignupPlan(value: FormDataEntryValue | string | null): SignupPlan {
  const normalized = String(value ?? "").toLowerCase();
  return signupPlans.some((plan) => plan.value === normalized)
    ? (normalized as SignupPlan)
    : "growth";
}

function normalizePaymentMethod(value: FormDataEntryValue | string | null): SignupPaymentMethod {
  const normalized = String(value ?? "").toLowerCase();
  return paymentMethods.some((method) => method.value === normalized)
    ? (normalized as SignupPaymentMethod)
    : "stripe";
}

function normalizeBillingCycle(value: FormDataEntryValue | string | null): SignupBillingCycle {
  const normalized = String(value ?? "").toLowerCase();
  return billingCycles.some((cycle) => cycle.value === normalized)
    ? (normalized as SignupBillingCycle)
    : "monthly";
}

function normalizeTenantKind(value: FormDataEntryValue | string | null, selectedPlan?: SignupPlan): SignupTenantKind {
  const normalized = String(value ?? "").toLowerCase();
  if (tenantKinds.some((kind) => kind.value === normalized)) {
    return normalized as SignupTenantKind;
  }

  if (selectedPlan === "dental") return "dentistry";
  if (selectedPlan === "enterprise") return "hospital";
  return "clinic";
}

function planDetails(value: SignupPlan) {
  return signupPlans.find((plan) => plan.value === value) ?? signupPlans[2];
}

function paymentDetailsFromForm(form: FormData, paymentMethod: SignupPaymentMethod) {
  if (paymentMethod === "bank_transfer") {
    return {
      bank_name: String(form.get("bankName") ?? ""),
      account_holder_name: String(form.get("bankAccountName") ?? ""),
      transfer_reference: String(form.get("bankTransferReference") ?? ""),
    };
  }

  if (paymentMethod === "stripe") {
    return {
      cardholder_name: String(form.get("cardholderName") ?? ""),
      card_last_four: String(form.get("cardLastFour") ?? ""),
    };
  }

  return {};
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccountEmail, setSelectedAccountEmail] = useState("admin@kampalahospital.ug");
  const [selectedPlan, setSelectedPlan] = useState<SignupPlan>(
    normalizeSignupPlan(searchParams.get("plan")),
  );
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<SignupBillingCycle>(
    normalizeBillingCycle(searchParams.get("billing")),
  );
  const [selectedTenantKind, setSelectedTenantKind] = useState<SignupTenantKind>(
    normalizeTenantKind(searchParams.get("kind"), selectedPlan),
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SignupPaymentMethod>(
    normalizePaymentMethod(searchParams.get("payment")),
  );
  const next = searchParams.get("next") ?? "/dashboard";
  const configured = hasSupabaseConfig();
  const selectedPlanDetails = planDetails(selectedPlan);
  const selectedBillingAmount =
    selectedBillingCycle === "annual" ? selectedPlanDetails.amount * 12 : selectedPlanDetails.amount;
  const selectedAccount = demoAccountOptions.find((account) => account.email === selectedAccountEmail);
  const selectedBrand = selectedAccount ? demoWorkspaceBranding[selectedAccount.workspaceId] : null;
  const resetComplete = mode === "login" && searchParams.get("reset") === "success";
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
        setError("Connect Supabase to create a live healthcare workspace.");
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
      let destination = next;

      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("users")
            .select("is_platform_admin")
            .eq("id", user.id)
            .single();

          if (profile?.is_platform_admin) {
            destination = "/super-admin";
          }
        }
      } else {
        const tenantName = String(form.get("tenantName"));
        const fullName = String(form.get("fullName"));
        const subscriptionPlan = normalizeSignupPlan(form.get("subscriptionPlan"));
        const tenantKind = normalizeTenantKind(form.get("tenantKind"), subscriptionPlan);
        const signupPlan = planDetails(subscriptionPlan);
        const billingCycle = normalizeBillingCycle(form.get("billingCycle"));
        const paymentMethod = normalizePaymentMethod(form.get("paymentMethod"));
        const paymentDetails = paymentDetailsFromForm(form, paymentMethod);
        const billingPhone = String(form.get("billingPhone") ?? "");
        const region = String(form.get("region") ?? "");
        const address = String(form.get("address") ?? "");
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
              subscription_plan: subscriptionPlan,
              subscription_amount: signupPlan.amount,
              subscription_billing_cycle: billingCycle,
              payment_method: paymentMethod,
              payment_details: paymentDetails,
              billing_phone: billingPhone,
              phone: billingPhone,
              region,
              address,
            },
          },
        });
        if (authError) throw authError;
      }

      router.push(destination);
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
              ? "Access an isolated clinic, hospital, dentistry, or pharmacy portal with role-based permissions."
              : "Provision a clinic, hospital, dentistry, or pharmacy tenant, choose a demo plan, and add billing contact details."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!configured ? (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              Supabase is not configured, so local demo login is enabled. Choose a role-based demo account below.
            </div>
          ) : null}
          {resetComplete ? (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
              Password reset complete. Sign in with the new password.
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
                <Select
                  label="Workspace type"
                  name="tenantKind"
                  value={selectedTenantKind}
                  onChange={(event) => setSelectedTenantKind(normalizeTenantKind(event.target.value, selectedPlan))}
                >
                  {tenantKinds.map((kind) => (
                    <option key={kind.value} value={kind.value}>
                      {kind.label}
                    </option>
                  ))}
                </Select>
                <Input label="Clinic, dental practice, hospital, or pharmacy name" name="tenantName" placeholder="Pearl Dental Care" required />
                <Input label="Owner full name" name="fullName" placeholder="Dr. Sarah Namusoke" required />
                <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                  <Select
                    label="Demo plan"
                    name="subscriptionPlan"
                    value={selectedPlan}
                    onChange={(event) => setSelectedPlan(normalizeSignupPlan(event.target.value))}
                  >
                    {signupPlans.map((plan) => (
                      <option key={plan.value} value={plan.value}>
                        {plan.label} - {formatUgx(plan.amount)} / month
                      </option>
                    ))}
                  </Select>
                  <p className="mt-3 text-xs font-semibold leading-5 text-violet-700">
                    {selectedPlanDetails.description}. Selected payment: {formatUgx(selectedBillingAmount)} {selectedBillingCycle === "annual" ? "per year" : "per month"}.
                  </p>
                </div>
                <Select
                  label="Billing cycle"
                  name="billingCycle"
                  value={selectedBillingCycle}
                  onChange={(event) => setSelectedBillingCycle(normalizeBillingCycle(event.target.value))}
                  required
                >
                  {billingCycles.map((cycle) => (
                    <option key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Preferred payment method"
                  name="paymentMethod"
                  value={selectedPaymentMethod}
                  onChange={(event) => setSelectedPaymentMethod(normalizePaymentMethod(event.target.value))}
                  required
                >
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </Select>
                {selectedPaymentMethod === "bank_transfer" ? (
                  <div className="grid gap-4 rounded-lg border border-sky-200 bg-sky-50 p-3">
                    <Input label="Bank name" name="bankName" placeholder="Stanbic Bank Uganda" required />
                    <Input label="Account holder name" name="bankAccountName" placeholder="Pearl Dental Care" required />
                    <Input label="Transfer reference" name="bankTransferReference" placeholder="Invoice or transaction reference" required />
                  </div>
                ) : null}
                {selectedPaymentMethod === "stripe" ? (
                  <div className="grid gap-4 rounded-lg border border-sky-200 bg-sky-50 p-3">
                    <Input label="Cardholder name" name="cardholderName" placeholder="Dr. Sarah Namusoke" required />
                    <Input
                      label="Mastercard last 4 digits"
                      name="cardLastFour"
                      inputMode="numeric"
                      maxLength={4}
                      pattern="[0-9]{4}"
                      placeholder="1234"
                      required
                      title="Enter the last 4 digits only"
                    />
                    <p className="text-xs font-semibold leading-5 text-sky-800">
                      Full card numbers are entered later in the secure payment checkout.
                    </p>
                  </div>
                ) : null}
                <Input label="Billing contact phone" name="billingPhone" placeholder="+256 7XX XXX XXX" required />
                <Input label="Region or town" name="region" placeholder="Kampala" required />
                <Input label="Business address" name="address" placeholder="Plot 14, Kampala Road" required />
                <p className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold leading-5 text-emerald-800">
                  Demo signup records payment method and billing contact only. MediLink does not store raw card numbers.
                </p>
              </>
            ) : null}
            {configured || mode === "register" ? (
              <>
                <Input label="Email" name="email" type="email" placeholder="owner@clinic.ug" required />
                <PasswordInput label="Password" name="password" minLength={8} required />
              </>
            ) : null}
            {error ? (
              <p className="rounded-lg bg-rose-50 p-3 text-sm leading-6 text-rose-700">{error}</p>
            ) : null}
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              {mode === "login" && !configured
                ? "Open portal"
                : mode === "login"
                  ? "Sign in"
                  : "Create workspace and continue"}
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
            {mode === "login" ? "New business?" : "Already registered?"}{" "}
            <a
              className="font-semibold text-sky-700 hover:text-sky-800"
              href={mode === "login" ? "/register" : "/login"}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
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
            <div className="h-11 rounded-lg bg-slate-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
