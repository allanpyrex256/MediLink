import Link from "next/link";
import { CreditCard } from "lucide-react";
import { connection } from "next/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseConfig } from "@/lib/config";
import { publicTenantPayUrl } from "@/lib/public-directory";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatUgx } from "@/lib/utils";

export const metadata = {
  title: "Account paused | MediLink",
};

type PausedAccountDetails = {
  amount: number;
  business: string;
  paymentUrl: string;
  plan: string;
};

export default async function AccountPausedPage() {
  await connection();
  const details = await getPausedAccountDetails();
  const planText = details?.plan ? `${details.plan} plan` : "your plan";

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-4 grid size-12 place-items-center rounded-lg bg-amber-50 text-amber-700">
            <CreditCard className="size-6" />
          </div>
          <CardTitle>Your free trial has ended</CardTitle>
          <CardDescription>
            Pay {planText} to continue using MediLink.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-slate-600">
            {details
              ? `${details.business} needs to pay ${details.amount > 0 ? formatUgx(details.amount) : "the subscription fee"} before dashboard access continues.`
              : "Pay your subscription plan to continue using the dashboard."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={details?.paymentUrl ?? "/login"}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
            >
              Pay {planText}
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-100 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

async function getPausedAccountDetails(): Promise<PausedAccountDetails | null> {
  if (!hasSupabaseConfig()) return null;

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile?.tenant_id) return null;

    const [{ data: tenant }, { data: subscriptions }] = await Promise.all([
      supabase
        .from("tenants")
        .select("name, slug")
        .eq("id", profile.tenant_id)
        .single(),
      supabase
        .from("subscriptions")
        .select("plan, amount")
        .eq("tenant_id", profile.tenant_id)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    if (!tenant?.slug) return null;

    const subscription = subscriptions?.[0];
    const amount = Number(subscription?.amount ?? 0);
    const plan = planLabel(subscription?.plan);
    const search = new URLSearchParams({
      purpose: "subscription",
      plan,
    });

    if (amount > 0) search.set("amount", String(Math.round(amount)));

    return {
      amount,
      business: tenant.name,
      paymentUrl: `${publicTenantPayUrl({ slug: tenant.slug })}?${search.toString()}`,
      plan,
    };
  } catch {
    return null;
  }
}

function planLabel(plan: unknown) {
  if (plan === "growth") return "Clinic";
  if (plan === "dental") return "Dental";
  if (plan === "enterprise") return "Hospital";
  return "Starter";
}
