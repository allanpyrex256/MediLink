import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function AuthShell({
  brandColor = "#0284c7",
  brandInitials = "ML",
  brandLabel = "MediLink",
  brandTagline = "Healthcare and pharmacy SaaS",
  children,
  description,
  title,
}: {
  brandColor?: string;
  brandInitials?: string;
  brandLabel?: string;
  brandTagline?: string;
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-[#080833] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-[#07122f] p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <Logo label={brandLabel} tagline={brandTagline} initials={brandInitials} color={brandColor} />
          <div>
            <div className="grid size-12 place-items-center rounded-lg bg-sky-400/15 text-sky-200">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </div>
            <h1 className="mt-6 max-w-sm text-3xl font-bold leading-tight tracking-normal">
              Secure access for every MediLink workspace.
            </h1>
            <p className="mt-4 max-w-md text-sm font-medium leading-6 text-slate-300">
              Owners, admins, sellers, and pharmacy teams get isolated sessions with account controls that stay tied to each workspace.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs font-semibold text-slate-300">
            <span className="rounded-lg border border-white/10 bg-white/5 p-3">OTP reset</span>
            <span className="rounded-lg border border-white/10 bg-white/5 p-3">Tenant access</span>
            <span className="rounded-lg border border-white/10 bg-white/5 p-3">Role based</span>
          </div>
        </section>
        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-7 lg:hidden">
              <Logo label={brandLabel} tagline={brandTagline} initials={brandInitials} color={brandColor} />
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">{title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{description}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
