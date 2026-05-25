import {
  Activity,
  Banknote,
  Building2,
  CreditCard,
  LineChart,
  Pill,
  ReceiptText,
  Settings,
  Stethoscope,
  Ticket,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DeleteTenantAccountButton } from "@/components/super-admin/delete-tenant-account-button";
import { TenantAdminPasswordResetButton } from "@/components/super-admin/tenant-admin-password-reset-button";
import { TenantAccessControlButtons } from "@/components/super-admin/tenant-access-control-buttons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlatformTenant, SupportTicket } from "@/lib/platform-demo";
import { subscriptionPlans } from "@/lib/platform-demo";
import type { TenantKind } from "@/lib/types";
import { formatUgx } from "@/lib/utils";

const statusTone = {
  active: "green",
  trialing: "blue",
  past_due: "amber",
  disabled: "rose",
} as const;

const activityTone = {
  active: "green",
  quiet: "amber",
  inactive: "rose",
} as const;

const priorityTone = {
  low: "slate",
  medium: "amber",
  high: "rose",
} as const;

export function PlatformSectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Badge tone="blue">{eyebrow}</Badge>
        <h1 className="mt-4 text-2xl font-bold tracking-normal text-[#080833] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-slate-600">
          {description}
        </p>
      </div>
      <div className="grid size-14 place-items-center rounded-lg bg-violet-100 text-violet-700">
        <Icon className="size-7" aria-hidden="true" />
      </div>
    </div>
  );
}

export function TenantDirectory({
  tenants,
  kind,
  allowDelete = true,
}: {
  tenants: PlatformTenant[];
  kind?: TenantKind;
  allowDelete?: boolean;
}) {
  const visibleTenants = kind ? tenants.filter((tenant) => tenant.kind === kind) : tenants;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{kind ? `${kindLabel(kind)} directory` : "Tenant directory"}</CardTitle>
        <CardDescription>Manage subscribed businesses and their current status.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Business</th>
              <th className="px-5 py-3 font-semibold">Plan</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Users</th>
              <th className="px-5 py-3 font-semibold">Region</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="px-5 py-3 font-semibold">Next Due</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Payment</th>
              <th className="px-5 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleTenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-50/80">
                <td className="px-5 py-4">
                  <p className="font-bold text-slate-950">{tenant.business}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500 capitalize">{tenant.kind}</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">{tenant.address}</p>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-800">{tenant.plan}</td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone[tenant.status]} className="capitalize">
                    {tenant.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-slate-700">{tenant.users}</td>
                <td className="px-5 py-4 text-slate-700">{tenant.region}</td>
                <td className="px-5 py-4 text-slate-700">
                  <p>{tenant.phone}</p>
                  <p className="mt-1 text-xs text-slate-500">{tenant.email}</p>
                </td>
                <td className="px-5 py-4 text-slate-700">{tenant.nextDue}</td>
                <td className="px-5 py-4 font-bold text-slate-950">
                  {tenant.amount ? formatUgx(tenant.amount) : "Trial"}
                </td>
                <td className="px-5 py-4 text-slate-700">{tenant.paymentMethod}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <TenantAccessControlButtons
                      tenantId={tenant.id}
                      business={tenant.business}
                      status={tenant.status}
                      disabled={!allowDelete}
                    />
                    <TenantAdminPasswordResetButton
                      tenantId={tenant.id}
                      business={tenant.business}
                      disabled={!allowDelete}
                    />
                    <DeleteTenantAccountButton
                      tenantId={tenant.id}
                      business={tenant.business}
                      disabled={!allowDelete}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function BillingLedger({
  tenants,
  allowDelete = true,
}: {
  tenants: PlatformTenant[];
  allowDelete?: boolean;
}) {
  const pending = tenants.filter((tenant) => tenant.status !== "active");

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
      <TenantDirectory tenants={tenants} allowDelete={allowDelete} />
      <Card>
        <CardHeader>
          <CardTitle>Payment follow-up</CardTitle>
          <CardDescription>Expired, trial, and pending accounts.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {pending.map((tenant) => (
            <div key={tenant.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
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
                <Badge tone={statusTone[tenant.status]} className="capitalize">
                  {tenant.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function PlanCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {subscriptionPlans.map((plan) => (
        <Card key={plan.name}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.features}</CardDescription>
              </div>
              <div className="grid size-11 place-items-center rounded-lg bg-violet-100 text-violet-700">
                <ReceiptText className="size-5" aria-hidden="true" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-950">
              {formatUgx(plan.price)}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">per tenant / month</p>
            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">{plan.tenants} tenants</p>
              <p className="mt-1 text-xs font-medium text-slate-500">Currently subscribed</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ActivityList({ tenants }: { tenants: PlatformTenant[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {tenants.map((tenant) => (
        <Card key={tenant.id}>
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-950">{tenant.business}</p>
                <p className="mt-1 text-sm font-medium text-slate-500 capitalize">
                  {tenant.kind} - {tenant.users} users
                </p>
              </div>
              <Badge tone={activityTone[tenant.activity]} className="capitalize">
                {tenant.activity}
              </Badge>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full bg-violet-600"
                style={{
                  width:
                    tenant.activity === "active"
                      ? "88%"
                      : tenant.activity === "quiet"
                        ? "48%"
                        : "18%",
                }}
              />
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">
              Last payment: {tenant.lastPayment} - Next due: {tenant.nextDue}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {tenant.paymentMethod} - {tenant.address}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TicketList({ tickets }: { tickets: SupportTicket[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client support tickets</CardTitle>
        <CardDescription>Issues that can affect renewals, onboarding, and retention.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{ticket.id}</p>
                <p className="mt-2 text-base font-bold text-slate-950">{ticket.title}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {ticket.business} - updated {ticket.updatedAt}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge tone={priorityTone[ticket.priority]} className="capitalize">
                  {ticket.priority}
                </Badge>
                <Badge tone={ticket.status === "resolved" ? "green" : "blue"} className="capitalize">
                  {ticket.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export const sectionIcons = {
  activity: Activity,
  analytics: LineChart,
  billing: CreditCard,
  clinics: Users,
  dentistry: Stethoscope,
  hospitals: Building2,
  payments: CreditCard,
  pharmacies: Pill,
  plans: ReceiptText,
  revenue: Banknote,
  settings: Settings,
  subscriptions: ReceiptText,
  support: Ticket,
};

function kindLabel(kind: TenantKind) {
  if (kind === "hospital") return "Hospital";
  if (kind === "pharmacy") return "Pharmacy";
  if (kind === "dentistry") return "Dentistry";
  return "Clinic";
}
