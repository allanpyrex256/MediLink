import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Cloud,
  FileText,
  MessageCircle,
  Pill,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Star,
  TestTube2,
  Users,
} from "lucide-react";
import { PublicHeader } from "@/components/marketing/public-header";
import { Reveal } from "@/components/marketing/reveal";

const featureCards = [
  {
    title: "Patient Management",
    body: "Store patient records securely, track history, visits, and manage all patient information in one place.",
    icon: Users,
    tone: "violet",
  },
  {
    title: "Appointment Scheduling",
    body: "Easy booking, rescheduling, and reminders via SMS and WhatsApp to reduce no-shows.",
    icon: CalendarDays,
    tone: "blue",
  },
  {
    title: "Electronic Medical Records",
    body: "Digital patient files, prescriptions, diagnoses, and visit history always at your fingertips.",
    icon: ClipboardList,
    tone: "green",
  },
  {
    title: "Prescription Management",
    body: "Create, manage and track prescriptions with drug interaction alerts.",
    icon: FileText,
    tone: "rose",
  },
  {
    title: "Pharmacy Management",
    body: "Manage inventory, track stock levels, set expiry alerts and generate sales reports.",
    icon: Pill,
    tone: "orange",
  },
  {
    title: "Laboratory Management",
    body: "Request tests, manage results, print reports and share with doctors instantly.",
    icon: TestTube2,
    tone: "teal",
  },
  {
    title: "Billing & Invoicing",
    body: "Generate invoices, receipts, manage payments and track outstanding balances.",
    icon: ReceiptText,
    tone: "amber",
  },
  {
    title: "Mobile Money Payments",
    body: "Accept payments via MTN MoMo and Airtel Money directly in the system.",
    icon: Smartphone,
    tone: "purple",
  },
  {
    title: "Reports & Analytics",
    body: "Get real-time insights on revenue, patients, appointments, stock and more.",
    icon: BarChart3,
    tone: "sky",
  },
  {
    title: "WhatsApp Integration",
    body: "Send appointment reminders, lab results and notifications automatically.",
    icon: MessageCircle,
    tone: "emerald",
  },
  {
    title: "Role-Based Access",
    body: "Control user access and permissions for doctors, staff, pharmacists and admins.",
    icon: ShieldCheck,
    tone: "violet",
  },
  {
    title: "Cloud Backup & Security",
    body: "Your data is securely backed up in the cloud and accessible anytime, anywhere.",
    icon: Cloud,
    tone: "blue",
  },
] as const;

const toneStyles = {
  violet: "bg-violet-100 text-violet-600",
  blue: "bg-sky-100 text-sky-600",
  green: "bg-emerald-100 text-emerald-600",
  rose: "bg-rose-100 text-rose-600",
  orange: "bg-orange-100 text-orange-600",
  teal: "bg-teal-100 text-teal-600",
  amber: "bg-amber-100 text-amber-600",
  purple: "bg-purple-100 text-purple-600",
  sky: "bg-sky-100 text-sky-600",
  emerald: "bg-emerald-100 text-emerald-600",
} as const;

export const metadata = {
  title: "Features | MediLink",
  description: "Powerful healthcare management features for clinics, hospitals and pharmacies.",
};

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f6f2ff_0,#ffffff_42%,#f7fbff_100%)] text-[#07082f]">
      <PublicHeader active="features" />

      <section className="mx-auto max-w-[1210px] px-5 pb-10 pt-8 sm:px-8 lg:pt-10">
        <Reveal className="mx-auto max-w-4xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-bold text-violet-700">
            <Star className="size-4 fill-rose-400 text-rose-400" aria-hidden="true" />
            Powerful Features
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-normal text-[#080833] sm:text-5xl">
            Everything You Need to Run
            <span className="block">
              Your <span className="text-violet-600">Healthcare Business</span>
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            MediLink brings all the tools you need into one simple, easy-to-use platform
            so you can focus on what matters most - your patients.
          </p>
        </Reveal>

        <div className="mx-auto mt-8 grid max-w-[1120px] gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <Reveal
                key={feature.title}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className={`grid size-12 place-items-center rounded-lg ${toneStyles[feature.tone]}`}>
                  <Icon className="size-7" aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-lg font-bold tracking-normal text-[#080833]">{feature.title}</h2>
                <p className="mt-2 min-h-[72px] text-sm font-medium leading-6 text-slate-600">{feature.body}</p>
                <Link
                  href="/solutions"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-600"
                >
                  Learn more
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mx-auto mt-5 flex max-w-[1140px] flex-col gap-6 rounded-lg border border-violet-100 bg-violet-50/75 px-8 py-5 shadow-lg shadow-violet-100 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="grid size-16 place-items-center rounded-full bg-violet-100 text-violet-600 ring-8 ring-violet-100/55">
              <CheckCircle2 className="size-9 fill-violet-600/10" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-normal text-[#080833]">
                All the tools you need. One simple system.
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Join hundreds of healthcare providers in Uganda who trust MediLink.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-violet-500 bg-white px-10 text-sm font-bold text-violet-600 transition hover:bg-violet-50"
            >
              Explore Pricing
            </Link>
            <Link
              href="/demo-flow"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-violet-600 px-10 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
            >
              Book a Demo
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
