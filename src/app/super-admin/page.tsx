import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Building2,
  Clock,
  CreditCard,
  LineChart,
  Pill,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  PlatformRevenueChart,
  SubscriptionStatusChart,
  TenantGrowthChart,
} from "@/components/super-admin/platform-charts";
import { DeleteTenantAccountButton } from "@/components/super-admin/delete-tenant-account-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supportTickets } from "@/lib/platform-demo";
import type { PlatformTenant } from "@/lib/platform-demo";
import { getPlatformOverview } from "@/lib/platform-live";
import { formatUgx } from "@/lib/utils";

const statusTone = {
  active: "green",
  trialing: "blue",
  past_due: "amber",
  disabled: "rose",
} as const;

const priorityTone = {
  low: "slate",
  medium: "amber",
  high: "rose",
} as const;

const activityTone = {
  active: "green",
  quiet: "amber",
  inactive: "rose",
} as const;

export const metadata = {
  title: "SaaS Owner Dashboard | MediLink",
};

export default async function SuperAdminPage() {
  const {
    metrics,
    tenants: platformTenants,
    revenueGrowth,
    subscriptionStatus,
    tenantGrowth,
    usingLiveData,
  } = await getPlatformOverview();
  const activeBusinesses = metrics.activeTenants + metrics.trialAccounts;

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone="blue">Platform owner</Badge>
          <h1 className="mt-4 text-2xl font-bold tracking-normal text-[#080833] sm:text-3xl">
            MediLink SaaS business dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-slate-600">
            Track hospitals, dental practices, pharmacies, paying tenants, subscriptions, monthly revenue,
            unpaid invoices, trial accounts, and growth analytics.
          </p>
        </div>
        <Link
          href="/super-admin/revenue"
          className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
        >
          Review revenue
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          label="Active Businesses"
          value={String(activeBusinesses)}
          detail="Paying and trial tenants"
          icon={ShieldCheck}
          tone="bg-sky-100 text-sky-700"
          href="/super-admin/subscriptions"
        />
        <MetricCard
          label="Monthly SaaS Revenue"
          value={formatUgx(metrics.monthlyRevenue)}
          detail="Your platform income"
          icon={Banknote}
          tone="bg-emerald-100 text-emerald-700"
          href="/super-admin/revenue"
        />
        <MetricCard
          label="Expired Accounts"
          value={String(metrics.expiredAccounts)}
          detail="Clients who have not paid"
          icon={AlertTriangle}
          tone="bg-rose-100 text-rose-700"
          href="/super-admin/payments"
        />
        <MetricCard
          label="Trial Users"
          value={String(metrics.trialAccounts)}
          detail="Free users to convert"
          icon={Users}
          tone="bg-violet-100 text-violet-700"
          href="/super-admin/subscriptions"
        />
        <MetricCard
          label="New Signups"
          value={String(metrics.newSignups)}
          detail="Growth this month"
          icon={Sparkles}
          tone="bg-amber-100 text-amber-700"
          href="/super-admin/analytics"
        />
        <MetricCard
          label="Active Subscriptions"
          value={String(metrics.activeTenants)}
          detail="Businesses paying now"
          icon={ReceiptText}
          tone="bg-orange-100 text-orange-700"
          href="/super-admin/subscriptions"
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <MiniMetric
          label="Hospitals"
          value={metrics.totalHospitals}
          body="Large institutions using MediLink"
          href="/super-admin/hospitals"
        />
        <MiniMetric
          label="Clinics"
          value={metrics.activeClinics}
          body="Smaller outpatient businesses"
          href="/super-admin/clinics"
        />
        <MiniMetric
          label="Dentistry"
          value={metrics.dentistry}
          body="Dental practices using MediLink"
          href="/super-admin/dentistry"
        />
        <MiniMetric
          label="Pharmacies"
          value={metrics.pharmacies}
          body="Pharmacy and POS tenants"
          href="/super-admin/pharmacies"
        />
      </div>

      <OwnerQuickActions />

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Revenue growth</CardTitle>
            <CardDescription>Monthly income graph for MediLink subscriptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlatformRevenueChart data={revenueGrowth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription status</CardTitle>
            <CardDescription>Active, trial, and expired tenant accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionStatusChart data={subscriptionStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Tenant growth</CardTitle>
            <CardDescription>Hospitals, clinics, dental practices, and pharmacies joining MediLink.</CardDescription>
          </CardHeader>
          <CardContent>
            <TenantGrowthChart data={tenantGrowth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Platform worklist</CardTitle>
            <CardDescription>Owner pages for managing MediLink as a SaaS business.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              ["Hospitals", "Manage all hospitals", "/super-admin/hospitals", Building2],
              ["Clinics", "Manage smaller clinics", "/super-admin/clinics", Users],
              ["Dentistry", "Manage dental practices", "/super-admin/dentistry", Stethoscope],
              ["Pharmacies", "Manage all pharmacies", "/super-admin/pharmacies", Pill],
              ["Subscriptions", "Active, trial, and expired tenants", "/super-admin/subscriptions", ReceiptText],
              ["Revenue", "Monthly SaaS income graph", "/super-admin/revenue", Banknote],
              ["Payments", "Track unpaid invoices", "/super-admin/payments", CreditCard],
              ["Support Tickets", "Client issues and renewals", "/super-admin/support", Users],
              ["Plans", "Starter, Pro, Enterprise", "/super-admin/plans", ReceiptText],
              ["Analytics", "Growth and activity trends", "/super-admin/analytics", LineChart],
            ].map(([title, body, href, Icon]) => (
              <Link
                key={String(title)}
                href={String(href)}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-violet-200 hover:bg-violet-50"
              >
                <Icon className="size-5 text-violet-600" aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-slate-950">{String(title)}</p>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-600">{String(body)}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Business subscriptions</CardTitle>
          <CardDescription>
            The table that matters for you: plan, status, payment dates, and subscription amount.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <BusinessTable tenants={platformTenants} allowDelete={usingLiveData} />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <OwnerQueue
          title="Expired subscriptions"
          description="Clients who need renewal follow-up."
          items={platformTenants.filter((tenant) => tenant.status === "past_due")}
        />
        <OwnerQueue
          title="Pending payments"
          description="Invoices not fully collected yet."
          items={platformTenants.filter((tenant) => tenant.status !== "active")}
        />
        <Card>
          <CardHeader>
            <CardTitle>Support tickets</CardTitle>
            <CardDescription>Client issues that affect retention.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-950">{ticket.title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {ticket.business} - {ticket.updatedAt}
                    </p>
                  </div>
                  <Badge tone={priorityTone[ticket.priority]} className="capitalize">
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
            ))}
            <Link href="/super-admin/support" className="text-sm font-bold text-violet-600">
              Open support tickets
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: string;
  href?: string;
}) {
  const content = (
    <Card className={`min-h-[160px] transition ${href ? "hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md hover:shadow-slate-200" : ""}`}>
      <CardContent>
        <div className={`grid size-11 place-items-center rounded-lg ${tone}`}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
        <p className="mt-2 text-[1.35rem] font-bold leading-7 tracking-normal text-slate-950">
          {value}
        </p>
        <p className="mt-2 text-sm font-medium leading-5 text-slate-600">{detail}</p>
        {href ? (
          <p className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-violet-600">
            Open details
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </p>
        ) : null}
      </CardContent>
    </Card>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="block h-full rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
    >
      {content}
    </Link>
  );
}

function MiniMetric({
  label,
  value,
  body,
  href,
}: {
  label: string;
  value: number;
  body: string;
  href: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-lg border border-slate-300 bg-white p-4 shadow-sm shadow-slate-200/70">
      <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700">
        <Clock className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-950">{value}</p>
        <p className="text-sm font-bold text-slate-700">{label}</p>
        <p className="mt-1 text-xs font-medium text-slate-500">{body}</p>
      </div>
    </div>
  );

  return (
    <Link
      href={href}
      className="block rounded-lg transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
    >
      {content}
    </Link>
  );
}

function OwnerQuickActions() {
  const actions: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "Add Tenant", href: "/super-admin/subscriptions", icon: Building2 },
    { label: "Suspend Account", href: "/super-admin/settings", icon: AlertTriangle },
    { label: "Generate Invoice", href: "/super-admin/payments", icon: ReceiptText },
    { label: "Review Plans", href: "/super-admin/plans", icon: CreditCard },
  ];

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm shadow-slate-200/70 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
          >
            <Icon className="size-4" aria-hidden="true" />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}

function BusinessTable({
  tenants,
  allowDelete,
}: {
  tenants: PlatformTenant[];
  allowDelete: boolean;
}) {
  return (
    <table className="w-full min-w-[980px] text-left text-sm">
      <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
        <tr>
          <th className="px-5 py-3 font-semibold">Business</th>
          <th className="px-5 py-3 font-semibold">Plan</th>
          <th className="px-5 py-3 font-semibold">Status</th>
          <th className="px-5 py-3 font-semibold">Last Payment</th>
          <th className="px-5 py-3 font-semibold">Next Due</th>
          <th className="px-5 py-3 font-semibold">Amount</th>
          <th className="px-5 py-3 font-semibold">Payment</th>
          <th className="px-5 py-3 font-semibold">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {tenants.map((tenant) => (
          <tr key={tenant.id} className="hover:bg-slate-50/80">
            <td className="px-5 py-4">
              <p className="font-bold text-slate-950">{tenant.business}</p>
              <p className="mt-1 text-xs font-medium text-slate-500 capitalize">
                {tenant.kind} - {tenant.region} - {tenant.phone}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-400">
                {tenant.address}
              </p>
            </td>
            <td className="px-5 py-4 font-semibold text-slate-800">{tenant.plan}</td>
            <td className="px-5 py-4">
              <Badge tone={statusTone[tenant.status]} className="capitalize">
                {tenant.status.replace("_", " ")}
              </Badge>
            </td>
            <td className="px-5 py-4 text-slate-700">{tenant.lastPayment}</td>
            <td className="px-5 py-4 text-slate-700">{tenant.nextDue}</td>
            <td className="px-5 py-4 font-bold text-slate-950">
              {tenant.amount ? formatUgx(tenant.amount) : "Trial"}
            </td>
            <td className="px-5 py-4">
              <p className="font-semibold text-slate-800">{tenant.paymentMethod}</p>
              <Badge tone={activityTone[tenant.activity]} className="mt-2 capitalize">
                {tenant.activity}
              </Badge>
            </td>
            <td className="px-5 py-4">
              <DeleteTenantAccountButton
                tenantId={tenant.id}
                business={tenant.business}
                disabled={!allowDelete}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OwnerQueue({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: PlatformTenant[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.length ? (
          items.map((tenant) => (
            <div key={`${title}-${tenant.id}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950">{tenant.business}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {tenant.plan} - due {tenant.nextDue}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {tenant.paymentMethod} - {tenant.phone}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-950">
                  {tenant.amount ? formatUgx(tenant.amount) : "Trial"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
            No accounts need attention.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
