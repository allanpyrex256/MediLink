import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Cloud,
  FileText,
  HelpCircle,
  Headphones,
  LockKeyhole,
  MessageCircle,
  PlayCircle,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { ProductPreview } from "@/components/marketing/product-preview";
import { PublicHeader } from "@/components/marketing/public-header";
import { Reveal } from "@/components/marketing/reveal";

const categories = [
  ["Getting Started", "6", BookOpen, "text-violet-600"],
  ["Product Guides", "12", Settings, "text-violet-600"],
  ["Best Practices", "8", ShieldCheck, "text-emerald-600"],
  ["Video Tutorials", "15", PlayCircle, "text-blue-600"],
  ["Webinars", "7", CalendarDays, "text-orange-500"],
  ["System Updates", "9", Cloud, "text-emerald-600"],
  ["Templates & Tools", "5", FileText, "text-violet-600"],
  ["FAQs", "20", HelpCircle, "text-violet-600"],
] as const;

const featuredResources = [
  {
    tag: "Getting Started",
    title: "Getting Started with MediLink",
    body: "A step-by-step guide to help you set up your account and start managing your healthcare facility.",
    readTime: "5 min read",
    visual: "rocket",
  },
  {
    tag: "Guide",
    title: "Managing Appointments Like a Pro",
    body: "Learn how to schedule, manage, and optimize appointments to reduce no-shows and save time.",
    readTime: "7 min read",
    visual: "appointments",
  },
  {
    tag: "Guide",
    title: "How to Setup Mobile Money Payments",
    body: "Accept payments easily via MTN MoMo and Airtel Money.",
    readTime: "6 min read",
    visual: "payments",
  },
  {
    tag: "Best Practice",
    title: "Keeping Patient Data Secure",
    body: "Best practices for protecting patient data and staying compliant with regulations.",
    readTime: "4 min read",
    visual: "security",
  },
] as const;

const latestResources = [
  {
    title: "Understanding Reports & Analytics",
    body: "Use reports to track performance, monitor revenue, and make data-driven decisions.",
    tag: "Product Guide",
    date: "May 20, 2024",
    time: "8 min read",
    icon: FileText,
    tone: "violet",
  },
  {
    title: "MediLink: Pharmacy Inventory Management Explained",
    body: "Learn how to track stock, set alerts, and manage expiries efficiently.",
    tag: "Video Tutorial",
    date: "May 18, 2024",
    time: "12 min",
    icon: PlayCircle,
    tone: "green",
  },
  {
    title: "Webinar: Digital Transformation in Healthcare",
    body: "Watch our expert talk on how digital tools transform healthcare delivery in Uganda.",
    tag: "Webinar",
    date: "May 15, 2024",
    time: "45 min",
    icon: CalendarDays,
    tone: "amber",
  },
  {
    title: "What's New in MediLink - May 2024 Update",
    body: "See the latest features and improvements released this month.",
    tag: "System Update",
    date: "May 10, 2024",
    time: "6 min",
    icon: Cloud,
    tone: "blue",
  },
] as const;

const hubCards = [
  {
    title: "Video Library",
    body: "Step-by-step video tutorials to help you master MediLink.",
    action: "Watch Videos",
    href: "/resources#videos",
    icon: Video,
    tone: "violet",
  },
  {
    title: "Help Center",
    body: "Find answers to common questions and issues.",
    action: "Visit Help Center",
    href: "/resources#guides",
    icon: BookOpen,
    tone: "green",
  },
  {
    title: "Webinars",
    body: "Join live or on-demand sessions with our experts.",
    action: "View Webinars",
    href: "/resources#webinars",
    icon: CalendarDays,
    tone: "amber",
  },
  {
    title: "Community",
    body: "Connect with other healthcare professionals and share insights.",
    action: "Join Community",
    href: "/register",
    icon: Users,
    tone: "violet",
  },
] as const;

const toneStyles = {
  violet: "bg-violet-100 text-violet-600",
  green: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
} as const;

export const metadata = {
  title: "Resources | MediLink",
  description: "Guides, insights and support resources for MediLink healthcare providers.",
};

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white text-[#07082f]">
      <PublicHeader active="resources" />

      <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,#ede9fe_0,#ffffff_42%,#f8fbff_100%)]">
        <div className="mx-auto grid max-w-[1220px] gap-8 px-5 py-9 sm:px-8 lg:grid-cols-[440px_1fr] lg:items-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-normal text-violet-600">Resource Center</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-normal text-[#080833] sm:text-5xl">
              Guides, Insights & Support
              <span className="block">
                to Help You <span className="text-violet-600">Succeed</span>
              </span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Explore helpful guides, articles, videos, and tools to make the most of MediLink.
            </p>
            <label className="mt-6 flex h-12 max-w-[420px] items-center gap-4 rounded-lg border border-slate-200 bg-white px-5 shadow-sm">
              <Search className="size-5 text-slate-500" aria-hidden="true" />
              <span className="sr-only">Search resources</span>
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search for guides, articles, videos..."
              />
            </label>
          </Reveal>

          <Reveal delay={0.08}>
            <ResourceHeroGraphic />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1290px] gap-7 px-5 py-7 sm:px-8 lg:grid-cols-[260px_1fr]">
        <aside className="border-slate-200 lg:border-r lg:pr-6">
          <h2 id="getting-started" className="text-base font-bold tracking-normal text-[#080833]">Browse by Category</h2>
          <div className="mt-5 grid gap-2">
            {categories.map(([label, count, Icon, color]) => (
              <Link
                key={label}
                href="/resources#latest"
                className="flex h-10 items-center justify-between rounded-lg px-3 text-sm font-semibold text-slate-700 transition hover:bg-violet-50"
              >
                <span className="flex items-center gap-3">
                  <Icon className={`size-4 ${color}`} aria-hidden="true" />
                  {label}
                </span>
                <span className="grid h-6 min-w-7 place-items-center rounded-full border border-slate-200 px-2 text-xs text-slate-500">
                  {count}
                </span>
              </Link>
            ))}
          </div>

          <div id="support" className="mt-7 rounded-lg border border-violet-100 bg-violet-50/80 p-5">
            <h3 className="text-base font-bold text-[#080833]">Cannot find what you need?</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              Our support team is here to help
            </p>
            <Link
              href="/demo-flow"
              className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-violet-500 bg-white px-5 text-sm font-bold text-violet-600 transition hover:bg-violet-50"
            >
              <Headphones className="size-4" aria-hidden="true" />
              Contact Support
            </Link>
          </div>
        </aside>

        <div>
          <div id="guides" className="flex scroll-mt-24 items-center justify-between gap-4">
            <h2 className="text-base font-bold tracking-normal text-[#080833]">Featured Resources</h2>
            <Link href="/resources#latest" className="inline-flex items-center gap-2 text-sm font-bold text-violet-600">
              View all resources
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredResources.map((resource) => (
              <Reveal
                key={resource.title}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-100"
              >
                <ResourceVisual visual={resource.visual} />
                <div className="p-4">
                  <span className="rounded bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase text-violet-700">
                    {resource.tag}
                  </span>
                  <h3 className="mt-3 min-h-[48px] text-lg font-bold leading-6 tracking-normal text-[#080833]">
                    {resource.title}
                  </h3>
                  <p className="mt-2 min-h-[74px] text-sm font-medium leading-6 text-slate-600">
                    {resource.body}
                  </p>
                  <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {resource.readTime}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div id="latest" className="mt-7 flex scroll-mt-24 items-center justify-between gap-4">
            <h2 className="text-base font-bold tracking-normal text-[#080833]">Latest Resources</h2>
            <Link href="/resources#latest" className="inline-flex items-center gap-2 text-sm font-bold text-violet-600">
              View all articles
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {latestResources.map((resource) => {
              const Icon = resource.icon;
              return (
                <article
                  key={resource.title}
                  className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 md:grid-cols-[1fr_120px_120px] md:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className={`grid size-10 shrink-0 place-items-center rounded-lg ${toneStyles[resource.tone]}`}>
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#080833]">{resource.title}</h3>
                      <p className="mt-1 text-xs font-medium leading-5 text-slate-600">{resource.body}</p>
                    </div>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold ${toneStyles[resource.tone]}`}>
                    {resource.tag}
                  </span>
                  <div className="flex justify-between gap-4 text-xs font-semibold text-slate-500 md:block md:text-right">
                    <p>{resource.date}</p>
                    <p className="mt-0 md:mt-2">{resource.time}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1290px] px-5 pb-8 sm:px-8">
        <div className="grid gap-5 rounded-lg border border-violet-100 bg-violet-50/75 p-5 shadow-lg shadow-violet-100 md:grid-cols-2 xl:grid-cols-4">
          {hubCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                id={card.title === "Video Library" ? "videos" : card.title === "Webinars" ? "webinars" : undefined}
                key={card.title}
                className="flex scroll-mt-24 gap-4 border-slate-200 xl:border-r xl:pr-5 last:border-r-0"
              >
                <div className={`grid size-14 shrink-0 place-items-center rounded-full ${toneStyles[card.tone]}`}>
                  <Icon className="size-7" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#080833]">{card.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{card.body}</p>
                  <Link href={card.href} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-violet-600">
                    {card.action}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function ResourceHeroGraphic() {
  return (
    <div className="relative hidden min-h-[230px] lg:block">
      <div className="absolute inset-y-0 left-10 w-24 rounded-full bg-violet-100/70" />
      <div className="absolute right-0 top-2 size-20 rounded-full bg-violet-100/70" />
      <div className="absolute right-14 top-8 grid w-[510px] grid-cols-[68px_1fr] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-violet-100">
        <div className="bg-[#071133] p-3">
          <div className="grid size-8 place-items-center rounded-lg bg-violet-600 text-white">
            <BookOpen className="size-5" aria-hidden="true" />
          </div>
          <div className="mt-6 grid gap-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <span key={index} className="h-2 rounded-full bg-white/20" />
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-3">
            {["1,248", "32", "UGX 2,450,000", "7"].map((value, index) => (
              <div key={value} className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                <span className="block h-2 w-14 rounded-full bg-slate-100" />
                <strong className="mt-2 block text-xs text-[#080833]">{value}</strong>
                {index === 3 ? <span className="mt-1 block text-[10px] text-rose-500">View all</span> : null}
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-[1.2fr_0.8fr] gap-4">
            <ProductPreview kind="dashboard" compact className="h-[118px] shadow-none" />
            <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mx-auto size-16 rounded-full bg-[conic-gradient(#5b4bff_0deg_130deg,#38bdf8_130deg_230deg,#e2e8f0_230deg_360deg)]" />
              <div className="mt-4 grid gap-2">
                <span className="h-2 rounded-full bg-slate-100" />
                <span className="h-2 w-4/5 rounded-full bg-slate-100" />
                <span className="h-2 w-2/3 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceVisual({ visual }: { visual: (typeof featuredResources)[number]["visual"] }) {
  if (visual === "appointments") {
    return (
      <div className="bg-emerald-100 p-4">
        <ProductPreview kind="patients" compact className="h-[110px] shadow-none" />
      </div>
    );
  }

  const visualStyles = {
    rocket: {
      className: "bg-violet-200 text-violet-600",
      icon: ArrowRight,
    },
    payments: {
      className: "bg-amber-100 text-amber-600",
      icon: MessageCircle,
    },
    security: {
      className: "bg-violet-200 text-violet-600",
      icon: LockKeyhole,
    },
  } as const;
  const style = visualStyles[visual];
  const Icon = style.icon;

  return (
    <div className={`grid h-[120px] place-items-center ${style.className}`}>
      <div className="grid size-20 place-items-center rounded-full bg-white/45 shadow-xl shadow-white/40">
        <Icon className="size-10" aria-hidden="true" />
      </div>
    </div>
  );
}
