"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  LogIn,
  LogOut,
  Plus,
  Save,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AppUser,
  Branch,
  DailySale,
  DailySaleCategory,
  DailySalePaymentMethod,
  InventoryItem,
  SalesShift,
  TenantKind,
} from "@/lib/types";
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
  shiftId: string;
  saleDate: string;
  inventoryItemId: string;
  itemName: string;
  category: DailySaleCategory;
  quantity: string;
  unitPrice: string;
  unitCost: string;
  paymentMethod: DailySalePaymentMethod;
  customerName: string;
  notes: string;
};

type ShiftOpenForm = {
  sellerName: string;
  branchName: string;
  openingCashBalance: string;
  deviceName: string;
  notes: string;
};

type ShiftCloseForm = {
  closingCashBalance: string;
  expensesTotal: string;
  notes: string;
};

type TopItem = {
  name: string;
  quantity: number;
  amount: number;
};

function initialSaleForm(selectedDate: string, tenantKind: TenantKind, shiftId: string): SaleForm {
  return {
    shiftId,
    saleDate: selectedDate,
    inventoryItemId: "",
    itemName: "",
    category: tenantKind === "pharmacy" ? "medicine" : "clinic_service",
    quantity: "1",
    unitPrice: "",
    unitCost: "",
    paymentMethod: "cash",
    customerName: "",
    notes: "",
  };
}

export function DailySalesRegister({
  sales,
  selectedDate,
  tenantKind,
  activeShift,
  shifts,
  inventory,
  user,
  branches,
  topItems,
  lowStockItems,
}: {
  sales: DailySale[];
  selectedDate: string;
  tenantKind: TenantKind;
  activeShift: SalesShift | null;
  shifts: SalesShift[];
  inventory: InventoryItem[];
  user: AppUser;
  branches: Branch[];
  topItems: TopItem[];
  lowStockItems: InventoryItem[];
}) {
  const router = useRouter();
  const [saleForm, setSaleForm] = useState<SaleForm>(() =>
    initialSaleForm(selectedDate, tenantKind, activeShift?.id ?? ""),
  );
  const [shiftForm, setShiftForm] = useState<ShiftOpenForm>(() => ({
    sellerName: user.full_name,
    branchName: branches[0]?.name ?? "Main branch",
    openingCashBalance: "0",
    deviceName: "Current device",
    notes: "",
  }));
  const [closeForm, setCloseForm] = useState<ShiftCloseForm>({
    closingCashBalance: "",
    expensesTotal: "0",
    notes: "",
  });
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | DailySaleCategory>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | DailySalePaymentMethod>("all");
  const [showSaleRow, setShowSaleRow] = useState(Boolean(activeShift));
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [saleLoading, setSaleLoading] = useState(false);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const shiftLookup = useMemo(() => new Map(shifts.map((shift) => [shift.id, shift])), [shifts]);
  const inventoryLookup = useMemo(
    () => new Map(inventory.map((item) => [item.id, item])),
    [inventory],
  );
  const selectedInventoryItem = saleForm.inventoryItemId
    ? inventoryLookup.get(saleForm.inventoryItemId) ?? null
    : null;
  const quantity = Number(saleForm.quantity || 0);
  const unitPrice = Number(saleForm.unitPrice || 0);
  const unitCost = Number(saleForm.unitCost || 0);
  const lineTotal = Number.isFinite(quantity * unitPrice) ? quantity * unitPrice : 0;
  const lineProfit = Number.isFinite((unitPrice - unitCost) * quantity)
    ? (unitPrice - unitCost) * quantity
    : 0;
  const stockAfter =
    selectedInventoryItem && Number.isFinite(quantity)
      ? Number(selectedInventoryItem.stock_on_hand) - quantity
      : null;
  const visibleSales = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sales.filter((sale) => {
      const matchesQuery =
        !normalizedQuery ||
        sale.item_name.toLowerCase().includes(normalizedQuery) ||
        sale.customer_name?.toLowerCase().includes(normalizedQuery) ||
        shiftLookup.get(sale.shift_id ?? "")?.seller_name.toLowerCase().includes(normalizedQuery);
      const matchesCategory = categoryFilter === "all" || sale.category === categoryFilter;
      const matchesPayment = paymentFilter === "all" || sale.payment_method === paymentFilter;

      return matchesQuery && matchesCategory && matchesPayment;
    });
  }, [categoryFilter, paymentFilter, query, sales, shiftLookup]);

  const activeShiftSales = activeShift
    ? sales.filter((sale) => sale.shift_id === activeShift.id && sale.status === "sold")
    : [];
  const activeShiftCash = activeShiftSales
    .filter((sale) => sale.payment_method === "cash")
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const activeShiftRevenue = activeShiftSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const activeShiftProfit = activeShiftSales.reduce((sum, sale) => sum + Number(sale.profit_amount ?? 0), 0);
  const expectedCash =
    Number(activeShift?.opening_cash_balance ?? 0) +
    activeShiftCash -
    Number(closeForm.expensesTotal || 0);
  const cashDifference = Number(closeForm.closingCashBalance || 0) - expectedCash;

  function updateSaleField<Key extends keyof SaleForm>(key: Key, value: SaleForm[Key]) {
    setMessage("");
    setError("");
    setSaleForm((current) => ({ ...current, [key]: value }));
  }

  function updateShiftField<Key extends keyof ShiftOpenForm>(key: Key, value: ShiftOpenForm[Key]) {
    setMessage("");
    setError("");
    setShiftForm((current) => ({ ...current, [key]: value }));
  }

  function updateCloseField<Key extends keyof ShiftCloseForm>(key: Key, value: ShiftCloseForm[Key]) {
    setMessage("");
    setError("");
    setCloseForm((current) => ({ ...current, [key]: value }));
  }

  function handleInventoryChange(value: string) {
    const item = inventoryLookup.get(value);
    setMessage("");
    setError("");
    setSaleForm((current) => {
      if (!item) {
        return {
          ...current,
          inventoryItemId: "",
        };
      }

      return {
        ...current,
        inventoryItemId: item.id,
        itemName: item.name,
        category: categoryFromInventory(item.category),
        unitPrice: String(Number(item.unit_price ?? 0)),
        unitCost: String(Number(item.unit_cost ?? 0)),
      };
    });
  }

  async function handleOpenShift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShiftLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/sales-shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shiftForm),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(payload.error ?? "Unable to open this shift.");

      setMessage(payload.demo ? "Shift opened in local demo mode." : "Shift opened.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to open this shift.");
    } finally {
      setShiftLoading(false);
    }
  }

  async function handleSaleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeShift) {
      setError("Open a shift before recording sales.");
      return;
    }

    setSaleLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/daily-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...saleForm,
          shiftId: activeShift.id,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(payload.error ?? "Unable to record this sale.");

      setSaleForm((current) => ({
        ...initialSaleForm(current.saleDate, tenantKind, activeShift.id),
        category: current.category,
        paymentMethod: current.paymentMethod,
      }));
      setMessage(payload.demo ? "Sale recorded in local demo mode." : "Sale recorded.");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to record this sale.");
    } finally {
      setSaleLoading(false);
    }
  }

  async function handleCloseShift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeShift) return;
    setCloseLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/sales-shifts/${activeShift.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(closeForm),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(payload.error ?? "Unable to close this shift.");

      setMessage(payload.demo ? "Shift closed in local demo mode." : "Shift closed.");
      setShowCloseForm(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to close this shift.");
    } finally {
      setCloseLoading(false);
    }
  }

  function openClosePanel() {
    setCloseForm((current) => ({
      ...current,
      closingCashBalance: current.closingCashBalance || String(Math.max(0, Math.round(expectedCash))),
    }));
    setShowCloseForm(true);
  }

  return (
    <div className="space-y-5">
      {(message || error) ? (
        <div className="rounded-lg border border-slate-300 bg-white p-3 shadow-sm shadow-slate-200">
          {message ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="size-4" />
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">
              <AlertCircle className="size-4" />
              {error}
            </div>
          ) : null}
        </div>
      ) : null}

      {!activeShift ? (
        <section className="rounded-lg border border-slate-300 bg-white shadow-md shadow-slate-300/40">
          <div className="border-b border-slate-300 bg-sky-50/80 p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-lg bg-white text-sky-700 ring-1 ring-sky-200">
                <LockKeyhole className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">Open shift</h2>
                <p className="mt-1 text-sm text-slate-600">Sales entry unlocks after a cashier shift is open.</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleOpenShift} className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-6">
            <Field label="Seller name" className="xl:col-span-2">
              <input
                className={inputClass}
                value={shiftForm.sellerName}
                onChange={(event) => updateShiftField("sellerName", event.target.value)}
                required
              />
            </Field>
            <Field label="Branch" className="xl:col-span-2">
              <select
                className={inputClass}
                value={shiftForm.branchName}
                onChange={(event) => updateShiftField("branchName", event.target.value)}
                required
              >
                {(branches.length ? branches : [{ id: "main", name: "Main branch" }]).map((branch) => (
                  <option key={branch.id} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Opening cash" className="xl:col-span-2">
              <input
                className={inputClass}
                type="number"
                min="0"
                step="1"
                value={shiftForm.openingCashBalance}
                onChange={(event) => updateShiftField("openingCashBalance", event.target.value)}
                required
              />
            </Field>
            <Field label="Device used" className="xl:col-span-2">
              <input
                className={inputClass}
                value={shiftForm.deviceName}
                onChange={(event) => updateShiftField("deviceName", event.target.value)}
              />
            </Field>
            <Field label="Notes" className="xl:col-span-3">
              <input
                className={inputClass}
                value={shiftForm.notes}
                onChange={(event) => updateShiftField("notes", event.target.value)}
              />
            </Field>
            <div className="flex items-end xl:col-span-1">
              <Button type="submit" className="w-full" disabled={shiftLoading}>
                {shiftLoading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
                Open New Shift
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <section className="rounded-lg border border-slate-300 bg-white shadow-md shadow-slate-300/40">
          <div className="grid gap-4 p-5 xl:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="green">Open</Badge>
                <span className="text-sm font-semibold text-slate-950">{activeShift.shift_code}</span>
                <span className="text-sm text-slate-500">{activeShift.branch_name}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <ShiftMetric label="Seller" value={activeShift.seller_name} />
                <ShiftMetric label="Opening cash" value={formatUgandanCurrency(activeShift.opening_cash_balance)} />
                <ShiftMetric label="Cash expected" value={formatUgandanCurrency(expectedCash)} />
                <ShiftMetric label="Shift sales" value={formatUgandanCurrency(activeShiftRevenue)} />
                <ShiftMetric label="Shift profit" value={formatUgandanCurrency(activeShiftProfit)} />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowSaleRow(true)}>
                <Plus className="size-4" />
                Add sale
              </Button>
              <Button type="button" variant="danger" onClick={openClosePanel}>
                <LogOut className="size-4" />
                Close Shift
              </Button>
            </div>
          </div>

          {showCloseForm ? (
            <form onSubmit={handleCloseShift} className="grid gap-4 border-t border-slate-300 bg-slate-50 p-5 md:grid-cols-2 xl:grid-cols-6">
              <Field label="Closing cash" className="xl:col-span-2">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="1"
                  value={closeForm.closingCashBalance}
                  onChange={(event) => updateCloseField("closingCashBalance", event.target.value)}
                  required
                />
              </Field>
              <Field label="Expenses made" className="xl:col-span-2">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="1"
                  value={closeForm.expensesTotal}
                  onChange={(event) => updateCloseField("expensesTotal", event.target.value)}
                />
              </Field>
              <Field label="Difference" className="xl:col-span-2">
                <div
                  className={cn(
                    "flex h-11 items-center rounded-lg border bg-white px-3 text-sm font-semibold",
                    Math.abs(cashDifference) < 1
                      ? "border-emerald-300 text-emerald-800"
                      : "border-amber-300 text-amber-800",
                  )}
                >
                  {formatUgandanCurrency(cashDifference)}
                </div>
              </Field>
              <Field label="Closing notes" className="xl:col-span-5">
                <input
                  className={inputClass}
                  value={closeForm.notes}
                  onChange={(event) => updateCloseField("notes", event.target.value)}
                />
              </Field>
              <div className="flex items-end gap-2 xl:col-span-1">
                <Button type="button" variant="secondary" onClick={() => setShowCloseForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={closeLoading} className="flex-1">
                  {closeLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Close
                </Button>
              </div>
            </form>
          ) : null}
        </section>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle>Sales sheet</CardTitle>
                <CardDescription>{selectedDate}</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="h-10 w-56 rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm text-slate-950 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
                    placeholder="Search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <select
                  className="h-10 rounded-lg border border-slate-400 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value as "all" | DailySaleCategory)}
                >
                  <option value="all">All categories</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 rounded-lg border border-slate-400 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
                  value={paymentFilter}
                  onChange={(event) => setPaymentFilter(event.target.value as "all" | DailySalePaymentMethod)}
                >
                  <option value="all">All payments</option>
                  {paymentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button type="button" variant="secondary" disabled={!activeShift} onClick={() => setShowSaleRow(true)}>
                  <Plus className="size-4" />
                  Add sale
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSaleSubmit}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1900px] border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-normal text-slate-600">
                    <tr>
                      <SheetHead className="w-[145px]">Date</SheetHead>
                      <SheetHead className="w-[84px]">Time</SheetHead>
                      <SheetHead className="w-[150px]">Seller</SheetHead>
                      <SheetHead className="w-[150px]">Shift ID</SheetHead>
                      <SheetHead className="w-[160px]">Customer</SheetHead>
                      <SheetHead className="w-[230px]">Stock item</SheetHead>
                      <SheetHead className="w-[230px]">Item sold</SheetHead>
                      <SheetHead className="w-[160px]">Category</SheetHead>
                      <SheetHead className="w-[90px]">Qty</SheetHead>
                      <SheetHead className="w-[120px]">Cost</SheetHead>
                      <SheetHead className="w-[130px]">Unit</SheetHead>
                      <SheetHead className="w-[140px]">Total</SheetHead>
                      <SheetHead className="w-[130px]">Profit</SheetHead>
                      <SheetHead className="w-[120px]">Stock</SheetHead>
                      <SheetHead className="w-[150px]">Payment</SheetHead>
                      <SheetHead className="w-[220px]">Notes</SheetHead>
                      <SheetHead className="w-[130px]">Status</SheetHead>
                    </tr>
                  </thead>
                  <tbody>
                    {showSaleRow && activeShift ? (
                      <tr className="bg-sky-50/80">
                        <SheetCell>
                          <input
                            aria-label="Sale date"
                            className={cellInputClass}
                            type="date"
                            value={saleForm.saleDate}
                            onChange={(event) => updateSaleField("saleDate", event.target.value)}
                            required
                          />
                        </SheetCell>
                        <SheetCell className="font-semibold text-sky-700">New</SheetCell>
                        <SheetCell className="font-semibold text-slate-950">{activeShift.seller_name}</SheetCell>
                        <SheetCell className="text-xs font-semibold text-slate-600">{shortShiftCode(activeShift.shift_code)}</SheetCell>
                        <SheetCell>
                          <input
                            aria-label="Customer"
                            className={cellInputClass}
                            placeholder="Optional"
                            value={saleForm.customerName}
                            onChange={(event) => updateSaleField("customerName", event.target.value)}
                          />
                        </SheetCell>
                        <SheetCell>
                          <select
                            aria-label="Stock item"
                            className={cellInputClass}
                            value={saleForm.inventoryItemId}
                            onChange={(event) => handleInventoryChange(event.target.value)}
                          >
                            <option value="">Manual sale</option>
                            {inventory.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({formatQuantity(item.stock_on_hand)})
                              </option>
                            ))}
                          </select>
                        </SheetCell>
                        <SheetCell>
                          <input
                            aria-label="Item sold"
                            className={cellInputClass}
                            placeholder={tenantKind === "pharmacy" ? "Paracetamol 500mg" : "Consultation fee"}
                            value={saleForm.itemName}
                            onChange={(event) => updateSaleField("itemName", event.target.value)}
                            required
                          />
                        </SheetCell>
                        <SheetCell>
                          <select
                            aria-label="Category"
                            className={cellInputClass}
                            value={saleForm.category}
                            onChange={(event) => updateSaleField("category", event.target.value as DailySaleCategory)}
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
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={saleForm.quantity}
                            onChange={(event) => updateSaleField("quantity", event.target.value)}
                            required
                          />
                        </SheetCell>
                        <SheetCell>
                          <input
                            aria-label="Unit cost"
                            className={cn(cellInputClass, "text-right")}
                            type="number"
                            min="0"
                            step="1"
                            value={saleForm.unitCost}
                            onChange={(event) => updateSaleField("unitCost", event.target.value)}
                          />
                        </SheetCell>
                        <SheetCell>
                          <input
                            aria-label="Unit amount"
                            className={cn(cellInputClass, "text-right")}
                            type="number"
                            min="0"
                            step="1"
                            value={saleForm.unitPrice}
                            onChange={(event) => updateSaleField("unitPrice", event.target.value)}
                            required
                          />
                        </SheetCell>
                        <SheetCell className="text-right font-bold text-slate-950">
                          {formatUgandanCurrency(lineTotal)}
                        </SheetCell>
                        <SheetCell className={cn("text-right font-bold", lineProfit >= 0 ? "text-emerald-700" : "text-rose-700")}>
                          {formatUgandanCurrency(lineProfit)}
                        </SheetCell>
                        <SheetCell className={cn("text-right font-semibold", stockAfter !== null && stockAfter < 0 ? "text-rose-700" : "text-slate-700")}>
                          {stockAfter === null ? "" : formatQuantity(stockAfter)}
                        </SheetCell>
                        <SheetCell>
                          <select
                            aria-label="Payment method"
                            className={cellInputClass}
                            value={saleForm.paymentMethod}
                            onChange={(event) => updateSaleField("paymentMethod", event.target.value as DailySalePaymentMethod)}
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
                            placeholder="Receipt note"
                            value={saleForm.notes}
                            onChange={(event) => updateSaleField("notes", event.target.value)}
                          />
                        </SheetCell>
                        <SheetCell>
                          <Button type="submit" size="sm" disabled={saleLoading || (stockAfter !== null && stockAfter < 0)} className="w-full">
                            {saleLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save
                          </Button>
                        </SheetCell>
                      </tr>
                    ) : null}

                    {visibleSales.length ? (
                      visibleSales.map((sale, index) => {
                        const shift = sale.shift_id ? shiftLookup.get(sale.shift_id) : null;

                        return (
                          <tr
                            key={sale.id}
                            className={cn(index % 2 === 0 ? "bg-white" : "bg-slate-50/60", "hover:bg-sky-50/50")}
                          >
                            <SheetCell>{sale.sale_date}</SheetCell>
                            <SheetCell>{formatTime(sale.created_at)}</SheetCell>
                            <SheetCell className="font-medium text-slate-950">{shift?.seller_name ?? sale.sold_by ?? "Seller"}</SheetCell>
                            <SheetCell className="text-xs font-semibold text-slate-600">
                              {shift ? shortShiftCode(shift.shift_code) : sale.shift_id ?? ""}
                            </SheetCell>
                            <SheetCell className="text-slate-700">{sale.customer_name ?? ""}</SheetCell>
                            <SheetCell className="text-slate-600">{sale.inventory_item_id ? "Inventory" : "Manual"}</SheetCell>
                            <SheetCell className="font-medium text-slate-950">{sale.item_name}</SheetCell>
                            <SheetCell>
                              <Badge tone={categoryTone[sale.category]}>{categoryLabel[sale.category]}</Badge>
                            </SheetCell>
                            <SheetCell className="text-right font-medium text-slate-950">{formatQuantity(sale.quantity)}</SheetCell>
                            <SheetCell className="text-right text-slate-700">{formatUgandanCurrency(Number(sale.unit_cost))}</SheetCell>
                            <SheetCell className="text-right text-slate-700">{formatUgandanCurrency(Number(sale.unit_price))}</SheetCell>
                            <SheetCell className="text-right font-semibold text-slate-950">
                              {formatUgandanCurrency(Number(sale.total_amount))}
                            </SheetCell>
                            <SheetCell className={cn("text-right font-semibold", Number(sale.profit_amount) >= 0 ? "text-emerald-700" : "text-rose-700")}>
                              {formatUgandanCurrency(Number(sale.profit_amount))}
                            </SheetCell>
                            <SheetCell className="text-right text-slate-700">
                              {sale.stock_remaining_after === null ? "" : formatQuantity(sale.stock_remaining_after)}
                            </SheetCell>
                            <SheetCell>{paymentLabel[sale.payment_method]}</SheetCell>
                            <SheetCell className="max-w-[260px] truncate text-slate-600">{sale.notes ?? ""}</SheetCell>
                            <SheetCell>
                              <Badge tone={statusTone(sale.status)}>{statusLabel(sale.status)}</Badge>
                            </SheetCell>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <SheetCell colSpan={17} className="py-10 text-center text-sm font-medium text-slate-500">
                          No saved rows for this view.
                        </SheetCell>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <section className="rounded-lg border border-slate-300 bg-white shadow-md shadow-slate-300/40">
            <div className="border-b border-slate-300 bg-sky-50/80 p-5">
              <h2 className="text-base font-semibold text-slate-950">Top selling items</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {topItems.length ? (
                topItems.map((item) => (
                  <div key={item.name} className="grid grid-cols-[1fr_auto] gap-3 p-4">
                    <div>
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      <p className="text-sm text-slate-500">Qty {formatQuantity(item.quantity)}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-950">{formatUgandanCurrency(item.amount)}</p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm font-medium text-slate-500">No top sellers yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-slate-300 bg-white shadow-md shadow-slate-300/40">
            <div className="border-b border-slate-300 bg-amber-50/80 p-5">
              <h2 className="text-base font-semibold text-slate-950">Low stock alerts</h2>
            </div>
            <div className="divide-y divide-slate-200">
              {lowStockItems.length ? (
                lowStockItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 p-4">
                    <div>
                      <p className="font-semibold text-slate-950">{item.name}</p>
                      <p className="text-sm text-slate-500">{statusLabel(item.status)}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-950">{formatQuantity(item.stock_on_hand)}</p>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm font-medium text-slate-500">Stock levels look fine.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm text-slate-950 shadow-sm shadow-slate-200 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-100";

const cellInputClass =
  "h-10 w-full border-0 bg-transparent px-2 text-sm text-slate-950 outline-none ring-1 ring-transparent transition placeholder:text-slate-400 focus:bg-white focus:ring-sky-400";

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("grid gap-2 text-sm font-semibold text-slate-700", className)}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function ShiftMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

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

function categoryFromInventory(category: string): DailySaleCategory {
  const normalized = category.toLowerCase();
  if (normalized.includes("tablet")) return "tablet";
  if (normalized.includes("lab")) return "lab_test";
  if (normalized.includes("supply")) return "medical_supply";
  if (normalized.includes("service")) return "clinic_service";
  return "medicine";
}

function shortShiftCode(value: string) {
  const parts = value.split("-");
  return parts.length >= 3 ? `${parts[0]}-${parts.at(-1)}` : value;
}

function statusTone(value: DailySale["status"] | InventoryItem["status"]): "blue" | "green" | "amber" | "rose" | "slate" {
  if (value === "sold" || value === "in_stock") return "green";
  if (value === "refunded" || value === "low_stock" || value === "expiring") return "amber";
  if (value === "void" || value === "out_of_stock") return "rose";
  return "slate";
}

function statusLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
