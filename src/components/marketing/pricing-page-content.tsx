"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BriefcaseMedical,
  Building2,
  Check,
  Cloud,
  CreditCard,
  Database,
  Headphones,
  Pill,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Stethoscope,
} from "lucide-react";

const plans = [
  {
    value: "starter",
    kind: "clinic",
    name: "Starter Clinic",
    description: "Perfect for small clinics and solo practitioners",
    monthlyPrice: 50_000,
    accent: "violet",
    icon: Stethoscope,
    features: [
      "Patient Management",
      "Appointment Booking",
      "Billing & Invoicing",
      "Basic Reports",
      "1 User Account",
      "Email Support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    value: "starter",
    kind: "pharmacy",
    name: "Pharmacy Plan",
    description: "For pharmacies, drug shops, and dispensary counters",
    monthlyPrice: 50_000,
    accent: "orange",
    icon: Pill,
    features: [
      "Drug inventory management",
      "Expiry alerts",
      "Sales & receipts",
      "Daily sales sheet",
      "3 User Accounts",
      "Email & WhatsApp Support",
    ],
    cta: "Choose Plan",
    popular: false,
  },
  {
    value: "dental",
    kind: "dentistry",
    name: "Dentistry Plan",
    description: "For dental practices and chair-based appointment workflows",
    monthlyPrice: 60_000,
    accent: "green",
    icon: Stethoscope,
    features: [
      "Dental appointments",
      "Treatment notes",
      "Patient records",
      "Billing reminders",
      "5 User Accounts",
      "Priority Support",
    ],
    cta: "Choose Plan",
    popular: false,
  },
  {
    value: "growth",
    kind: "clinic",
    name: "Growing Clinic",
    description: "For growing clinics and medical centers",
    monthlyPrice: 100_000,
    accent: "green",
    icon: BriefcaseMedical,
    features: [
      "All Starter features",
      "Pharmacy Management",
      "Lab Management",
      "SMS & WhatsApp Reminders",
      "5 User Accounts",
      "Priority Support",
    ],
    cta: "Choose Plan",
    popular: false,
  },
  {
    value: "enterprise",
    kind: "hospital",
    name: "Hospital Plan",
    description: "For hospitals and multi-department healthcare facilities",
    monthlyPrice: 200_000,
    accent: "violet",
    icon: Building2,
    features: [
      "All Growing Clinic features",
      "Advanced Reports & Analytics",
      "Multi-Branch Management",
      "Inventory Management",
      "20 User Accounts",
      "Dedicated Support",
    ],
    cta: "Choose Plan",
    popular: true,
  },
] as const;

const included = [
  { label: "Secure &\nHIPAA Compliant", icon: ShieldCheck },
  { label: "Cloud Based\n& Reliable", icon: Cloud },
  { label: "Regular\nUpdates", icon: RefreshCw },
  { label: "Data Backup\n& Recovery", icon: Database },
  { label: "Mobile\nFriendly", icon: Smartphone },
  { label: "Local Support\nin Uganda", icon: Headphones },
] as const;

const accentStyles = {
  violet: {
    icon: "bg-violet-100 text-violet-700 ring-violet-200",
    check: "text-violet-600",
    price: "text-violet-600",
    button: "border-violet-500 text-violet-600 hover:bg-violet-50",
    primary: "bg-violet-600 text-white shadow-violet-200 hover:bg-violet-700",
    card: "border-violet-300 shadow-violet-100",
  },
  green: {
    icon: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    check: "text-emerald-600",
    price: "text-emerald-600",
    button: "border-emerald-500 text-emerald-700 hover:bg-emerald-50",
    primary: "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700",
    card: "border-emerald-300 shadow-emerald-100",
  },
  orange: {
    icon: "bg-orange-100 text-orange-600 ring-orange-200",
    check: "text-orange-500",
    price: "text-orange-600",
    button: "border-orange-500 text-orange-600 hover:bg-orange-50",
    primary: "bg-orange-600 text-white shadow-orange-200 hover:bg-orange-700",
    card: "border-orange-300 shadow-orange-100",
  },
  blue: {
    icon: "bg-blue-100 text-blue-700 ring-blue-200",
    check: "text-blue-600",
    price: "text-blue-600",
    button: "border-blue-500 text-blue-600 hover:bg-blue-50",
    primary: "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700",
    card: "border-blue-300 shadow-blue-100",
  },
} as const;

type BillingCycle = "monthly" | "annual";

export function PricingPageContent() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <section id="pricing" className="mx-auto max-w-[1450px] px-5 pb-12 pt-12 sm:px-8 lg:pt-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-4xl text-center"
      >
        <h1 className="text-4xl font-bold tracking-normal text-[#080833] sm:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          Choose the perfect plan for your healthcare facility. All plans include core features
          to manage your clinic, dental practice, hospital or pharmacy efficiently.
        </p>
      </motion.div>

      <div className="mt-6 flex flex-col items-center justify-center gap-4 md:flex-row">
        <div className="relative grid w-full max-w-[350px] grid-cols-2 rounded-lg border border-slate-300 bg-white/95 p-2 shadow-xl shadow-sky-100 md:max-w-[430px]">
          <motion.span
            className="absolute bottom-2 top-2 rounded-lg bg-violet-600"
            initial={false}
            animate={{
              left: billingCycle === "monthly" ? 8 : "50%",
              right: billingCycle === "monthly" ? "50%" : 8,
            }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          />
          {(["monthly", "annual"] as const).map((cycle) => (
            <button
              key={cycle}
              className="relative z-10 rounded-lg px-4 py-2 text-sm font-bold transition"
              type="button"
              onClick={() => setBillingCycle(cycle)}
              aria-pressed={billingCycle === cycle}
            >
              <span className={billingCycle === cycle ? "text-white" : "text-slate-950"}>
                {cycle === "monthly" ? "Monthly" : "Annual"}
                {cycle === "annual" ? (
                  <span
                    className={
                      billingCycle === cycle
                        ? "ml-1 rounded-full bg-white/20 px-2 py-1 text-[11px] text-white"
                        : "ml-1 rounded-full bg-violet-100 px-2 py-1 text-[11px] text-violet-700"
                    }
                  >
                    12 months
                  </span>
                ) : null}
              </span>
              <span
                className={
                  billingCycle === cycle
                    ? "block pt-1 text-xs font-medium text-violet-100"
                    : "block pt-1 text-xs font-medium text-slate-600"
                }
              >
                {cycle === "monthly" ? "Pay monthly" : "Pay yearly"}
              </span>
            </button>
          ))}
        </div>
        <motion.p
          key={billingCycle}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden max-w-[220px] text-sm font-semibold leading-6 text-violet-600 md:block"
        >
          {billingCycle === "annual"
            ? "Annual billing is selected. Prices show the yearly payment."
            : "Monthly billing is selected. Switch to annual for yearly payment."}
        </motion.p>
      </div>

      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-3">
        {["UGX pricing", "Mastercard accepted", "MTN MoMo", "Airtel Money", "Bank transfer"].map((item, index) => (
          <span
            key={item}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm"
          >
            {index === 1 ? (
              <CreditCard className="size-4 text-violet-600" aria-hidden="true" />
            ) : null}
            {item}
          </span>
        ))}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const styles = accentStyles[plan.accent];
          const price = formatPrice(
            billingCycle === "annual" ? plan.monthlyPrice * 12 : plan.monthlyPrice,
          );
          const billedLine =
            billingCycle === "annual"
              ? `Billed annually at ${formatPrice(plan.monthlyPrice * 12)}/year`
              : "Billed monthly. Annual billing is also available.";

          return (
            <motion.section
              key={plan.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              whileHover={{ y: -6 }}
              className={`relative flex min-h-[480px] flex-col rounded-lg border bg-white/95 p-6 shadow-lg transition-shadow hover:shadow-2xl ${styles.card}`}
            >
              {plan.popular ? (
                <motion.div
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-lg bg-violet-600 px-8 py-2 text-xs font-bold text-white shadow-lg shadow-violet-200"
                >
                  Most Popular
                </motion.div>
              ) : null}
              <div className="grid justify-items-center text-center">
                <div className={`grid size-14 place-items-center rounded-full ring-1 ${styles.icon}`}>
                  <Icon className="size-7" aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-lg font-bold tracking-normal text-[#090932]">{plan.name}</h2>
                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">{plan.description}</p>
                <motion.p
                  key={`${plan.name}-${billingCycle}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-6 text-2xl font-bold tracking-normal ${styles.price}`}
                >
                  {price}
                  <span className="text-sm font-semibold text-slate-600">
                    {billingCycle === "annual" ? " / year" : " / month"}
                  </span>
                </motion.p>
                <p className="mt-3 min-h-5 text-xs font-medium text-slate-600">{billedLine}</p>
              </div>
              <ul className="mt-7 grid gap-4 text-sm font-medium text-slate-950">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`mt-0.5 size-4 shrink-0 ${styles.check}`} aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/register?plan=${plan.value}&kind=${plan.kind}&billing=${billingCycle}`}
                className={`mt-auto inline-flex h-11 items-center justify-center rounded-lg border px-4 text-sm font-bold shadow-sm transition active:scale-[0.98] ${
                  plan.popular ? styles.primary : styles.button
                }`}
              >
                {plan.cta}
              </Link>
            </motion.section>
          );
        })}
      </div>

      <motion.section
        id="features"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.35 }}
        className="mt-8 rounded-lg border border-slate-300 bg-white/95 p-6 shadow-lg shadow-sky-100"
      >
        <h2 className="text-center text-2xl font-bold tracking-normal text-[#080833]">All Plans Include</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {included.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-4 border-slate-200 px-3 lg:border-r last:border-r-0">
                <Icon className="size-7 shrink-0 text-violet-600" aria-hidden="true" />
                <p className="whitespace-pre-line text-sm font-semibold leading-5 text-slate-700">{item.label}</p>
              </div>
            );
          })}
        </div>
      </motion.section>

      <section id="about" className="mt-8 rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50 p-7 shadow-lg shadow-violet-100">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-[#080833]">
              Built for clinics, dental practices, hospitals, pharmacies, and labs in Uganda.
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-600">
              MediLink brings patient records, appointment booking, pharmacy inventory,
              billing, lab workflows, and branch reporting into one secure system.
            </p>
          </div>
          <Link
            href="/demo-flow"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-violet-600 px-8 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 active:scale-[0.98]"
          >
            Launch Demo Flow
          </Link>
        </div>
      </section>
    </section>
  );
}

function formatPrice(value: number | null) {
  if (value === null) return "Custom";
  const compact = new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
    notation: "compact",
  }).format(value);

  return `UGX ${compact.toUpperCase()}`;
}
