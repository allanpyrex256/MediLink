import Link from "next/link";
import {
  BarChart3,
  BriefcaseMedical,
  CheckCircle2,
  Cloud,
  Headphones,
  Home,
  Pill,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TestTube2,
} from "lucide-react";
import { ProductPreview } from "@/components/marketing/product-preview";
import { PublicHeader } from "@/components/marketing/public-header";
import { Reveal } from "@/components/marketing/reveal";

const solutionCards = [
  {
    title: "For Clinics",
    body: "Perfect for small and medium clinics looking to streamline daily operations and improve patient care.",
    icon: Home,
    preview: "patients",
    tone: "violet",
    anchor: "clinics",
    features: ["Patient management", "Appointments & reminders", "Billing & invoicing", "Medical records"],
    cta: "Explore Clinic Solution",
  },
  {
    title: "For Hospitals",
    body: "Powerful tools for multi-department hospitals to manage patients, staff, and resources efficiently.",
    icon: BriefcaseMedical,
    preview: "hospital",
    tone: "green",
    anchor: "hospitals",
    features: ["Multi-department management", "Inpatient & outpatient care", "Lab & radiology integration", "Advanced reporting"],
    cta: "Explore Hospital Solution",
  },
  {
    title: "For Pharmacies",
    body: "Manage inventory, track stock expiry, and handle sales with ease and accuracy.",
    icon: Pill,
    preview: "inventory",
    tone: "orange",
    anchor: "pharmacies",
    features: ["Inventory management", "Expiry & stock alerts", "Sales & purchase tracking", "Prescription management"],
    cta: "Explore Pharmacy Solution",
  },
  {
    title: "For Laboratories",
    body: "Digitize lab workflows from test requests to result delivery with complete accuracy.",
    icon: TestTube2,
    preview: "labs",
    tone: "blue",
    anchor: "laboratories",
    features: ["Test management", "Sample tracking", "Result management", "Report generation"],
    cta: "Explore Lab Solution",
  },
  {
    title: "For Dental Clinics",
    body: "Specialized tools for dental practices to manage appointments, treatments, and patient records.",
    icon: Stethoscope,
    preview: "calendar",
    tone: "rose",
    anchor: "dental-clinics",
    features: ["Dental charting", "Treatment plans", "Appointment scheduling", "Patient communication"],
    cta: "Explore Dental Solution",
  },
] as const;

const platformBenefits = [
  {
    title: "Secure & Compliant",
    body: "Your data is protected with enterprise-grade security and compliance.",
    icon: ShieldCheck,
  },
  {
    title: "Cloud Based",
    body: "Access your system anytime, anywhere, from any device.",
    icon: Cloud,
  },
  {
    title: "Always Up-to-date",
    body: "Automatic updates ensure you always have the latest features.",
    icon: RefreshCw,
  },
  {
    title: "Local Support",
    body: "Get fast help from our Uganda support team whenever you need it.",
    icon: Headphones,
  },
  {
    title: "Scalable",
    body: "Start small and grow bigger. MediLink grows with your business.",
    icon: BarChart3,
  },
] as const;

const toneStyles = {
  violet: {
    icon: "bg-violet-100 text-violet-600",
    check: "text-violet-600",
    button: "border-violet-500 text-violet-600 hover:bg-violet-50",
  },
  green: {
    icon: "bg-emerald-100 text-emerald-600",
    check: "text-emerald-600",
    button: "border-emerald-500 text-emerald-600 hover:bg-emerald-50",
  },
  orange: {
    icon: "bg-orange-100 text-orange-600",
    check: "text-orange-500",
    button: "border-orange-500 text-orange-600 hover:bg-orange-50",
  },
  blue: {
    icon: "bg-sky-100 text-sky-600",
    check: "text-sky-600",
    button: "border-sky-500 text-sky-600 hover:bg-sky-50",
  },
  rose: {
    icon: "bg-rose-100 text-rose-600",
    check: "text-rose-500",
    button: "border-rose-500 text-rose-600 hover:bg-rose-50",
  },
} as const;

export const metadata = {
  title: "Solutions | MediLink",
  description: "MediLink solutions for clinics, hospitals, pharmacies, laboratories and dental clinics.",
};

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f6f2ff_0,#ffffff_42%,#f7fbff_100%)] text-[#07082f]">
      <PublicHeader active="solutions" />

      <section className="mx-auto max-w-[1500px] px-5 pb-10 pt-7 sm:px-8 lg:pt-8">
        <Reveal className="mx-auto max-w-4xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5 text-sm font-bold text-violet-700">
            <Sparkles className="size-4" aria-hidden="true" />
            Tailored Solutions
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-normal text-[#080833] sm:text-5xl">
            Smart Solutions for Every
            <span className="block text-violet-600">Healthcare Provider</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Whether you run a small clinic, a large hospital, or a busy pharmacy,
            MediLink has a solution tailored to help you deliver better care and grow your business.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {solutionCards.map((solution) => {
            const Icon = solution.icon;
            const styles = toneStyles[solution.tone];
            return (
              <Reveal
                key={solution.title}
                id={solution.anchor}
                className="flex min-h-[500px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-100"
              >
                <div className={`grid size-14 place-items-center rounded-full ${styles.icon}`}>
                  <Icon className="size-7" aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-xl font-bold tracking-normal text-[#080833]">{solution.title}</h2>
                <p className="mt-2 min-h-[92px] text-sm font-medium leading-6 text-slate-600">{solution.body}</p>
                <ul className="mt-3 grid gap-2.5 text-sm font-semibold text-slate-950">
                  {solution.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5">
                      <CheckCircle2 className={`size-4 shrink-0 ${styles.check}`} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <ProductPreview
                  kind={solution.preview}
                  compact
                  className="mt-7 shadow-slate-100"
                />
                <Link
                  href="/register"
                  className={`mt-4 inline-flex h-11 items-center justify-center rounded-lg border bg-white px-4 text-sm font-bold transition ${styles.button}`}
                >
                  {solution.cta}
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-7 rounded-lg border border-violet-100 bg-violet-50/70 p-8 shadow-lg shadow-violet-100">
          <div className="grid gap-8 lg:grid-cols-[330px_1fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-normal text-[#080833]">
                One Platform.
                <span className="block text-violet-600">Unlimited Possibilities.</span>
              </h2>
              <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                All solutions are connected on one secure platform so you can focus on
                what matters most - your patients.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/demo-flow"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-violet-600 px-8 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
                >
                  Book a Demo
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-violet-600 transition hover:bg-white"
                >
                  <PlayCircle className="size-8" aria-hidden="true" />
                  Watch Video
                </Link>
              </div>
            </div>

            <div className="grid gap-6 border-slate-200 lg:grid-cols-5 lg:border-l lg:pl-10">
              {platformBenefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.title}>
                    <Icon className="size-9 text-violet-600" aria-hidden="true" />
                    <h3 className="mt-5 text-sm font-bold text-[#080833]">{benefit.title}</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{benefit.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
