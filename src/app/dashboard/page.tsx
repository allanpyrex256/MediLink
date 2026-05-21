import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  type LucideIcon,
  Package,
  Pill,
  Settings,
  ShieldCheck,
  ShoppingCart,
  LogIn,
  LogOut,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { dashboardRoleForUser } from "@/lib/rbac";
import type { DashboardData } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const role = dashboardRoleForUser(data.user);

  if (role === "seller") return <SellerDashboard data={data} />;
  if (role === "pharmacist") return <PharmacistDashboard data={data} />;

  return <OwnerDashboard data={data} />;
}

function OwnerDashboard({ data }: { data: DashboardData }) {
  const totalSales = data.dailySales
    .filter((sale) => sale.status === "sold")
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const lowStock = data.inventory.filter((item) => item.status !== "in_stock");

  return (
    <DashboardShell
      eyebrow="Owner dashboard"
      title={data.tenant.name}
      description="Simple control for sales, inventory, staff, reports, and business settings."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total sales" value={formatUgandanCurrency(totalSales)} icon={ShoppingCart} />
        <MetricCard label="Inventory items" value={String(data.inventory.length)} icon={Package} />
        <MetricCard label="Low stock alerts" value={String(lowStock.length)} icon={AlertTriangle} tone="amber" />
        <MetricCard label="Staff accounts" value={String(data.branches.reduce((sum, branch) => sum + branch.staff_online, 0) || 1)} icon={ShieldCheck} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ActionCard href="/dashboard/sales" title="Sales" body="Open today's shift sheet and review seller totals." icon={ShoppingCart} />
        <ActionCard href="/dashboard/inventory" title="Inventory" body="Item name, quantity, expiry date, and stock status." icon={Package} />
        <ActionCard href="/dashboard/staff" title="Staff management" body="Add sellers and pharmacists manually." icon={ShieldCheck} />
        <ActionCard href="/dashboard/reports" title="Reports" body="Download sales, stock, and payment reports." icon={ClipboardList} />
        <ActionCard href="/dashboard/settings" title="Settings" body="Business profile, branding, and account settings." icon={Settings} />
      </div>
    </DashboardShell>
  );
}

function SellerDashboard({ data }: { data: DashboardData }) {
  const today = todayInEastAfrica();
  const todaysSales = data.dailySales.filter((sale) => sale.sale_date === today && sale.status === "sold");
  const total = todaysSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const openShift = data.salesShifts.find((shift) => shift.status === "open" && shift.seller_id === data.user.id);

  return (
    <DashboardShell
      eyebrow="Seller dashboard"
      title={`Welcome, ${data.user.full_name}`}
      description="Open a shift, record sales, see today's total, then close the shift."
    >
      <div className="mb-5 rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-normal text-slate-500">Today sales</p>
        <p className="mt-2 text-4xl font-black tracking-normal text-slate-950">{formatUgandanCurrency(total)}</p>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          {openShift ? `Open shift: ${openShift.shift_code}` : "No open shift yet"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <LargeSellerButton href="/dashboard/open-shift" title="Open Shift" icon={LogIn} />
        <LargeSellerButton href="/dashboard/sales" title="Record Sale" icon={ShoppingCart} />
        <LargeSellerButton href="/dashboard/close-shift" title="Close Shift" icon={LogOut} tone="rose" />
      </div>
    </DashboardShell>
  );
}

function PharmacistDashboard({ data }: { data: DashboardData }) {
  const lowStock = data.inventory.filter((item) => item.status === "low_stock" || item.status === "out_of_stock");
  const expiring = data.inventory.filter((item) => item.status === "expiring");
  const openPrescriptions = data.prescriptions.filter((item) => item.status !== "collected" && item.status !== "cancelled");

  return (
    <DashboardShell
      eyebrow="Pharmacist dashboard"
      title={`${data.tenant.name} dispensing`}
      description="Inventory, expiry alerts, prescriptions, and dispensing in one simple workspace."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Inventory items" value={String(data.inventory.length)} icon={Package} />
        <MetricCard label="Expiry alerts" value={String(expiring.length)} icon={AlertTriangle} tone="amber" />
        <MetricCard label="Prescriptions" value={String(openPrescriptions.length)} icon={ClipboardList} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ActionCard href="/dashboard/inventory" title="Inventory" body="Check item name, quantity, expiry, and status." icon={Package} />
        <ActionCard href="/dashboard/expiry-alerts" title="Expiry" body="See what is low, expiring soon, or out of stock." icon={Pill} />
        <ActionCard href="/dashboard/prescriptions" title="Prescriptions" body="Track prescriptions and mark dispensing status." icon={ClipboardList} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Low stock now</CardTitle>
          <CardDescription>These items need attention before sellers run out.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
              <tr>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3">Expiry</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(lowStock.length ? lowStock : data.inventory.slice(0, 5)).map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 font-bold text-slate-950">{item.name}</td>
                  <td className="px-5 py-4">{item.stock_on_hand}</td>
                  <td className="px-5 py-4">{item.expiry_date ? new Date(item.expiry_date).getFullYear() : "Not set"}</td>
                  <td className="px-5 py-4 capitalize">{item.status.replace(/_/g, " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function DashboardShell({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mx-auto max-w-[1400px]">
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-sky-700">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-slate-600">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  tone = "blue",
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone?: "blue" | "amber";
  value: string;
}) {
  const toneClass = tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700";

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`grid size-12 place-items-center rounded-lg ${toneClass}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-950">{value}</p>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  body,
  href,
  icon: Icon,
  title,
}: {
  body: string;
  href: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <Link href={href} className="block rounded-lg border border-slate-300 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50">
      <div className="grid size-11 place-items-center rounded-lg bg-sky-100 text-sky-700">
        <Icon className="size-5" />
      </div>
      <h2 className="mt-4 text-lg font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{body}</p>
    </Link>
  );
}

function LargeSellerButton({
  href,
  icon: Icon,
  title,
  tone = "blue",
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  tone?: "blue" | "rose";
}) {
  const toneClass = tone === "rose" ? "bg-rose-600 hover:bg-rose-700" : "bg-sky-600 hover:bg-sky-700";

  return (
    <Link
      href={href}
      className={`flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg px-6 py-8 text-center text-xl font-black text-white shadow-lg transition ${toneClass}`}
    >
      <Icon className="size-8" />
      {title}
    </Link>
  );
}

function todayInEastAfrica() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Kampala",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}
