import Link from "next/link";
import {
  Banknote,
  CalendarDays,
  FileDown,
  ReceiptText,
  RotateCcw,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { DailySalesRegister } from "@/components/dashboard/daily-sales-register";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import type { DailySale, SalesShiftType } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

export default async function DailySalesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; shift?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = normalizeDate(params.date) ?? todayInEastAfrica();
  const selectedShiftType = normalizeShiftType(params.shift) ?? "day";
  const data = await getDashboardData();
  const daySales = data.dailySales
    .filter((sale) => sale.sale_date === selectedDate)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const soldSales = daySales.filter((sale) => sale.status === "sold");
  const refundedSales = daySales.filter((sale) => sale.status === "refunded");
  const dayTotal = soldSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const cashTotal = soldSales
    .filter((sale) => sale.payment_method === "cash")
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const momoTotal = soldSales
    .filter((sale) => sale.payment_method === "mtn_momo" || sale.payment_method === "airtel_money")
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const profitTotal = soldSales.reduce((sum, sale) => sum + Number(sale.profit_amount ?? 0), 0);
  const refundTotal = refundedSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const knownCustomers = new Set(
    soldSales
      .map((sale) => sale.customer_name?.trim().toLowerCase())
      .filter(Boolean),
  );
  const customerCount = knownCustomers.size || soldSales.length;
  const selectedDayShifts = data.salesShifts.filter(
    (shift) => shiftDate(shift) === selectedDate && shiftType(shift) === selectedShiftType,
  );
  const activeShift =
    selectedDayShifts.find((shift) => shift.status === "open" && shift.seller_id === data.user.id) ??
    selectedDayShifts.find((shift) => shift.status === "open") ??
    null;
  const selectedShift =
    activeShift ??
    selectedDayShifts.find((shift) => shift.seller_id === data.user.id) ??
    selectedDayShifts[0] ??
    null;
  const selectedShiftSales = selectedShift
    ? daySales.filter((sale) => sale.shift_id === selectedShift.id)
    : [];
  const topItems = topSellingItems(soldSales);
  const lowStockItems = data.inventory
    .filter((item) => ["low_stock", "out_of_stock", "expiring"].includes(item.status))
    .slice(0, 8);
  const reportUrl = `/api/daily-sales/report?date=${selectedDate}`;

  return (
    <div>
      <PageHeading
        eyebrow="Daily sales"
        title="Shift sales register"
        description="Every day starts with a seller shift. Type the drug or item name, quantity, and price manually, then close the shift with cash and MoMo totals."
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <form action="/dashboard/sales" className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="shift" value={selectedShiftType} />
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
            </form>
            <Link
              href={`/dashboard/sales?shift=${selectedShiftType}`}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-400 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm shadow-slate-300/70 transition hover:border-violet-400 hover:bg-violet-50"
            >
              Today
            </Link>
            <a
              href={reportUrl}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-md shadow-sky-300/70 transition hover:bg-sky-700"
            >
              <FileDown className="size-4" />
              PDF
            </a>
            <a
              href={`${reportUrl}&mode=inline`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-400 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm shadow-slate-300/70 transition hover:border-violet-400 hover:bg-violet-50"
            >
              Print
            </a>
          </div>
        }
      />

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <ReceiptText className="size-5" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-950">{formatUgandanCurrency(dayTotal)}</p>
              <p className="text-sm text-slate-500">Today revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <Banknote className="size-5" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-950">{formatUgandanCurrency(cashTotal)}</p>
              <p className="text-sm text-slate-500">Cash</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <WalletCards className="size-5" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-950">{formatUgandanCurrency(momoTotal)}</p>
              <p className="text-sm text-slate-500">MoMo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-950">{formatUgandanCurrency(profitTotal)}</p>
              <p className="text-sm text-slate-500">Profit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-violet-50 text-violet-700">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-950">{formatQuantity(customerCount)}</p>
              <p className="text-sm text-slate-500">Customers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-rose-50 text-rose-700">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-950">{formatUgandanCurrency(refundTotal)}</p>
              <p className="text-sm text-slate-500">Refunds</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <DailySalesRegister
        key={`${selectedDate}:${selectedShiftType}:${activeShift?.id ?? "no-shift"}`}
        sales={selectedShiftSales}
        selectedDate={selectedDate}
        selectedShiftType={selectedShiftType}
        dailyTotal={dayTotal}
        tenantKind={data.tenant.tenant_kind}
        activeShift={activeShift}
        shifts={data.salesShifts}
        user={data.user}
        branches={data.branches}
        inventory={data.inventory}
        topItems={topItems}
        lowStockItems={lowStockItems}
      />
    </div>
  );
}

function normalizeDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return value;
}

function normalizeShiftType(value: string | undefined): SalesShiftType | null {
  return value === "night" ? "night" : value === "day" ? "day" : null;
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

function topSellingItems(sales: DailySale[]) {
  const rows = new Map<string, { name: string; quantity: number; amount: number }>();

  for (const sale of sales) {
    const existing = rows.get(sale.item_name) ?? { name: sale.item_name, quantity: 0, amount: 0 };
    existing.quantity += Number(sale.quantity);
    existing.amount += Number(sale.total_amount);
    rows.set(sale.item_name, existing);
  }

  return Array.from(rows.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
}

function shiftDate(shift: { shift_date?: string; opened_at: string }) {
  return shift.shift_date ?? shift.opened_at.slice(0, 10);
}

function shiftType(shift: { shift_type?: string }) {
  return shift.shift_type === "night" ? "night" : "day";
}
