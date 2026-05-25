import { NextRequest, NextResponse } from "next/server";
import { canManageFinance, getAuthenticatedApiProfile } from "@/lib/api-profile";
import { hasSupabaseConfig, isDemoModeAllowed } from "@/lib/config";
import { getDashboardData } from "@/lib/data/repositories";
import type { DailySale, SalesShift } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const accessError = await requireReportAccess();
  if (accessError) return accessError;

  const date = normalizeDate(request.nextUrl.searchParams.get("date")) ?? todayInEastAfrica();
  const disposition = request.nextUrl.searchParams.get("mode") === "inline" ? "inline" : "attachment";
  const data = await getDashboardData();
  const sales = data.dailySales.filter((sale) => sale.sale_date === date && sale.status === "sold");
  const lowStock = data.inventory.filter((item) =>
    ["low_stock", "out_of_stock", "expiring"].includes(item.status),
  );
  const revenue = sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const profit = sales.reduce((sum, sale) => sum + Number(sale.profit_amount ?? 0), 0);
  const cash = sales
    .filter((sale) => sale.payment_method === "cash")
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const momo = sales
    .filter((sale) => sale.payment_method === "mtn_momo" || sale.payment_method === "airtel_money")
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const topItems = topSellingItems(sales);
  const sellerPerformance = sellerTotals(sales, data.salesShifts);
  const lines = [
    `${data.tenant.name} Daily Sales Report`,
    `Date: ${date}`,
    `Generated: ${new Date().toLocaleString("en-UG")}`,
    "",
    `Total revenue: ${formatUgandanCurrency(revenue)}`,
    `Cash collected: ${formatUgandanCurrency(cash)}`,
    `MoMo collected: ${formatUgandanCurrency(momo)}`,
    `Profit: ${formatUgandanCurrency(profit)}`,
    `Transactions: ${sales.length}`,
    `Customers: ${new Set(sales.map((sale) => sale.customer_name).filter(Boolean)).size || sales.length}`,
    "",
    "Top selling items",
    ...topItems.map((item, index) => `${index + 1}. ${item.name} - Qty ${item.quantity} - ${formatUgandanCurrency(item.amount)}`),
    ...(topItems.length ? [] : ["No sales recorded."]),
    "",
    "Inventory movement",
    ...sales
      .filter((sale) => sale.inventory_item_id)
      .slice(0, 12)
      .map((sale) => `${sale.item_name} - Qty ${sale.quantity} - Stock after ${sale.stock_remaining_after ?? "n/a"}`),
    ...(sales.some((sale) => sale.inventory_item_id) ? [] : ["No inventory-linked sales."]),
    "",
    "Low stock alerts",
    ...lowStock.slice(0, 10).map((item) => `${item.name} - Stock ${item.stock_on_hand} - ${item.status.replace("_", " ")}`),
    ...(lowStock.length ? [] : ["No low stock alerts."]),
    "",
    "Seller performance",
    ...sellerPerformance.map((seller) => `${seller.name} - ${seller.transactions} transactions - ${formatUgandanCurrency(seller.amount)}`),
    ...(sellerPerformance.length ? [] : ["No seller activity."]),
  ];

  const pdf = buildSimplePdf(lines);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="medilink-sales-report-${date}.pdf"`,
    },
  });
}

async function requireReportAccess() {
  if (!hasSupabaseConfig()) {
    return isDemoModeAllowed()
      ? null
      : NextResponse.json(
          { error: "Sales reports need Supabase configuration." },
          { status: 503 },
        );
  }

  const { profile } = await getAuthenticatedApiProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageFinance(profile.role)) {
    return NextResponse.json(
      { error: "Only finance staff can export sales reports." },
      { status: 403 },
    );
  }

  return null;
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
    .slice(0, 6);
}

function sellerTotals(
  sales: DailySale[],
  shifts: SalesShift[],
) {
  const shiftLookup = new Map(shifts.map((shift) => [shift.id, shift]));
  const rows = new Map<string, { name: string; transactions: number; amount: number }>();

  for (const sale of sales) {
    const name = sale.shift_id ? shiftLookup.get(sale.shift_id)?.seller_name : undefined;
    const key = name ?? sale.sold_by ?? "Unknown seller";
    const existing = rows.get(key) ?? { name: key, transactions: 0, amount: 0 };
    existing.transactions += 1;
    existing.amount += Number(sale.total_amount);
    rows.set(key, existing);
  }

  return Array.from(rows.values()).sort((a, b) => b.amount - a.amount);
}

function buildSimplePdf(lines: string[]) {
  const width = 612;
  const height = 792;
  const text = lines
    .slice(0, 48)
    .map((line, index) => `BT /F1 10 Tf 50 ${height - 56 - index * 14} Td (${escapePdf(line.slice(0, 95))}) Tj ET`)
    .join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj`,
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${text.length} >> stream\n${text}\nendstream endobj`,
  ];
  let offset = "%PDF-1.4\n".length;
  const xref = ["0000000000 65535 f "];
  const body = objects
    .map((object) => {
      xref.push(`${String(offset).padStart(10, "0")} 00000 n `);
      offset += object.length + 1;
      return object;
    })
    .join("\n");
  const xrefOffset = offset;
  const pdf = `%PDF-1.4\n${body}\nxref\n0 ${objects.length + 1}\n${xref.join("\n")}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

function escapePdf(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function normalizeDate(value: string | null) {
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
