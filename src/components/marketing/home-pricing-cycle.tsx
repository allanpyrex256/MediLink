"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

type BillingCycle = "monthly" | "annual";

export type HomePricingPlan = {
  name: string;
  audience: string;
  monthlyPrice: number;
  body: string;
  features: readonly string[];
  href: string;
  featured?: boolean;
};

export function HomePricingCycle({ plans }: { plans: readonly HomePricingPlan[] }) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <div className="grid gap-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-grid w-full max-w-[340px] grid-cols-2 rounded-lg border border-slate-300 bg-slate-50 p-1 shadow-sm">
          {(["monthly", "annual"] as const).map((cycle) => {
            const selected = billingCycle === cycle;

            return (
              <button
                key={cycle}
                type="button"
                aria-pressed={selected}
                onClick={() => setBillingCycle(cycle)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  selected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-700 hover:bg-white hover:text-slate-950"
                }`}
              >
                {cycle === "monthly" ? "Monthly" : "Annual"}
              </button>
            );
          })}
        </div>
        <p className="text-sm font-semibold leading-6 text-slate-600">
          {billingCycle === "annual"
            ? "Annual billing shows the full yearly payment."
            : "Monthly billing keeps payments smaller month to month."}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} billingCycle={billingCycle} />
        ))}
      </div>
    </div>
  );
}

function PricingCard({
  plan,
  billingCycle,
}: {
  plan: HomePricingPlan;
  billingCycle: BillingCycle;
}) {
  const billedAmount = billingCycle === "annual" ? plan.monthlyPrice * 12 : plan.monthlyPrice;
  const period = billingCycle === "annual" ? "/year" : "/month";
  const href = withBillingCycle(plan.href, billingCycle);

  return (
    <article
      className={`relative rounded-lg border bg-white p-6 shadow-lg transition hover:-translate-y-1 ${
        plan.featured ? "border-emerald-300 shadow-emerald-100" : "border-slate-200 shadow-slate-100"
      }`}
    >
      {plan.featured ? (
        <span className="absolute right-5 top-5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
          Most popular
        </span>
      ) : null}
      <p className="text-sm font-bold uppercase tracking-normal text-slate-500">{plan.audience}</p>
      <h3 className="mt-3 text-2xl font-bold text-[#080833]">{plan.name}</h3>
      <div className="mt-5 flex items-end gap-1">
        <p className="text-4xl font-bold tracking-normal text-[#080833]">{formatPrice(billedAmount)}</p>
        <p className="pb-1 text-sm font-bold text-slate-500">{period}</p>
      </div>
      <p className="mt-2 text-xs font-bold text-emerald-700">
        {billingCycle === "annual"
          ? `Billed annually at ${formatFullPrice(billedAmount)}`
          : "Billed monthly"}
      </p>
      <p className="mt-4 min-h-[72px] text-sm font-medium leading-6 text-slate-600">{plan.body}</p>
      <ul className="mt-6 grid gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold transition ${
          plan.featured
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "border border-slate-300 bg-white text-slate-900 hover:border-emerald-300 hover:bg-emerald-50"
        }`}
      >
        Get Started
      </Link>
    </article>
  );
}

function withBillingCycle(href: string, billingCycle: BillingCycle) {
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}billing=${billingCycle}`;
}

function formatPrice(value: number) {
  return `UGX ${new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
    notation: "compact",
  })
    .format(value)
    .toUpperCase()}`;
}

function formatFullPrice(value: number) {
  return `UGX ${new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}
