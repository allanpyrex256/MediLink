import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  MapPin,
  MessageCircle,
  Pill,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import {
  type PublicTenantProfile,
  getPublicTenantProfile,
  publicTenantBookUrl,
  publicTenantPayUrl,
  publicTenantPharmacyUrl,
  publicTenantProfileUrl,
} from "@/lib/public-directory";
import { brandGradient, tenantBranding } from "@/lib/tenant-branding";
import { absoluteUrl } from "@/lib/utils";
import type { TenantKind } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const data = await getPublicTenantProfile(clinicSlug);
  if (!data) {
    return {
      title: "Clinic | MediLink",
      description: "MediLink public clinic profile.",
    };
  }

  const brand = tenantBranding(data.tenant);
  const kindLabel = publicKindLabel(data.tenant.tenant_kind);
  const profileUrl = absoluteUrl(publicTenantProfileUrl(data.tenant));
  const description = `${brand.name} is a ${kindLabel.toLowerCase()} in ${data.tenant.region}. Book appointments, send payment requests, or contact the business through MediLink.`;

  return {
    title: `${brand.name} - ${kindLabel} in ${data.tenant.region} | MediLink`,
    description,
    alternates: {
      canonical: profileUrl,
    },
    openGraph: {
      title: `${brand.name} | MediLink`,
      description,
      url: profileUrl,
      siteName: "MediLink",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PublicTenantProfilePage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const data = await getPublicTenantProfile(clinicSlug);

  if (!data) notFound();

  const brand = tenantBranding(data.tenant);
  const isPharmacy = data.tenant.tenant_kind === "pharmacy";
  const whatsapp = whatsappUrl(brand.phone, `Hello ${brand.name}, I found you on MediLink.`);
  const profileUrl = absoluteUrl(publicTenantProfileUrl(data.tenant));
  const structuredData = publicTenantJsonLd(data, profileUrl, whatsapp);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4f1ff_0,#ffffff_44%,#f6fbff_100%)] text-[#080833]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link href="/clinics" aria-label="MediLink directory">
            <Logo />
          </Link>
          <Link
            href="/clinics"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-violet-500 bg-white px-5 text-sm font-bold text-violet-600 transition hover:bg-violet-50"
          >
            Find care
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-100">
          <div className="min-h-[220px] p-6 text-white sm:p-8" style={{ background: brandGradient(brand) }}>
            <Badge tone="green" className="bg-white/20 text-white">
              {data.tenant.tenant_kind === "hospital" ? "Hospital" : data.tenant.tenant_kind === "pharmacy" ? "Pharmacy" : "Clinic"} profile
            </Badge>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="text-4xl font-bold leading-tight tracking-normal sm:text-5xl">
                  {brand.name}
                </h1>
                <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-white/85">
                  {brand.tagline}. Book appointments, request payments, and send medicine or prescription requests without entering a staff dashboard.
                </p>
              </div>
              <div className="rounded-lg bg-white/15 p-4 backdrop-blur">
                <p className="text-sm font-bold">Public customer page</p>
                <p className="mt-2 text-sm font-semibold text-white/80">Share this profile on WhatsApp, Facebook, posters, or QR codes.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr]">
            <aside className="grid gap-4">
              <InfoRow icon={MapPin} label="Address" value={brand.address} />
              <InfoRow icon={MessageCircle} label="Contact" value={`${brand.phone} / ${brand.email}`} />
              <InfoRow icon={ShieldCheck} label="MediLink access" value="Appointments, payments, pharmacy requests, and updates" />
            </aside>

            <div>
              <div className="grid gap-4 md:grid-cols-3">
                {!isPharmacy ? (
                  <ActionCard
                    href={publicTenantBookUrl(data.tenant)}
                    icon={CalendarDays}
                    title="Book Appointment"
                    body="Choose service, doctor, date, and time."
                    primary
                  />
                ) : null}
                <ActionCard
                  href={publicTenantPayUrl(data.tenant)}
                  icon={Banknote}
                  title="Pay or Request Payment"
                  body="Send MoMo or Airtel payment request details."
                  primary={isPharmacy}
                />
                <ActionCard
                  href={publicTenantPharmacyUrl(data.tenant)}
                  icon={Pill}
                  title={isPharmacy ? "Order Medicine" : "Pharmacy Request"}
                  body="Request medicines, refills, or prescription dispensing."
                />
                <ActionCard
                  href={whatsapp}
                  icon={MessageCircle}
                  title="WhatsApp"
                  body="Contact the business directly."
                  external
                />
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <h2 className="text-lg font-bold text-slate-950">
                    {isPharmacy ? "Available medicines" : "Services and doctors"}
                  </h2>
                  <div className="mt-4 grid gap-3">
                    {isPharmacy
                      ? data.inventory.slice(0, 6).map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-lg bg-white p-3">
                            <div>
                              <p className="text-sm font-bold text-slate-950">{item.name}</p>
                              <p className="text-xs font-semibold text-slate-500">{item.category}</p>
                            </div>
                            <p className="text-sm font-bold text-emerald-700">{item.stock_on_hand} left</p>
                          </div>
                        ))
                      : data.doctors.slice(0, 6).map((doctor) => (
                          <div key={doctor.id} className="flex items-center justify-between gap-3 rounded-lg bg-white p-3">
                            <div>
                              <p className="text-sm font-bold text-slate-950">{doctor.full_name}</p>
                              <p className="text-xs font-semibold text-slate-500">{doctor.specialization}</p>
                            </div>
                            <p className="text-xs font-bold capitalize text-emerald-700">{doctor.status}</p>
                          </div>
                        ))}
                    {isPharmacy && !data.inventory.length ? <EmptyState text="No public medicine list yet. Send a medicine request instead." /> : null}
                    {!isPharmacy && !data.doctors.length ? <EmptyState text="Online booking is not ready yet. Use WhatsApp or payment requests for now." /> : null}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <h2 className="text-lg font-bold text-slate-950">How customers use this page</h2>
                  <div className="mt-4 grid gap-3">
                    {[
                      ["Find business", "Search MediLink or open the shared QR/link."],
                      ["Choose action", "Book, order, pay, or contact the business."],
                      ["Business responds", "Staff sees the request inside their MediLink dashboard."],
                    ].map(([title, body], index) => (
                      <div key={title} className="flex gap-3 rounded-lg bg-white p-3">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: brand.primaryColor }}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-950">{title}</p>
                          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ActionCard({
  href,
  icon: Icon,
  title,
  body,
  primary = false,
  external = false,
}: {
  href: string;
  icon: typeof CalendarDays;
  title: string;
  body: string;
  primary?: boolean;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className={`rounded-lg border p-4 transition hover:-translate-y-1 hover:shadow-lg ${
        primary
          ? "border-violet-300 bg-violet-600 text-white shadow-violet-100"
          : "border-slate-200 bg-white text-slate-950"
      }`}
    >
      <Icon className={`size-6 ${primary ? "text-white" : "text-violet-600"}`} aria-hidden="true" />
      <p className="mt-4 text-sm font-bold">{title}</p>
      <p className={`mt-2 text-xs font-semibold leading-5 ${primary ? "text-violet-50" : "text-slate-500"}`}>
        {body}
      </p>
      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold">
        Open
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </span>
    </Link>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Stethoscope;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <Icon className="size-5 text-violet-600" aria-hidden="true" />
      <p className="mt-3 text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
      {text}
    </div>
  );
}

function publicKindLabel(kind: TenantKind) {
  if (kind === "hospital") return "Hospital";
  if (kind === "pharmacy") return "Pharmacy";
  return "Clinic";
}

function schemaType(kind: TenantKind) {
  if (kind === "hospital") return "Hospital";
  if (kind === "pharmacy") return "Pharmacy";
  return "MedicalClinic";
}

function publicTenantJsonLd(
  data: PublicTenantProfile,
  profileUrl: string,
  whatsapp: string,
) {
  const brand = tenantBranding(data.tenant);
  const actionTargets = [
    data.tenant.tenant_kind === "pharmacy"
      ? {
          "@type": "OrderAction",
          name: "Order medicine",
          target: absoluteUrl(publicTenantPharmacyUrl(data.tenant)),
        }
      : {
          "@type": "ReserveAction",
          name: "Book appointment",
          target: absoluteUrl(publicTenantBookUrl(data.tenant)),
        },
    {
      "@type": "PayAction",
      name: "Pay or request payment",
      target: absoluteUrl(publicTenantPayUrl(data.tenant)),
    },
    {
      "@type": "CommunicateAction",
      name: "Contact on WhatsApp",
      target: whatsapp,
    },
  ];

  return {
    "@context": "https://schema.org",
    "@type": schemaType(data.tenant.tenant_kind),
    name: brand.name,
    legalName: brand.legalName,
    description: `${brand.name} is listed on MediLink for appointments, payments, pharmacy requests, and customer communication.`,
    url: profileUrl,
    telephone: brand.phone,
    email: brand.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: brand.address,
      addressLocality: data.tenant.region,
      addressCountry: "UG",
    },
    areaServed: {
      "@type": "Country",
      name: "Uganda",
    },
    potentialAction: actionTargets,
  };
}

function whatsappUrl(phone: string, text: string) {
  const normalized = phone.replace(/\D/g, "").replace(/^0/, "256");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}
