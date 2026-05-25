import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { PublicPaymentRequest } from "@/components/public/public-payment-request";
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
    title: data ? `Pay ${data.tenant.name} | MediLink` : "Pay Business | MediLink",
    description: data
      ? `Send a payment request to ${data.tenant.name}.`
      : "Send a MediLink payment request.",
  };
}

export default async function PublicPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ clinicSlug: string }>;
  searchParams: Promise<{ amount?: string; plan?: string; purpose?: string }>;
}) {
  const { clinicSlug } = await params;
  const query = await searchParams;
  const isSubscriptionPayment = query.purpose === "subscription";
  const data = await getPublicTenantProfile(clinicSlug, {
    includeDisabled: isSubscriptionPayment,
  });

  if (!data) notFound();

  const brand = tenantBranding(data.tenant);
  const plan = query.plan?.trim() || "Starter";
  const amount = Number(query.amount ?? 0);

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
            <MessageCircle className="size-7" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-slate-950">
            {isSubscriptionPayment ? "Subscription payment" : "Public payment link"}
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
            {isSubscriptionPayment
              ? `Pay the MediLink ${plan} plan for ${brand.name} to continue using the dashboard.`
              : `Patients can pay consultation fees, invoices, medicine orders, or lab requests. The request appears in ${brand.name}'s payment activity for follow-up.`}
          </p>
          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
            {isSubscriptionPayment
              ? "Choose MTN MoMo or Airtel Money, then send the payment request so MediLink can confirm the subscription."
              : "For production payments, connect MTN MoMo or Airtel Money provider credentials. This page already captures the customer request safely."}
          </div>
        </aside>

        <PublicPaymentRequest
          tenant={data.tenant}
          mode={isSubscriptionPayment ? "subscription" : "public"}
          initialAmount={Number.isFinite(amount) && amount > 0 ? amount : undefined}
          plan={plan}
        />
      </section>
    </main>
  );
}
