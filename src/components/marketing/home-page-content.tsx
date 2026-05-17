import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Pill,
  PlayCircle,
  ShieldCheck,
  Stethoscope,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const trustBadges = [
  { label: "Secure patient data", icon: ShieldCheck },
  { label: "Role-based access", icon: Users },
  { label: "Built for Uganda clinics", icon: Building2 },
] as const;

const problemPoints = [
  "Paper records get lost",
  "Manual billing is slow",
  "Prescription tracking is messy",
] as const;

const solutionCards = [
  {
    title: "Patient Records",
    body: "Clean files, visit history, contacts, and care notes.",
    icon: Users,
    tone: "bg-sky-100 text-sky-700",
  },
  {
    title: "Prescription Tracking",
    body: "Prescriptions, dispensing, stock movement, and pickup status.",
    icon: Pill,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Billing System",
    body: "UGX invoices, cashier collections, MTN MoMo, and Airtel Money.",
    icon: WalletCards,
    tone: "bg-violet-100 text-violet-700",
  },
  {
    title: "Clinic Control",
    body: "Simple access for reception, doctors, pharmacy, and owners.",
    icon: Building2,
    tone: "bg-amber-100 text-amber-700",
  },
] as const;

const benefits = [
  {
    title: "Faster Service",
    body: "Move patients through reception, consultation, pharmacy, and billing with less waiting.",
    icon: Zap,
  },
  {
    title: "Fewer Errors",
    body: "Reduce missing files, unclear prescriptions, and manual payment mistakes.",
    icon: ShieldCheck,
  },
  {
    title: "Clear Revenue",
    body: "See collections, unpaid bills, and mobile money activity without guesswork.",
    icon: CreditCard,
  },
  {
    title: "Easy Operations",
    body: "Keep the workflow simple enough for busy local teams to use daily.",
    icon: CheckCircle2,
  },
] as const;

const steps = [
  {
    title: "Register clinic",
    body: "Set up your clinic, hospital, or pharmacy profile.",
  },
  {
    title: "Add team",
    body: "Invite staff and add patient, stock, and billing records.",
  },
  {
    title: "Go digital",
    body: "Run daily operations with cleaner records and better control.",
  },
] as const;

const pricing = [
  {
    name: "Starter",
    audience: "Small clinics",
    price: "UGX 50,000",
    period: "/month",
    body: "For clinics moving from paper records to a simple digital workflow.",
    features: ["Patient records", "Appointments", "Basic billing", "Monthly reports"],
    href: "/register?intent=demo&plan=starter",
    featured: false,
  },
  {
    name: "Clinic",
    audience: "Growing teams",
    price: "UGX 150,000",
    period: "/month",
    body: "For clinics that need staff roles, prescriptions, payments, and stock visibility.",
    features: ["Staff access control", "Prescription tracking", "MTN and Airtel payments", "Stock alerts"],
    href: "/register?intent=demo&plan=growth",
    featured: true,
  },
  {
    name: "Hospital",
    audience: "Large facilities",
    price: "UGX 450,000",
    period: "/month",
    body: "For hospitals that need departments, admissions, laboratory, pharmacy, and reports.",
    features: ["Admissions", "Laboratory", "Pharmacy operations", "Advanced reporting"],
    href: "/register?intent=demo&plan=enterprise",
    featured: false,
  },
] as const;

export function HomePageContent() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7fbff]">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "linear-gradient(#dbeafe 1px, transparent 1px), linear-gradient(90deg, #dbeafe 1px, transparent 1px), linear-gradient(135deg, #f7fbff 0%, #ffffff 46%, #ecfdf5 100%)",
            backgroundSize: "42px 42px, 42px 42px, auto",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid min-h-[calc(100vh-72px)] max-w-[1500px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-violet-200 bg-white/85 px-4 py-2 text-sm font-bold text-violet-700 shadow-sm shadow-violet-100">
              Simple clinic management software built for African healthcare systems
            </p>
            <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-normal text-[#080833] sm:text-6xl lg:text-7xl">
              Digital clinic management for Uganda.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-700">
              A complete digital system for managing clinics, prescriptions, billing,
              and patient care in Uganda.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register?intent=demo&plan=growth"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-violet-600 px-7 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:scale-[1.02] hover:bg-violet-700"
              >
                Request Demo
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-7 text-sm font-bold text-slate-900 shadow-sm shadow-slate-200 transition hover:scale-[1.02] hover:border-violet-300 hover:bg-violet-50"
              >
                <PlayCircle className="size-4" aria-hidden="true" />
                Watch how it works
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {trustBadges.map((badge) => {
                const Icon = badge.icon;

                return (
                  <div
                    key={badge.label}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm shadow-slate-100"
                  >
                    <Icon className="size-4 text-emerald-600" aria-hidden="true" />
                    {badge.label}
                  </div>
                );
              })}
            </div>
          </div>

          <HeroProductVisual />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-violet-700">
              The problem
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-normal text-[#080833]">
              Clinics lose time when work stays on paper.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {problemPoints.map((point) => (
              <div
                key={point}
                className="rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-slate-100"
              >
                <FileText className="size-7 text-rose-600" aria-hidden="true" />
                <p className="mt-4 text-lg font-bold text-slate-900">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionShell
        id="features"
        eyebrow="Solution"
        title="Everything needed for daily clinic work"
        body="Short, practical tools for local healthcare teams."
        variant="soft"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {solutionCards.map((feature) => (
            <InfoCard key={feature.title} {...feature} />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="benefits"
        eyebrow="Benefits"
        title="Built around business outcomes"
        body="Less paperwork. Better service. Clearer money tracking."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <InfoCard
              key={benefit.title}
              title={benefit.title}
              body={benefit.body}
              icon={benefit.icon}
              tone="bg-violet-100 text-violet-700"
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="how-it-works"
        eyebrow="How it works"
        title="Three steps to start"
        body="Start small, then grow into a full digital workflow."
        variant="soft"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-md shadow-slate-100 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200"
            >
              <span className="grid size-11 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-6 text-2xl font-bold text-[#080833]">{step.title}</h3>
              <p className="mt-3 text-base font-medium leading-7 text-slate-600">{step.body}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="pricing"
        eyebrow="Pricing"
        title="Simple monthly pricing"
        body="Clear plans make the product feel real and easy to buy."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {pricing.map((plan) => (
            <article
              key={plan.name}
              className={`relative rounded-lg border bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl ${
                plan.featured
                  ? "border-violet-300 shadow-violet-100"
                  : "border-slate-200 shadow-slate-100"
              }`}
            >
              {plan.featured ? (
                <span className="absolute right-5 top-5 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">
                  Most popular
                </span>
              ) : null}
              <p className="text-sm font-bold uppercase tracking-normal text-slate-500">
                {plan.audience}
              </p>
              <h3 className="mt-3 text-2xl font-bold text-[#080833]">{plan.name}</h3>
              <div className="mt-5 flex items-end gap-1">
                <p className="text-4xl font-bold tracking-normal text-[#080833]">{plan.price}</p>
                <p className="pb-1 text-sm font-bold text-slate-500">{plan.period}</p>
              </div>
              <p className="mt-4 min-h-[72px] text-sm font-medium leading-6 text-slate-600">
                {plan.body}
              </p>
              <ul className="mt-6 grid gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold transition hover:scale-[1.01] ${
                  plan.featured
                    ? "bg-violet-600 text-white hover:bg-violet-700"
                    : "border border-slate-300 bg-white text-slate-900 hover:border-violet-300 hover:bg-violet-50"
                }`}
              >
                Get Started
              </Link>
            </article>
          ))}
        </div>
      </SectionShell>

      <section id="contact" className="scroll-mt-24 bg-[#071133] text-white">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-emerald-300">
              Request demo
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
              Transform your clinic today.
            </h2>
            <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-slate-300">
              See how MediLink can help your team manage patients, prescriptions,
              billing, and daily clinic work with less paperwork.
            </p>
          </div>
          <Link
            href="/register?intent=demo&plan=growth"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-7 text-sm font-bold text-[#071133] transition hover:scale-[1.02] hover:bg-slate-100"
          >
            Request Demo
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  body,
  children,
  variant = "white",
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
  variant?: "white" | "soft";
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 border-b border-slate-200 ${
        variant === "soft" ? "bg-slate-50" : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-normal text-violet-700">{eyebrow}</p>
          <h2 className="mt-3 text-4xl font-bold tracking-normal text-[#080833] sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-base font-medium leading-7 text-slate-600">{body}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function InfoCard({
  title,
  body,
  icon: Icon,
  tone,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-md shadow-slate-100 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-slate-200">
      <div className={`grid size-12 place-items-center rounded-lg ${tone}`}>
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-6 text-xl font-bold tracking-normal text-[#080833]">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{body}</p>
    </article>
  );
}

function HeroProductVisual() {
  return (
    <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
      <div className="rounded-lg border border-slate-300 bg-slate-950 p-3 shadow-2xl shadow-slate-400/40">
        <div className="overflow-hidden rounded-lg bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-rose-400" />
              <span className="size-3 rounded-full bg-amber-400" />
              <span className="size-3 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs font-bold text-slate-500">MediLink Clinic Workspace</p>
          </div>
          <div className="grid gap-0 md:grid-cols-[180px_1fr]">
            <div className="hidden border-r border-slate-200 bg-slate-50 p-4 md:block">
              {["Patients", "Billing", "Pharmacy", "Reports"].map((item, index) => (
                <div
                  key={item}
                  className={`mb-3 rounded-lg px-3 py-2 text-sm font-bold ${
                    index === 0 ? "bg-violet-600 text-white" : "text-slate-600"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-violet-700">
                    Today
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#080833]">
                    Clinic operations
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  Secure
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <PreviewMetric label="Patients" value="42" icon={Users} tone="text-sky-700" />
                <PreviewMetric label="Revenue" value="UGX" icon={WalletCards} tone="text-violet-700" />
                <PreviewMetric label="Stock" value="OK" icon={Pill} tone="text-emerald-700" />
              </div>

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-lg bg-violet-100 text-violet-700">
                    <Stethoscope className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950">Reception to care</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Patient record, invoice, prescription, and receipt in one flow.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2">
                  <PreviewLine width="w-11/12" color="bg-violet-500" />
                  <PreviewLine width="w-8/12" color="bg-sky-400" />
                  <PreviewLine width="w-10/12" color="bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-8 right-4 hidden w-44 rounded-lg border border-slate-300 bg-slate-950 p-2 shadow-2xl shadow-slate-400/40 sm:block">
        <div className="rounded-lg bg-white p-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" />
          <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
            Mobile money
          </p>
          <p className="mt-2 text-2xl font-bold text-[#080833]">UGX</p>
          <div className="mt-4 grid gap-2">
            <PreviewLine width="w-full" color="bg-emerald-500" />
            <PreviewLine width="w-9/12" color="bg-violet-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewMetric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <Icon className={`size-5 ${tone}`} aria-hidden="true" />
      <p className="mt-3 text-lg font-bold text-[#080833]">{value}</p>
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}

function PreviewLine({ width, color }: { width: string; color: string }) {
  return (
    <div className="h-2 rounded-full bg-white">
      <span className={`block h-full rounded-full ${width} ${color}`} />
    </div>
  );
}
