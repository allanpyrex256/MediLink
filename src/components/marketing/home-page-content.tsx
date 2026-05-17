import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
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

const problemPoints = [
  "Paper records get lost between reception, doctors, and billing.",
  "Manual billing slows down patients and makes daily revenue hard to track.",
  "Prescription and dispensing records become messy as clinics get busier.",
] as const;

const solutionCards = [
  {
    title: "Patient Management",
    body: "Keep patient profiles, visits, appointments, and care history organized in one secure system.",
    icon: Users,
    tone: "bg-sky-100 text-sky-700",
  },
  {
    title: "Prescription & Dispensing Tracking",
    body: "Record prescribed medicine, what was dispensed, stock impact, and pickup status without paperwork.",
    icon: Pill,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Billing & Payments",
    body: "Track UGX invoices, cashier collections, MTN MoMo, Airtel Money, and unpaid balances clearly.",
    icon: WalletCards,
    tone: "bg-violet-100 text-violet-700",
  },
  {
    title: "Staff & Clinic Control",
    body: "Give reception, doctors, pharmacists, and clinic owners the right access for daily operations.",
    icon: Building2,
    tone: "bg-amber-100 text-amber-700",
  },
] as const;

const benefits = [
  {
    title: "Faster patient service",
    body: "Reception, consultation, pharmacy, and billing teams work from shared, organized records.",
    icon: Zap,
  },
  {
    title: "Reduced errors",
    body: "Clear patient files, prescriptions, invoices, and stock information reduce everyday mistakes.",
    icon: ShieldCheck,
  },
  {
    title: "Better revenue tracking",
    body: "Clinic owners can see collections, unpaid bills, and mobile money activity with less guesswork.",
    icon: CreditCard,
  },
  {
    title: "Easy clinic operations",
    body: "Simple workflows help teams move away from paper without forcing a complicated enterprise system.",
    icon: CheckCircle2,
  },
] as const;

const steps = [
  {
    title: "Register your clinic",
    body: "Set up your clinic, hospital, or pharmacy profile with local contacts and branches.",
  },
  {
    title: "Add staff & patients",
    body: "Invite your team and start organizing patient records, appointments, stock, and billing.",
  },
  {
    title: "Start managing digitally",
    body: "Run daily operations with cleaner records, faster service, and better financial visibility.",
  },
] as const;

const pricing = [
  {
    name: "Starter Plan",
    price: "Affordable monthly subscription",
    body: "For small clinics moving from paper records to simple digital operations.",
    features: ["Patients and appointments", "Basic billing", "Clinic reports"],
  },
  {
    name: "Clinic Plan",
    price: "Built for growing teams",
    body: "For clinics that need stronger staff control, prescriptions, and payment tracking.",
    features: ["Staff access control", "Prescriptions", "MTN and Airtel tracking"],
  },
  {
    name: "Hospital Plan",
    price: "For larger facilities",
    body: "For hospitals that need departments, admissions, pharmacy, laboratory, and management reports.",
    features: ["Departments and admissions", "Laboratory and pharmacy", "Advanced reporting"],
  },
] as const;

export function HomePageContent() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7fbff]">
        <div className="absolute inset-x-0 top-0 h-28 bg-white" aria-hidden="true" />
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[#e8f7ef] lg:block" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] items-center justify-center lg:flex" aria-hidden="true">
          <div className="grid grid-cols-2 gap-5">
            <HeroSymbol icon={Stethoscope} tone="bg-white text-violet-700" />
            <HeroSymbol icon={ClipboardList} tone="bg-white text-sky-700" />
            <HeroSymbol icon={Pill} tone="bg-white text-emerald-700" />
            <HeroSymbol icon={WalletCards} tone="bg-white text-amber-700" />
          </div>
        </div>
        <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-[1500px] items-center px-5 py-14 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-normal text-violet-700">
              MediLink
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-[1.02] tracking-normal text-[#080833] sm:text-6xl lg:text-7xl">
              Digital clinic management for Uganda.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-700">
              A complete digital system for managing clinics, prescriptions, and patient care in Uganda.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-violet-600 px-7 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                Request Demo
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-7 text-sm font-bold text-slate-900 shadow-sm shadow-slate-200 transition hover:border-violet-300 hover:bg-violet-50"
              >
                <PlayCircle className="size-4" aria-hidden="true" />
                Watch how it works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-normal text-violet-700">The problem</p>
              <h2 className="mt-3 text-3xl font-bold tracking-normal text-[#080833] sm:text-4xl">
                Busy clinics should not depend on scattered paperwork.
              </h2>
            </div>
            <div className="grid gap-3">
              {problemPoints.map((point) => (
                <div key={point} className="flex gap-3 rounded-lg bg-slate-50 p-4">
                  <FileText className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden="true" />
                  <p className="text-base font-semibold leading-7 text-slate-700">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionShell
        id="features"
        eyebrow="Solution"
        title="One system for everyday clinic operations"
        body="MediLink helps clinics, hospitals, and pharmacies move from disconnected paperwork to organized digital operations."
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
        title="Designed around outcomes clinic owners care about"
        body="The value is not more screens. The value is faster service, cleaner records, fewer mistakes, and better control over money."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
              <benefit.icon className="size-7 text-violet-700" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-bold tracking-normal text-[#080833]">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{benefit.body}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="how-it-works"
        eyebrow="How it works"
        title="Start simple, then grow digitally"
        body="MediLink is set up around the way local health businesses already operate."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-md shadow-slate-100">
              <span className="grid size-10 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-xl font-bold text-[#080833]">{step.title}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{step.body}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="pricing"
        eyebrow="Pricing"
        title="Affordable monthly plans for different health businesses"
        body="Start with what your clinic needs today and upgrade as your operations grow."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {pricing.map((plan) => (
            <article key={plan.name} className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
              <h3 className="text-xl font-bold text-[#080833]">{plan.name}</h3>
              <p className="mt-3 text-base font-bold text-violet-700">{plan.price}</p>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{plan.body}</p>
              <ul className="mt-5 grid gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </SectionShell>

      <section id="contact" className="scroll-mt-24 bg-[#071133] text-white">
        <div className="mx-auto grid max-w-[1500px] gap-6 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-emerald-300">
              Request demo
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Transform your clinic today.
            </h2>
            <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-slate-300">
              See how MediLink can help your team manage patients, prescriptions, billing, and daily clinic work with less paperwork.
            </p>
          </div>
          <Link
            href="/demo-flow"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-7 text-sm font-bold text-[#071133] transition hover:bg-slate-100"
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
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:py-14">
        <div className="mb-7 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-normal text-violet-700">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-[#080833] sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-base font-medium leading-7 text-slate-600">{body}</p>
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
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-md shadow-slate-100">
      <div className={`grid size-12 place-items-center rounded-lg ${tone}`}>
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-bold tracking-normal text-[#080833]">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{body}</p>
    </article>
  );
}

function HeroSymbol({ icon: Icon, tone }: { icon: LucideIcon; tone: string }) {
  return (
    <div className={`grid size-24 place-items-center rounded-lg border border-white/80 shadow-xl shadow-emerald-900/10 ${tone}`}>
      <Icon className="size-10" aria-hidden="true" />
    </div>
  );
}
