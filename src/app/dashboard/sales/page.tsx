import Link from "next/link";
import { CalendarDays, Coins, PackageCheck, ReceiptText } from "lucide-react";
import { DailySalesRegister } from "@/components/dashboard/daily-sales-register";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { formatUgandanCurrency } from "@/lib/utils";

export default async function DailySalesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = normalizeDate(params.date) ?? todayInEastAfrica();
  const data = await getDashboardData();
  const daySales = data.dailySales
    .filter((sale) => sale.sale_date === selectedDate)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const dayTotal = daySales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const dayQuantity = daySales.reduce((sum, sale) => sum + Number(sale.quantity), 0);
  const averageSale = daySales.length ? dayTotal / daySales.length : 0;

  return (
    <div>
      <PageHeading
        eyebrow="Daily sales"
        title="Sales register"
        description="Record medicines, tablets, consultation fees, lab tests, and any other sale with quantity and amount."
        actions={
          <form action="/dashboard/sales" className="flex flex-wrap items-end gap-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              <span>Open date</span>
              <input
                type="date"
                name="date"
                defaultValue={selectedDate}
                className="h-10 rounded-lg border border-slate-400 bg-white px-3 text-sm text-slate-950 shadow-sm shadow-slate-300/70 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
              />
            </label>
            <Button type="submit" variant="secondary">
              <CalendarDays className="size-4" />
              Open
            </Button>
            <Link
              href="/dashboard/sales"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-400 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm shadow-slate-300/70 transition hover:border-violet-400 hover:bg-violet-50"
            >
              Today
            </Link>
          </form>
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <Coins className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{formatUgandanCurrency(dayTotal)}</p>
              <p className="text-sm text-slate-500">Close of day total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <ReceiptText className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{daySales.length}</p>
              <p className="text-sm text-slate-500">Sales entered</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <PackageCheck className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{formatQuantity(dayQuantity)}</p>
              <p className="text-sm text-slate-500">Quantity sold</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Avg {formatUgandanCurrency(averageSale)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DailySalesRegister
        key={selectedDate}
        sales={daySales}
        selectedDate={selectedDate}
        tenantKind={data.tenant.tenant_kind}
      />
    </div>
  );
}

function normalizeDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
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

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: 2,
  }).format(value);
}
