"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2, ReceiptText, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DailySale, DailySaleCategory, DailySalePaymentMethod, TenantKind } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

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
    <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Record sale</CardTitle>
          <CardDescription>Medicine, tablets, clinic services, lab tests, and other counter sales.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
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

            <Input
              label="Sale date"
              name="saleDate"
              type="date"
              value={form.saleDate}
              onChange={(event) => updateField("saleDate", event.target.value)}
              required
            />
            <Input
              label="Item sold"
              name="itemName"
              placeholder={tenantKind === "pharmacy" ? "Paracetamol 500mg tablets" : "Consultation fee"}
              value={form.itemName}
              onChange={(event) => updateField("itemName", event.target.value)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Category"
                name="category"
                value={form.category}
                onChange={(event) => updateField("category", event.target.value as DailySaleCategory)}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select
                label="Payment"
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={(event) => updateField("paymentMethod", event.target.value as DailySalePaymentMethod)}
              >
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Quantity"
                name="quantity"
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={(event) => updateField("quantity", event.target.value)}
                required
              />
              <Input
                label="Unit amount UGX"
                name="unitPrice"
                type="number"
                min="0"
                step="1"
                value={form.unitPrice}
                onChange={(event) => updateField("unitPrice", event.target.value)}
                required
              />
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Line total</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">{formatUgandanCurrency(lineTotal)}</p>
            </div>
            <Textarea
              label="Notes"
              name="notes"
              placeholder="Receipt note, patient name, or delivery reference"
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {loading ? "Saving..." : "Save sale"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Sales for {selectedDate}</CardTitle>
              <CardDescription>Entries are stored by sale date and separated from tomorrow&apos;s register.</CardDescription>
            </div>
            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <ReceiptText className="size-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">Item</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Qty</th>
                <th className="px-5 py-3 font-semibold">Unit</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.length ? (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-4 text-slate-600">{formatTime(sale.created_at)}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">{sale.item_name}</p>
                      {sale.notes ? <p className="mt-1 text-xs text-slate-500">{sale.notes}</p> : null}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={categoryTone[sale.category]}>{categoryLabel[sale.category]}</Badge>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-950">{formatQuantity(sale.quantity)}</td>
                    <td className="px-5 py-4 text-slate-700">{formatUgandanCurrency(Number(sale.unit_price))}</td>
                    <td className="px-5 py-4 font-semibold text-slate-950">
                      {formatUgandanCurrency(Number(sale.total_amount))}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{paymentLabel[sale.payment_method]}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm font-medium text-slate-500">
                    No sales recorded for this day.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
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
