import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ClipboardList,
  Cloud,
  Database,
  Headphones,
  LayoutDashboard,
  MessageCircle,
  Pill,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ProductPreview } from "@/components/marketing/product-preview";

const stats = [
  { label: "demo tenants", value: "5" },
  { label: "role portals", value: "6" },
  { label: "sample records", value: "120+" },
] as const;

const features = [
  {
    title: "Clinic and hospital management",
    body: "Run appointments, departments, staff, patients, billing, and reports from one tenant workspace.",
    icon: Building2,
    tone: "bg-sky-100 text-sky-700",
  },
  {
    title: "Patient records",
    body: "Doctors can review histories, diagnoses, visit notes, lab requests, and prescriptions without paper files.",
    icon: ClipboardList,
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Appointments and reminders",
    body: "Reception teams can book visits, track queues, and keep patients updated by SMS or WhatsApp.",
    icon: CalendarDays,
    tone: "bg-violet-100 text-violet-700",
  },
  {
    title: "Pharmacy inventory",
    body: "Pharmacists can manage stock levels, expiry alerts, prescription orders, and dispensing revenue.",
    icon: Pill,
    tone: "bg-orange-100 text-orange-700",
  },
  {
    title: "Billing and invoices",
    body: "Create invoices, track insurance balances, collect mobile money, and review revenue in real time.",
    icon: ReceiptText,
    tone: "bg-amber-100 text-amber-700",
  },
  {
    title: "Enterprise security",
    body: "Role-based access, tenant isolation, Supabase auth, PostgreSQL storage, and audit-friendly workflows.",
    icon: ShieldCheck,
    tone: "bg-rose-100 text-rose-700",
  },
] as const;

const screenshots = [
  {
    title: "Hospital command center",
    body: "Busy departments, lab requests, daily patients, and revenue for administrators.",
    kind: "hospital",
  },
  {
    title: "Doctor patient records",
    body: "Consultations, diagnoses, prescriptions, and visit history in one clinical view.",
    kind: "patients",
  },
  {
    title: "Pharmacy inventory",
    body: "Stock alerts, ready pickups, fulfillment lanes, and pharmacy sales.",
    kind: "inventory",
  },
] as const;

const rolePortals = [
  {
    role: "Super Admin",
    dashboard: "Platform control",
    body: "Open the MediLink Platform Owner view for tenants, revenue, renewals, and support.",
    href: "/demo/kampala-hospital?account=owner%40medilink.africa&next=/super-admin",
    icon: ShieldCheck,
    tone: "bg-violet-600 text-white",
  },
  {
    role: "Hospital Administrator",
    dashboard: "Operations & Staff Control",
    body: "Open Kampala Hospital with appointments, billing, staff, branches, and reports.",
    href: "/demo/kampala-hospital?account=admin%40kampalahospital.ug&next=/dashboard",
    icon: Building2,
    tone: "bg-sky-600 text-white",
  },
  {
    role: "Doctor",
    dashboard: "Patient records",
    body: "Review Brian Kato, Mary Nakato, Okello Nankya, prescriptions, and clinical notes.",
    href: "/demo/kampala-hospital?account=dr.namusoke%40kampalahospital.ug&next=/dashboard/patients",
    icon: Stethoscope,
    tone: "bg-emerald-600 text-white",
  },
  {
    role: "Receptionist",
    dashboard: "Appointments",
    body: "Manage Mengo Clinic's queue, appointment requests, intake, and patient follow-up.",
    href: "/demo/mengo-clinic?account=reception%40mengoclinic.ug&next=/dashboard/appointments",
    icon: CalendarDays,
    tone: "bg-amber-500 text-white",
  },
  {
    role: "Pharmacist",
    dashboard: "Medicine inventory",
    body: "Open Vine Pharmacy stock alerts, expiring medicine, dispensing lanes, and invoices.",
    href: "/demo/vine-pharmacy?account=pharmacy%40vinepharmacy.ug&next=/dashboard/inventory",
    icon: Pill,
    tone: "bg-orange-600 text-white",
  },
  {
    role: "Patient",
    dashboard: "Book appointments",
    body: "Open the public booking page for Kampala Hospital with a patient demo account.",
    href: "/demo/kampala-hospital?account=patient%40medilinkdemo.ug&next=/kampala-hospital/book",
    icon: Users,
    tone: "bg-slate-900 text-white",
  },
] as const;

const demoRecords = [
  ["Demo Hospital", "Kampala Hospital"],
  ["Demo Clinic", "Mengo Clinic, Mukono Medical Centre"],
  ["Demo Pharmacies", "Vine Pharmacy, GoodLife Pharmacy"],
  ["Demo Doctor", "Dr. Sarah Namusoke"],
  ["Demo Patients", "Brian Kato, Mary Nakato, Okello Nankya"],
  ["Local Contacts", "+256 414 256 800, Plot 14A Kololo Hill Drive"],
  ["Appointments", "Blood pressure review, malaria follow-up, pediatric checkup"],
  ["Prescriptions", "Amlodipine, Artemether/Lumefantrine, Paracetamol suspension"],
  ["Payments", "MTN MoMo, Airtel Money, UGX invoices, insurance balance"],
  ["Uganda Dates", "May 2 payment, Jun 2 renewal, EAT support tickets"],
] as const;

const testimonials = [
  {
    quote:
      "MediLink makes a demo feel like a real hospital system. The role portals show exactly how each team member works.",
    name: "Nakato Ssempijja",
    title: "Hospital operations lead",
  },
  {
    quote:
      "The patient records and pharmacy screens are clear enough for a buyer to understand the workflow in minutes.",
    name: "Dr. Sarah Namusoke",
    title: "General physician",
  },
  {
    quote:
      "We can show booking, billing, prescriptions, and inventory in one story instead of separate disconnected tools.",
    name: "Turyasingura Nankya",
    title: "Pharmacy manager",
  },
] as const;

const deployStack = [
  { label: "Frontend", value: "Vercel", icon: Cloud },
  { label: "Backend", value: "Railway or Render", icon: LayoutDashboard },
  { label: "Database", value: "Supabase", icon: Database },
] as const;

const workflow = [
  "Finish frontend UI",
  "Connect database",
  "Create login/auth",
  "Add sample hospital data",
  "Push to GitHub",
  "Deploy to Vercel",
] as const;

export function HomePageContent() {
  return (
    <>
      <section className="border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_42%,#f1fdf8_100%)]">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-5 pb-8 pt-8 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pt-10">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-bold text-emerald-700">
              <Sparkles className="size-4" aria-hidden="true" />
              Enterprise healthcare SaaS demo
            </div>
            <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-normal text-[#080833] sm:text-6xl lg:text-7xl">
              MediLink
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              A Uganda-ready multi-tenant clinic, hospital, pharmacy, and patient booking
              platform built to feel real from the first demo: role portals, UGX invoices,
              MTN and Airtel payments, prescriptions, and dashboards for every team.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#login-portals"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-violet-600 px-7 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                Open login portals
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-7 text-sm font-bold text-slate-900 shadow-sm shadow-slate-200 transition hover:border-violet-300 hover:bg-violet-50"
              >
                Login
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-bold text-[#080833]">{stat.value}</p>
                  <p className="mt-1 break-words text-xs font-bold uppercase tracking-normal text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid min-w-0 gap-4">
            <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-2xl shadow-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
                    Kampala Hospital
                  </p>
                  <p className="mt-1 text-sm font-bold text-[#080833]">
                    Super admin and hospital workspace
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  Live demo
                </span>
              </div>
              <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr]">
                <ProductPreview kind="dashboard" className="h-[248px] shadow-none" />
                <div className="grid gap-3">
                  <MiniMetric label="Patients today" value="38" icon={Users} />
                  <MiniMetric label="Invoices paid" value="UGX 185k" icon={WalletCards} />
                  <MiniMetric label="Stock alerts" value="4" icon={Pill} />
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <ProductPreview kind="calendar" compact className="h-[148px]" />
              <ProductPreview kind="patients" compact className="h-[148px]" />
              <ProductPreview kind="inventory" compact className="h-[148px]" />
            </div>
          </div>
        </div>
      </section>

      <SectionShell
        id="features"
        eyebrow="Features"
        title="Everything a serious MediLink demo needs"
        body="The public site now leads buyers from the landing page into the operational software: hospital management, clinical records, billing, pharmacy stock, and patient booking."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-md shadow-slate-100">
                <div className={`grid size-12 place-items-center rounded-lg ${feature.tone}`}>
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold tracking-normal text-[#080833]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{feature.body}</p>
              </article>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell
        id="screenshots"
        eyebrow="Screenshots"
        title="Role dashboards that look operational"
        body="Use these screens during the demo story to show that MediLink is more than a landing page."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {screenshots.map((screenshot) => (
            <article key={screenshot.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg shadow-slate-100">
              <ProductPreview kind={screenshot.kind} className="h-[210px] shadow-none" />
              <h3 className="mt-5 text-lg font-bold text-[#080833]">{screenshot.title}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{screenshot.body}</p>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="login-portals"
        eyebrow="Login Portals"
        title="Different dashboards for every role"
        body="Each portal opens the demo with the right tenant, role, and dashboard area so MediLink feels enterprise-level in a live walkthrough."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rolePortals.map((portal) => {
            const Icon = portal.icon;
            return (
              <article key={portal.role} className="rounded-lg border border-slate-200 bg-white p-5 shadow-md shadow-slate-100">
                <div className={`grid size-12 place-items-center rounded-lg ${portal.tone}`}>
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-[#080833]">{portal.role}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                    {portal.dashboard}
                  </span>
                </div>
                <p className="mt-2 min-h-[72px] text-sm font-medium leading-6 text-slate-600">
                  {portal.body}
                </p>
                <Link
                  href={portal.href}
                  className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-violet-500 bg-white px-5 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
                >
                  Open portal
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell
        id="demo-data"
        eyebrow="Best Demo Setup"
        title="Fake clinic data that makes the SaaS feel real"
        body="The default demo opens with recognizable hospital, doctor, patient, appointment, prescription, and invoice records."
      >
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-100">
          <div className="grid md:grid-cols-2 xl:grid-cols-3">
            {demoRecords.map(([label, value]) => (
              <div key={label} className="border-b border-slate-100 p-5 md:border-r xl:[&:nth-child(3n)]:border-r-0">
                <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
                <p className="mt-2 text-base font-bold text-[#080833]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell
        id="testimonials"
        eyebrow="Testimonials"
        title="Built to pass the buyer sniff test"
        body="A good SaaS demo should feel like the customer is already inside their future workflow."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.name} className="rounded-lg border border-slate-200 bg-white p-6 shadow-md shadow-slate-100">
              <blockquote className="text-base font-semibold leading-7 text-slate-800">
                {item.quote}
              </blockquote>
              <figcaption className="mt-5 border-t border-slate-100 pt-4">
                <p className="font-bold text-[#080833]">{item.name}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{item.title}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="deploy"
        eyebrow="Deploy MediLink"
        title="A clean path from demo to production"
        body="Keep the deployment story simple: Vercel for the frontend, Railway or Render for backend services, and Supabase for PostgreSQL, auth, storage, and realtime data."
      >
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-4">
            {deployStack.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid size-11 place-items-center rounded-lg bg-sky-100 text-sky-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-normal text-slate-500">{item.label}</p>
                    <p className="mt-1 text-lg font-bold text-[#080833]">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-100">
            <h3 className="text-lg font-bold text-[#080833]">Best workflow</h3>
            <ol className="mt-5 grid gap-3">
              {workflow.map((step, index) => (
                <li key={step} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SectionShell>

      <section id="contact" className="scroll-mt-24 border-t border-slate-200 bg-[#071133] text-white">
        <div className="mx-auto grid max-w-[1500px] gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-normal text-emerald-300">Contact</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">
              Ready to show MediLink like a real SaaS?
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              Use the demo flow for a guided walkthrough, or open a role portal directly
              when a buyer asks to see a specific staff experience.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2">
                <MessageCircle className="size-4 text-emerald-300" aria-hidden="true" />
                WhatsApp-ready reminders
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2">
                <Headphones className="size-4 text-emerald-300" aria-hidden="true" />
                Demo support workflow
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/demo-flow"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-7 text-sm font-bold text-[#071133] transition hover:bg-slate-100"
            >
              Launch demo flow
            </Link>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 px-7 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Create workspace
            </Link>
          </div>
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
    <section id={id} className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8">
        <div className="mb-6 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-normal text-violet-600">{eyebrow}</p>
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

function MiniMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
        <Icon className="size-4 text-violet-600" aria-hidden="true" />
      </div>
      <p className="mt-3 text-xl font-bold text-[#080833]">{value}</p>
      <div className="mt-3 h-2 rounded-full bg-white">
        <span className="block h-full w-2/3 rounded-full bg-emerald-500" />
      </div>
    </div>
  );
}
