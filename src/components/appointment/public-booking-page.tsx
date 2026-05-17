import Link from "next/link";
import { CalendarDays, ClipboardCheck, MessageCircle, Smartphone } from "lucide-react";
import {
  PublicAppointmentBooking,
  PublicBookingSummary,
} from "@/components/appointment/public-appointment-booking";
import { ProductPreview } from "@/components/marketing/product-preview";
import { Logo } from "@/components/ui/logo";
import { brandGradient, tenantBranding } from "@/lib/tenant-branding";
import { tenantBookingUrl } from "@/lib/tenant-host";
import type { PublicBookingData } from "@/lib/public-booking";

export function PublicBookingPage({ data }: { data: PublicBookingData }) {
  const bookingUrl = tenantBookingUrl(data.tenant);
  const brand = tenantBranding(data.tenant);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f4f1ff_0,#ffffff_44%,#f6fbff_100%)] text-[#07082f]">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label={`${brand.name} home`}>
            <Logo
              label={brand.name}
              tagline={brand.tagline}
              imageUrl={brand.logoUrl}
              initials={brand.initials}
              color={brand.primaryColor}
            />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-violet-500 bg-white px-5 text-sm font-bold text-violet-600 transition hover:bg-violet-50 sm:px-8"
          >
            Staff log in
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1240px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold text-white"
            style={{ background: brandGradient(brand) }}
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            {brand.name} booking
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-normal text-[#080833] sm:text-5xl">
            Book with
            <span className="block" style={{ color: brand.primaryColor }}>{brand.name}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            No clinic website needed. Choose a service, pick a time, and send your
            appointment request straight to {brand.name}.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Choose time", CalendarDays],
              ["Send request", Smartphone],
              ["Get confirmed", MessageCircle],
            ].map(([label, Icon]) => (
              <div key={label as string} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <Icon className="size-6" style={{ color: brand.primaryColor }} aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-[#080833]">{label as string}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-lg shadow-slate-100">
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-600">
                <ClipboardCheck className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#080833]">Share this booking link</p>
                <p className="mt-1 break-all text-sm font-semibold" style={{ color: brand.primaryColor }}>
                  {bookingUrl}
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Add this link to WhatsApp, Facebook, posters, SMS messages, or a QR code.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <ProductPreview kind="calendar" className="h-[190px]" />
          </div>

          <div className="mt-6">
            <PublicBookingSummary tenant={data.tenant} doctors={data.doctors} />
          </div>
        </div>

        <PublicAppointmentBooking
          tenant={data.tenant}
          doctors={data.doctors}
          bookedAppointments={data.bookedAppointments}
        />
      </section>
    </main>
  );
}
