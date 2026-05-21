import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pill } from "lucide-react";
import { PublicPharmacyOrder } from "@/components/public/public-pharmacy-order";
import { Logo } from "@/components/ui/logo";
import {
  getPublicTenantProfile,
  publicTenantProfileUrl,
} from "@/lib/public-directory";
import { tenantBranding } from "@/lib/tenant-branding";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const data = await getPublicTenantProfile(clinicSlug);

  return {
    title: data ? `Pharmacy Orders | ${data.tenant.name}` : "Pharmacy Orders | MediLink",
    description: data
      ? `Request medicine or refills from ${data.tenant.name}.`
      : "Request medicine through MediLink.",
  };
}

export default async function PublicPharmacyPage({
  params,
}: {
  params: Promise<{ clinicSlug: string }>;
}) {
  const { clinicSlug } = await params;
  const data = await getPublicTenantProfile(clinicSlug);

  if (!data) notFound();

  const brand = tenantBranding(data.tenant);

  return (
    <main className="min-h-screen bg-slate-50 text-[#080833]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Link href={publicTenantProfileUrl(data.tenant)} aria-label={`${brand.name} profile`}>
            <Logo
              label={brand.name}
              tagline={brand.tagline}
              imageUrl={brand.logoUrl}
              initials={brand.initials}
              color={brand.primaryColor}
            />
          </Link>
          <Link
            href={publicTenantProfileUrl(data.tenant)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Profile
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1180px] gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="grid size-14 place-items-center rounded-lg text-white" style={{ backgroundColor: brand.primaryColor }}>
            <Pill className="size-7" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-slate-950">Medicine request link</h2>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
            Customers can request medicines, refills, pickup, or delivery. Delivery requests include the address and enter {brand.name}&apos;s medicine order queue.
          </p>
          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-950">Public stock preview</p>
            <div className="mt-3 grid gap-2">
              {data.inventory.slice(0, 5).map((item) => (
                <div key={item.id} className="flex justify-between rounded-lg bg-white p-3 text-sm">
                  <span className="font-semibold text-slate-700">{item.name}</span>
                  <span className="font-bold text-emerald-700">{item.stock_on_hand}</span>
                </div>
              ))}
              {!data.inventory.length ? (
                <p className="text-sm font-semibold leading-6 text-slate-600">
                  No public stock list yet. Customers can still send a request for staff to confirm.
                </p>
              ) : null}
            </div>
          </div>
        </aside>

        <PublicPharmacyOrder tenant={data.tenant} />
      </section>
    </main>
  );
}
