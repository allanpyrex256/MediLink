"use client";

import { useMemo, useState, type FormEvent, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailySale, DailySaleCategory, DailySalePaymentMethod, TenantKind } from "@/lib/types";
import { cn, formatUgandanCurrency } from "@/lib/utils";

const categoryOptions: Array<{ value: DailySaleCategory; label: string }> = [
  { value: "medicine", label: "Medicine" },
  { value: "tablet", label: "Tablet" },
  { value: "clinic_service", label: "Clinic service" },
  { value: "consultation", label: "Consultation" },
  { value: "lab_test", label: "Lab / test" },
  { value: "medical_supply", label: "Medical supply" },
  { value: "other", label: "Other" },
];

const paymentOptions: Array<{ value: DailySalePaymentMethod; label: string }> = [
  { value: "cash", label: "Cash" },
  { value: "mtn_momo", label: "MTN MoMo" },
  { value: "airtel_money", label: "Airtel Money" },
  { value: "card", label: "Card" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

const categoryTone: Record<DailySaleCategory, "blue" | "green" | "amber" | "rose" | "slate"> = {
  medicine: "green",
  tablet: "blue",
  clinic_service: "amber",
  consultation: "blue",
  lab_test: "rose",
  medical_supply: "green",
  other: "slate",
};

const categoryLabel = Object.fromEntries(
  categoryOptions.map((option) => [option.value, option.label]),
) as Record<DailySaleCategory, string>;

const paymentLabel = Object.fromEntries(
  paymentOptions.map((option) => [option.value, option.label]),
) as Record<DailySalePaymentMethod, string>;

type SaleForm = {
  saleDate: string;
  itemName: string;
  category: DailySaleCategory;
  quantity: string;
  unitPrice: string;
  paymentMethod: DailySalePaymentMethod;
  notes: string;
};

function initialForm(selectedDate: string, tenantKind: TenantKind): SaleForm {
  return {
    saleDate: selectedDate,
    itemName: "",
    category: tenantKind === "pharmacy" ? "medicine" : "clinic_service",
    quantity: "1",
    unitPrice: "",
    paymentMethod: "cash",
    notes: "",
  };
}

export function DailySalesRegister({
  sales,
  selectedDate,
  tenantKind,
}: {
  sales: DailySale[];
  selectedDate: string;
  tenantKind: TenantKind;
}) {
  const router = useRouter();
  const [form, setForm] = useState<SaleForm>(() => initialForm(selectedDate, tenantKind));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const lineTotal = useMemo(() => {
    const quantity = Number(form.quantity || 0);
    const unitPrice = Number(form.unitPrice || 0);
    return Number.isFinite(quantity * unitPrice) ? quantity * unitPrice : 0;
  }, [form.quantity, form.unitPrice]);

  function updateField<Key extends keyof SaleForm>(key: Key, value: SaleForm[Key]) {
    setMessage("");
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/daily-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(payload.error ?? "Unable to record this sale.");

      setForm((current) => ({
        ...initialForm(current.saleDate, tenantKind),
        category: current.category,
        paymentMethod: current.paymentMethod,
      }));
      setMessage(payload.demo ? "Sale recorded in local demo mode." : "Sale recorded.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to record this sale.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily sales sheet</CardTitle>
        <CardDescription>{selectedDate}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit}>
          {(message || error) ? (
            <div className="border-b border-slate-200 px-5 py-3">
              {message ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                  {message}
                </div>
              ) : null}
              {error ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">
                  {error}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1240px] border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase tracking-normal text-slate-600">
                <tr>
                  <SheetHead className="w-[150px]">Date</SheetHead>
                  <SheetHead className="w-[86px]">Time</SheetHead>
                  <SheetHead className="min-w-[250px]">Item sold</SheetHead>
                  <SheetHead className="w-[170px]">Category</SheetHead>
                  <SheetHead className="w-[110px]">Qty</SheetHead>
                  <SheetHead className="w-[150px]">Unit UGX</SheetHead>
                  <SheetHead className="w-[160px]">Total</SheetHead>
                  <SheetHead className="w-[160px]">Payment</SheetHead>
                  <SheetHead className="min-w-[220px]">Notes</SheetHead>
                  <SheetHead className="w-[120px]">Action</SheetHead>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-sky-50/80">
                  <SheetCell>
                    <input
                      aria-label="Sale date"
                      className={cellInputClass}
                      name="saleDate"
                      type="date"
                      value={form.saleDate}
                      onChange={(event) => updateField("saleDate", event.target.value)}
                      required
                    />
                  </SheetCell>
                  <SheetCell className="font-semibold text-sky-700">New</SheetCell>
                  <SheetCell>
                    <input
                      aria-label="Item sold"
                      className={cellInputClass}
                      name="itemName"
                      placeholder={tenantKind === "pharmacy" ? "Paracetamol 500mg tablets" : "Consultation fee"}
                      value={form.itemName}
                      onChange={(event) => updateField("itemName", event.target.value)}
                      required
                    />
                  </SheetCell>
                  <SheetCell>
                    <select
                      aria-label="Category"
                      className={cellInputClass}
                      name="category"
                      value={form.category}
                      onChange={(event) => updateField("category", event.target.value as DailySaleCategory)}
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </SheetCell>
                  <SheetCell>
                    <input
                      aria-label="Quantity"
                      className={cn(cellInputClass, "text-right")}
                      name="quantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.quantity}
                      onChange={(event) => updateField("quantity", event.target.value)}
                      required
                    />
                  </SheetCell>
                  <SheetCell>
                    <input
                      aria-label="Unit amount UGX"
                      className={cn(cellInputClass, "text-right")}
                      name="unitPrice"
                      type="number"
                      min="0"
                      step="1"
                      value={form.unitPrice}
                      onChange={(event) => updateField("unitPrice", event.target.value)}
                      required
                    />
                  </SheetCell>
                  <SheetCell className="text-right font-bold text-slate-950">
                    {formatUgandanCurrency(lineTotal)}
                  </SheetCell>
                  <SheetCell>
                    <select
                      aria-label="Payment method"
                      className={cellInputClass}
                      name="paymentMethod"
                      value={form.paymentMethod}
                      onChange={(event) => updateField("paymentMethod", event.target.value as DailySalePaymentMethod)}
                    >
                      {paymentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </SheetCell>
                  <SheetCell>
                    <input
                      aria-label="Notes"
                      className={cellInputClass}
                      name="notes"
                      placeholder="Receipt note"
                      value={form.notes}
                      onChange={(event) => updateField("notes", event.target.value)}
                    />
                  </SheetCell>
                  <SheetCell>
                    <Button type="submit" size="sm" disabled={loading} className="w-full">
                      {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Save
                    </Button>
                  </SheetCell>
                </tr>

                {sales.length ? (
                  sales.map((sale, index) => (
                    <tr key={sale.id} className={cn(index % 2 === 0 ? "bg-white" : "bg-slate-50/60", "hover:bg-sky-50/50")}>
                      <SheetCell>{sale.sale_date}</SheetCell>
                      <SheetCell>{formatTime(sale.created_at)}</SheetCell>
                      <SheetCell className="font-medium text-slate-950">{sale.item_name}</SheetCell>
                      <SheetCell>
                        <Badge tone={categoryTone[sale.category]}>{categoryLabel[sale.category]}</Badge>
                      </SheetCell>
                      <SheetCell className="text-right font-medium text-slate-950">{formatQuantity(sale.quantity)}</SheetCell>
                      <SheetCell className="text-right text-slate-700">{formatUgandanCurrency(Number(sale.unit_price))}</SheetCell>
                      <SheetCell className="text-right font-semibold text-slate-950">
                        {formatUgandanCurrency(Number(sale.total_amount))}
                      </SheetCell>
                      <SheetCell>{paymentLabel[sale.payment_method]}</SheetCell>
                      <SheetCell className="max-w-[260px] truncate text-slate-600">{sale.notes ?? ""}</SheetCell>
                      <SheetCell className="text-slate-400">Saved</SheetCell>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <SheetCell colSpan={10} className="py-10 text-center text-sm font-medium text-slate-500">
                      No saved rows for this day.
                    </SheetCell>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

const cellInputClass =
  "h-10 w-full border-0 bg-transparent px-2 text-sm text-slate-950 outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:bg-white focus:ring-sky-400";

function SheetHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("border border-slate-300 px-3 py-2 font-bold", className)}
      {...props}
    />
  );
}

function SheetCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("h-12 border border-slate-200 px-3 py-2 align-middle", className)}
      {...props}
    />
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-UG", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: 2,
  }).format(Number(value));
}
