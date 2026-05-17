import Link from "next/link";
import { ArrowRight, Building2, MapPin, Pill, Search, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import {
  getPublicTenantDirectory,
  publicTenantBookUrl,
  publicTenantPayUrl,
  publicTenantPharmacyUrl,
  publicTenantProfileUrl,
} from "@/lib/public-directory";
import { tenantBranding } from "@/lib/tenant-branding";
import type { TenantKind } from "@/lib/types";

export const metadata = {
  title: "Find Clinics & Pharmacies | MediLink",
  description: "Search MediLink clinics, hospitals, and pharmacies to book appointments, order medicines, or request payments.",
};

const kindLabels: Record<TenantKind | "all", string> = {
  all: "All",
  clinic: "Clinics",
  hospital: "Hospitals",
  pharmacy: "Pharmacies",
};

export default async function PublicDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim().toLowerCase();
  const selectedType = normalizeKind(params.type);
  const listings = await getPublicTenantDirectory();
  const filtered = listings.filter((listing) => {
    const matchesType = selectedType === "all" || listing.tenant.tenant_kind === selectedType;
    const searchable = [
      listing.tenant.name,
      listing.tenant.address,
      listing.tenant.region,
      listing.tenant.tenant_kind,
      ...listing.services,
    ]
      .join(" ")
      .toLowerCase();

    return matchesType && (!query || searchable.includes(query));
  });

  return (
    <main className="min-h-screen bg-slate-50 text-[#080833]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="MediLink home">
            <Logo />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-violet-500 bg-white px-5 text-sm font-bold text-violet-600 transition hover:bg-violet-50"
          >
            Staff log in
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1280px] px-5 py-10 sm:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-100">
          <Badge tone="blue">Patient and customer portal</Badge>
          <div className="mt-4 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-bold leading-tight tracking-normal sm:text-5xl">
                Find care, book visits, order medicine, and pay locally.
              </h1>
              <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600">
                Patients use this public side of MediLink while clinics, hospitals, and pharmacies manage requests inside their private dashboards.
              </p>
            </div>
            <form className="grid gap-3 rounded-lg bg-slate-50 p-4 md:grid-cols-[1fr_180px_auto]" action="/clinics">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 size-5 text-slate-400" />
                <input
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="Search Kampala, pharmacy, dental, lab..."
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </label>
              <select
                name="type"
                defaultValue={selectedType}
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              >
                {Object.entries(kindLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button className="inline-flex h-11 items-center justify-center rounded-lg bg-violet-600 px-5 text-sm font-bold text-white transition hover:bg-violet-700">
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {filtered.map((listing) => {
            const brand = tenantBranding(listing.tenant);
            const isPharmacy = listing.tenant.tenant_kind === "pharmacy";
            const Icon = isPharmacy ? Pill : listing.tenant.tenant_kind === "hospital" ? Building2 : Stethoscope;

            return (
              <article key={listing.tenant.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="grid size-12 shrink-0 place-items-center rounded-lg text-white" style={{ backgroundColor: brand.primaryColor }}>
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-950">{brand.name}</p>
                      <p className="mt-1 text-sm font-semibold capitalize text-slate-500">
                        {listing.tenant.tenant_kind}
                      </p>
                    </div>
                  </div>
                  <Badge tone={listing.tenant.status === "active" ? "green" : "blue"} className="capitalize">
                    {listing.tenant.status}
                  </Badge>
                </div>

                <p className="mt-4 flex items-start gap-2 text-sm font-medium leading-6 text-slate-600">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                  {brand.address}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(listing.services.length ? listing.services : ["Appointments", "Payments", "Customer requests"]).map((service) => (
                    <span key={service} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {service}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <Link href={publicTenantProfileUrl(listing.tenant)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 text-sm font-bold text-white transition hover:bg-violet-700">
                    Open page
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                  <Link href={isPharmacy ? publicTenantPharmacyUrl(listing.tenant) : publicTenantBookUrl(listing.tenant)} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-violet-300 hover:bg-violet-50">
                    {isPharmacy ? "Order medicine" : "Book appointment"}
                  </Link>
                  <Link href={publicTenantPayUrl(listing.tenant)} className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50 sm:col-span-2">
                    Pay or request payment
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {!filtered.length ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
            No matching businesses found yet. Try another search or clear filters.
          </div>
        ) : null}
      </section>
    </main>
  );
}

function normalizeKind(value: string | undefined): TenantKind | "all" {
  if (value === "clinic" || value === "hospital" || value === "pharmacy") return value;
  return "all";
}
