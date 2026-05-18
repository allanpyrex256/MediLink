import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  LockKeyhole,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRoundCheck,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const photos = {
  hero:
    "https://images.pexels.com/photos/19963130/pexels-photo-19963130.jpeg?auto=compress&cs=tinysrgb&w=1800",
  consultation:
    "https://images.pexels.com/photos/19957218/pexels-photo-19957218.jpeg?auto=compress&cs=tinysrgb&w=1200",
  digitalCare:
    "https://images.pexels.com/photos/19963170/pexels-photo-19963170.jpeg?auto=compress&cs=tinysrgb&w=1200",
  pharmacy:
    "https://images.pexels.com/photos/6129579/pexels-photo-6129579.jpeg?auto=compress&cs=tinysrgb&w=1200",
} as const;

const heroStats = [
  { label: "Patient flow", value: "42 today" },
  { label: "Mobile money", value: "MTN + Airtel" },
  { label: "Staff roles", value: "Owner controlled" },
] as const;

const workflow = [
  {
    title: "Register and schedule",
    body: "Reception captures patient details, books visits, and keeps the queue moving.",
    icon: CalendarDays,
    image: photos.consultation,
    alt: "Black female doctor using a tablet in a clinical consultation",
  },
  {
    title: "Consult and prescribe",
    body: "Doctors review patient context, notes, lab requests, and medication plans.",
    icon: Stethoscope,
    image: photos.digitalCare,
    alt: "Black female doctor taking notes while coordinating patient care by phone",
  },
  {
    title: "Dispense and collect",
    body: "Pharmacy and billing teams manage stock, prescriptions, invoices, and receipts.",
    icon: Pill,
    image: photos.pharmacy,
    alt: "Medical practitioner organizing medication supplies in a clinic",
  },
] as const;

const features = [
  {
    title: "Patient Records",
    body: "Clean profiles, visit history, contacts, allergies, and care notes.",
    icon: Users,
    tone: "bg-sky-100 text-sky-800",
  },
  {
    title: "Role-Based Staff",
    body: "Owner, doctor, dentist, receptionist, pharmacist, and patient access levels.",
    icon: LockKeyhole,
    tone: "bg-emerald-100 text-emerald-800",
  },
  {
    title: "Billing and Payments",
    body: "UGX invoices, cashier collections, MTN MoMo, and Airtel Money.",
    icon: WalletCards,
    tone: "bg-amber-100 text-amber-800",
  },
  {
    title: "Pharmacy Control",
    body: "Prescriptions, stock alerts, dispensing status, and sales tracking.",
    icon: Pill,
    tone: "bg-rose-100 text-rose-800",
  },
] as const;

const proofPoints = [
  { label: "Built for clinics", icon: Building2 },
  { label: "Secure records", icon: ShieldCheck },
  { label: "Fast daily workflow", icon: Sparkles },
] as const;

const benefits = [
  "Fewer missing files and repeated patient questions",
  "Clear owner visibility across billing, pharmacy, and staff",
  "Cleaner handoff between reception, clinicians, dentists, and dispensary",
  "Simple monthly plans for clinics, dental practices, hospitals, and pharmacies",
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
  },
  {
    name: "Clinic",
    audience: "Growing teams",
    price: "UGX 150,000",
    period: "/month",
    body: "For teams that need staff roles, prescriptions, payments, and stock visibility.",
    features: ["Staff access control", "Prescription tracking", "MTN and Airtel payments", "Stock alerts"],
    href: "/register?intent=demo&plan=growth",
    featured: true,
  },
  {
    name: "Dentistry",
    audience: "Dental practices",
    price: "UGX 180,000",
    period: "/month",
    body: "For dentists who need chair scheduling, treatment notes, and payments.",
    features: ["Dental appointments", "Treatment notes", "Patient records", "Billing reminders"],
    href: "/register?intent=demo&plan=growth",
  },
  {
    name: "Hospital",
    audience: "Large facilities",
    price: "UGX 450,000",
    period: "/month",
    body: "For hospitals that need departments, admissions, laboratory, pharmacy, and reports.",
    features: ["Admissions", "Laboratory", "Pharmacy operations", "Advanced reporting"],
    href: "/register?intent=demo&plan=enterprise",
  },
] as const;

export function HomePageContent() {
  return (
    <>
      <section className="relative min-h-[calc(100svh-120px)] overflow-hidden bg-slate-950 text-white">
        <Image
          src={photos.hero}
          alt="Black female doctor smiling with a stethoscope"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,12,33,0.88)_0%,rgba(4,12,33,0.68)_42%,rgba(4,12,33,0.2)_100%)]" />

        <div className="relative mx-auto flex min-h-[calc(100svh-120px)] max-w-[1500px] flex-col justify-center px-5 py-16 sm:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              <BadgeCheck className="size-4 text-emerald-300" aria-hidden="true" />
              Clinic, dental, hospital, and pharmacy management for Uganda
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
              MediLink
            </h1>
            <p className="mt-5 max-w-2xl text-2xl font-bold leading-tight text-emerald-100 sm:text-3xl">
              Beautiful digital operations for modern medical teams.
            </p>
            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-slate-100 sm:text-lg">
              Manage patient records, appointments, prescriptions, billing, pharmacy stock,
              and staff accounts from one clean workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register?intent=demo&plan=growth"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-7 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400"
              >
                Request Demo
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/12 px-7 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-12 grid max-w-4xl gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/20 bg-white/12 p-4 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-normal text-emerald-200">{stat.label}</p>
                <p className="mt-2 text-lg font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-emerald-700">Trusted workflow</p>
            <h2 className="mt-3 text-4xl font-bold tracking-normal text-[#080833] sm:text-5xl">
              Every daily handoff, from reception to pharmacy.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {proofPoints.map((point) => {
              const Icon = point.icon;

              return (
                <div key={point.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">{point.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <SectionShell
        id="features"
        eyebrow="Care flow"
        title="A medical workspace that looks as professional as your clinic"
        body="Real workflows, clean screens, and role-based control for teams that need speed and clarity."
        variant="soft"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {workflow.map((item) => (
            <ImageCard key={item.title} {...item} />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="benefits"
        eyebrow="Features"
        title="Everything important stays connected"
        body="MediLink keeps the practical parts of healthcare work in one place."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </SectionShell>

      <section className="border-b border-slate-200 bg-[#f5fbf8]">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-20">
          <div className="relative min-h-[430px] overflow-hidden rounded-lg">
            <Image
              src={photos.digitalCare}
              alt="Black female doctor reviewing notes while coordinating patient care"
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-emerald-700">Owner visibility</p>
            <h2 className="mt-3 text-4xl font-bold tracking-normal text-[#080833] sm:text-5xl">
              Give each account the right level of access.
            </h2>
            <p className="mt-5 text-base font-medium leading-8 text-slate-600">
              Owners can see the whole business, while doctors, dentists, receptionists, pharmacists,
              and patients only get the workspace they need.
            </p>
            <div className="mt-7 grid gap-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-white p-4">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  <p className="text-sm font-bold leading-6 text-slate-800">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionShell
        id="how-it-works"
        eyebrow="How it works"
        title="Start with the team you already have"
        body="Set up the business, invite staff accounts, and move daily work into a cleaner flow."
        variant="soft"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <StepCard number="01" title="Create your workspace" body="Register the clinic, dental practice, hospital, or pharmacy and choose the right plan." icon={Building2} />
          <StepCard number="02" title="Invite your team" body="Add owners, doctors, dentists, receptionists, and pharmacists under the same business." icon={UserRoundCheck} />
          <StepCard number="03" title="Run the day" body="Track patients, payments, prescriptions, stock, and reports from one dashboard." icon={FileText} />
        </div>
      </SectionShell>

      <SectionShell
        id="pricing"
        eyebrow="Pricing"
        title="Simple monthly plans"
        body="Clear pricing makes it easy to start small and expand as the business grows."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {pricing.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
      </SectionShell>

      <section id="contact" className="scroll-mt-24 bg-[#071133] text-white">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-emerald-300">Request demo</p>
            <h2 className="mt-3 text-4xl font-bold tracking-normal sm:text-5xl">
              Make the clinic feel organized from the first login.
            </h2>
            <p className="mt-5 max-w-3xl text-base font-medium leading-7 text-slate-300">
              See how MediLink can help your team manage patients, prescriptions,
              billing, pharmacy, and staff access with less paperwork.
            </p>
          </div>
          <Link
            href="/register?intent=demo&plan=growth"
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
      className={`scroll-mt-24 border-b border-slate-200 ${variant === "soft" ? "bg-slate-50" : "bg-white"}`}
    >
      <div className="mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-normal text-emerald-700">{eyebrow}</p>
          <h2 className="mt-3 text-4xl font-bold tracking-normal text-[#080833] sm:text-5xl">{title}</h2>
          <p className="mt-4 text-base font-medium leading-7 text-slate-600">{body}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function ImageCard({
  title,
  body,
  icon: Icon,
  image,
  alt,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
  image: string;
  alt: string;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md shadow-slate-100">
      <div className="relative aspect-[4/3]">
        <Image src={image} alt={alt} fill sizes="(min-width: 1024px) 31vw, 100vw" className="object-cover" />
      </div>
      <div className="p-5">
        <div className="grid size-11 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-[#080833]">{title}</h3>
        <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{body}</p>
      </div>
    </article>
  );
}

function FeatureCard({
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
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-md shadow-slate-100">
      <div className={`grid size-12 place-items-center rounded-lg ${tone}`}>
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-6 text-xl font-bold tracking-normal text-[#080833]">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{body}</p>
    </article>
  );
}

function StepCard({
  number,
  title,
  body,
  icon: Icon,
}: {
  number: string;
  title: string;
  body: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-md shadow-slate-100">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-black text-emerald-700">{number}</span>
        <div className="grid size-11 place-items-center rounded-lg bg-sky-100 text-sky-800">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
      <h3 className="mt-6 text-2xl font-bold text-[#080833]">{title}</h3>
      <p className="mt-3 text-base font-medium leading-7 text-slate-600">{body}</p>
    </article>
  );
}

function PricingCard({
  name,
  audience,
  price,
  period,
  body,
  features,
  href,
  featured = false,
}: {
  name: string;
  audience: string;
  price: string;
  period: string;
  body: string;
  features: readonly string[];
  href: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`relative rounded-lg border bg-white p-6 shadow-lg transition hover:-translate-y-1 ${
        featured ? "border-emerald-300 shadow-emerald-100" : "border-slate-200 shadow-slate-100"
      }`}
    >
      {featured ? (
        <span className="absolute right-5 top-5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
          Most popular
        </span>
      ) : null}
      <p className="text-sm font-bold uppercase tracking-normal text-slate-500">{audience}</p>
      <h3 className="mt-3 text-2xl font-bold text-[#080833]">{name}</h3>
      <div className="mt-5 flex items-end gap-1">
        <p className="text-4xl font-bold tracking-normal text-[#080833]">{price}</p>
        <p className="pb-1 text-sm font-bold text-slate-500">{period}</p>
      </div>
      <p className="mt-4 min-h-[72px] text-sm font-medium leading-6 text-slate-600">{body}</p>
      <ul className="mt-6 grid gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold transition ${
          featured
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "border border-slate-300 bg-white text-slate-900 hover:border-emerald-300 hover:bg-emerald-50"
        }`}
      >
        Get Started
      </Link>
    </article>
  );
}
