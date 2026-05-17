import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  LayoutDashboard,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { ProductPreview } from "@/components/marketing/product-preview";
import { PublicHeader } from "@/components/marketing/public-header";

const flowCards = [
  {
    title: "MediLink SaaS website",
    description: "What hospital buyers see first: hero, features, screenshots, portals, and contact.",
    href: "/",
    action: "View website",
    icon: Sparkles,
    tone: "violet",
  },
  {
    title: "Hospital admin login",
    description: "Manual login screen where a hospital team chooses its demo portal.",
    href: "/login",
    action: "Open login",
    icon: Users,
    tone: "blue",
  },
  {
    title: "Hospital admin dashboard",
    description: "Jump straight into Kampala Hospital as the hospital administrator.",
    href: "/demo/kampala-hospital?account=admin%40kampalahospital.ug&next=/dashboard",
    action: "Open hospital portal",
    icon: LayoutDashboard,
    tone: "green",
  },
  {
    title: "Reception appointment board",
    description: "See Mengo Clinic bookings from reception and from the public patient link.",
    href: "/demo/mengo-clinic?account=reception%40mengoclinic.ug&next=/dashboard/appointments",
    action: "View appointments",
    icon: CalendarDays,
    tone: "amber",
  },
  {
    title: "Patient booking page",
    description: "What a clinic customer opens from WhatsApp, Facebook, SMS, or QR code.",
    href: "/kampala-hospital/book",
    action: "Book clinic visit",
    icon: Stethoscope,
    tone: "violet",
  },
  {
    title: "Clinic patient booking",
    description: "A second tenant booking page for the Mengo Clinic demo.",
    href: "/mengo-clinic/book",
    action: "Book clinic visit",
    icon: Building2,
    tone: "blue",
  },
  {
    title: "Pharmacy portal",
    description: "Open a pharmacy tenant to show inventory, expiry alerts, and prescriptions.",
    href: "/demo/vine-pharmacy?account=pharmacy%40vinepharmacy.ug&next=/dashboard/pharmacy",
    action: "Open pharmacy",
    icon: Pill,
    tone: "orange",
  },
  {
    title: "Platform super admin",
    description: "Your view as MediLink owner: tenants, subscriptions, status, and platform controls.",
    href: "/demo/kampala-hospital?account=owner%40medilink.africa&next=/super-admin",
    action: "Open super admin",
    icon: ShieldCheck,
    tone: "green",
  },
] as const;

const toneStyles = {
  violet: "bg-violet-100 text-violet-600",
  blue: "bg-sky-100 text-sky-600",
  green: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  orange: "bg-orange-100 text-orange-600",
} as const;

export const metadata = {
  title: "Demo Flow | MediLink",
  description: "Launch every MediLink SaaS demo role from one place.",
};

export default function DemoFlowPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f6f2ff_0,#ffffff_42%,#f7fbff_100%)] text-[#07082f]">
      <PublicHeader active="portals" />

      <section className="mx-auto grid max-w-[1320px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-bold text-violet-700">
            <Sparkles className="size-4" aria-hidden="true" />
            Local SaaS Demo Flow
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-normal text-[#080833] sm:text-5xl">
            See how every MediLink user works together.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Use these links to demo your SaaS before real hosting: your public site,
            tenant portals, patient booking pages, and platform owner dashboard.
          </p>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-violet-100">
            <h2 className="text-lg font-bold tracking-normal text-[#080833]">Recommended demo story</h2>
            <ol className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-slate-700">
              <li>1. Open the SaaS website.</li>
              <li>2. Open the clinic dashboard.</li>
              <li>3. Open the patient booking page in another tab.</li>
              <li>4. Book a patient visit.</li>
              <li>5. Return to the clinic appointment board and see the pending request.</li>
              <li>6. Open super admin to show your platform owner view.</li>
            </ol>
          </div>

          <div className="mt-6">
            <ProductPreview kind="dashboard" className="h-[210px]" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {flowCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-100 transition hover:-translate-y-0.5 hover:shadow-xl">
                <div className={`grid size-12 place-items-center rounded-lg ${toneStyles[card.tone]}`}>
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-lg font-bold tracking-normal text-[#080833]">{card.title}</h2>
                <p className="mt-2 min-h-[72px] text-sm font-medium leading-6 text-slate-600">
                  {card.description}
                </p>
                <Link
                  href={card.href}
                  className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-100 transition hover:bg-violet-700"
                >
                  {card.action}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <p className="mt-3 break-all text-xs font-semibold text-slate-400">
                  http://localhost:3001{card.href}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
