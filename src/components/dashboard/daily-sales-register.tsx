"use client";

import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import Link from "next/link";
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
  SalesShiftType,
  TenantKind,
} from "@/lib/types";
import { cn, formatUgandanCurrency } from "@/lib/utils";

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
  shiftDate: string;
  shiftType: SalesShiftType;
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
  selectedShiftType,
  dailyTotal,
  tenantKind,
  tenantName,
  activeShift,
  shifts,
  user,
  branches,
  inventory,
}: {
  sales: DailySale[];
  selectedDate: string;
  selectedShiftType: SalesShiftType;
  dailyTotal: number;
  tenantKind: TenantKind;
  tenantName: string;
  activeShift: SalesShift | null;
  shifts: SalesShift[];
  user: AppUser;
  branches: Branch[];
  inventory: InventoryItem[];
}) {
  const router = useRouter();
  const [saleForm, setSaleForm] = useState<SaleForm>(() =>
    initialSaleForm(selectedDate, tenantKind, activeShift?.id ?? ""),
  );
  const [optimisticSales, setOptimisticSales] = useState<DailySale[]>([]);
  const saleFormRef = useRef<HTMLFormElement>(null);
  const saleItemNameRef = useRef<HTMLInputElement>(null);
  const shiftLocationName = tenantKind === "pharmacy" ? tenantName : branches[0]?.name ?? tenantName;
  const shiftForm = useMemo<ShiftOpenForm>(() => ({
    shiftDate: selectedDate,
    shiftType: selectedShiftType,
    sellerName: user.full_name,
    branchName: shiftLocationName,
    openingCashBalance: "0",
    deviceName: "Current device",
    notes: "",
  }), [selectedDate, selectedShiftType, shiftLocationName, user.full_name]);
  const [closeForm, setCloseForm] = useState<ShiftCloseForm>({
    closingCashBalance: "",
    expensesTotal: "0",
    notes: "",
  });
  const [query, setQuery] = useState("");
  const [showSaleRow, setShowSaleRow] = useState(Boolean(activeShift));
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [saleLoading, setSaleLoading] = useState(false);
  const [shiftLoading, setShiftLoading] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dayShift = useMemo(
    () =>
      shifts.find(
        (shift) =>
          getShiftDate(shift) === selectedDate &&
          getShiftType(shift) === selectedShiftType &&
          shift.seller_id === user.id,
      ) ??
      shifts.find(
        (shift) => getShiftDate(shift) === selectedDate && getShiftType(shift) === selectedShiftType,
      ) ??
      null,
    [selectedDate, selectedShiftType, shifts, user.id],
  );
  const sheetSales = useMemo(() => {
    if (!optimisticSales.length) return sales;

    const rows = new Map(sales.map((sale) => [sale.id, sale]));
    for (const sale of optimisticSales) rows.set(sale.id, sale);

    return Array.from(rows.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [optimisticSales, sales]);
  const visibleSales = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sheetSales.filter((sale) => {
      const matchesQuery =
        !normalizedQuery ||
        sale.item_name.toLowerCase().includes(normalizedQuery);

      return matchesQuery;
    });
  }, [query, sheetSales]);
  const serverShiftTotal = sales
    .filter((sale) => sale.status === "sold")
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const shiftTotal = sheetSales
    .filter((sale) => sale.status === "sold")
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const displayedDailyTotal = dailyTotal + (shiftTotal - serverShiftTotal);

  const activeShiftSales = activeShift
    ? sheetSales.filter((sale) => sale.shift_id === activeShift.id && sale.status === "sold")
    : [];
  const activeShiftCash = activeShiftSales
    .filter((sale) => sale.payment_method === "cash")
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const expectedCash =
    Number(activeShift?.opening_cash_balance ?? 0) +
    activeShiftCash -
    Number(closeForm.expensesTotal || 0);
  const cashDifference = Number(closeForm.closingCashBalance || 0) - expectedCash;
  const saleDraftHasContent = hasSaleDraft(saleForm);

  function updateSaleField<Key extends keyof SaleForm>(key: Key, value: SaleForm[Key]) {
    setMessage("");
    setError("");
    setSaleForm((current) => ({ ...current, [key]: value }));
  }

  function updateCloseField<Key extends keyof ShiftCloseForm>(key: Key, value: ShiftCloseForm[Key]) {
    setMessage("");
    setError("");
    setCloseForm((current) => ({ ...current, [key]: value }));
  }

  function prepareNextSaleRow() {
    if (!activeShift) return;

    setSaleForm((current) => ({
      ...initialSaleForm(selectedDate, tenantKind, activeShift.id),
      category: current.category,
      paymentMethod: current.paymentMethod,
    }));
    setShowSaleRow(true);
    requestAnimationFrame(() => saleItemNameRef.current?.focus());
  }

  function startNewSaleRow() {
    if (!activeShift) {
      setError("Open a shift before adding items.");
      return;
    }

    if (showSaleRow && saleDraftHasContent) {
      saleFormRef.current?.requestSubmit();
      return;
    }

    setMessage("");
    setError("");
    prepareNextSaleRow();
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

      if (payload.data) {
        const savedSale = payload.data as DailySale;
        setOptimisticSales((current) => [
          savedSale,
          ...current.filter((sale) => sale.id !== savedSale.id),
        ]);
      }
      prepareNextSaleRow();
      setMessage(payload.demo ? "Sale recorded in local demo mode. Add another item." : "Sale recorded. Add another item.");
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

  function shiftDisplayLocation(shift: SalesShift) {
    return tenantKind === "pharmacy" ? tenantName : shift.branch_name;
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

      {!activeShift && dayShift ? (
        <section className="rounded-lg border border-slate-300 bg-white shadow-md shadow-slate-300/40">
          <div className="grid gap-4 p-5 xl:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="slate">Closed</Badge>
                <span className="text-sm font-semibold text-slate-950">{dayShift.shift_code}</span>
                <Badge tone="blue">{shiftTypeLabel(getShiftType(dayShift))}</Badge>
                <span className="text-sm text-slate-500">{shiftDisplayLocation(dayShift)}</span>
                <span className="text-sm text-slate-500">{getShiftDate(dayShift)}</span>
              </div>
            </div>
          </div>
        </section>
      ) : !activeShift ? (
        <section className="rounded-lg border border-slate-300 bg-white shadow-md shadow-slate-300/40">
          <div className="border-b border-slate-300 bg-sky-50/80 p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-lg bg-white text-sky-700 ring-1 ring-sky-200">
                <LockKeyhole className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">Open {shiftTypeLabel(selectedShiftType)}</h2>
                <p className="mt-1 text-sm text-slate-600">Open this dated sheet before recording {selectedShiftType} sales.</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleOpenShift} className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm font-medium text-slate-600">
              Start this sheet for {selectedDate}.
            </p>
            <Button type="submit" disabled={shiftLoading}>
              {shiftLoading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
              Open {shiftTypeLabel(selectedShiftType)}
            </Button>
          </form>
        </section>
      ) : (
        <section className="rounded-lg border border-slate-300 bg-white shadow-md shadow-slate-300/40">
          <div className="grid gap-4 p-5 xl:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="green">Open</Badge>
                <span className="text-sm font-semibold text-slate-950">{activeShift.shift_code}</span>
                <Badge tone="blue">{shiftTypeLabel(getShiftType(activeShift))}</Badge>
                <span className="text-sm text-slate-500">{shiftDisplayLocation(activeShift)}</span>
                <span className="text-sm text-slate-500">{getShiftDate(activeShift)}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Button type="button" variant="secondary" disabled={saleLoading} onClick={startNewSaleRow}>
                <Plus className="size-4" />
                Add item
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

      <div>
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle>{shiftTypeLabel(selectedShiftType)} sales sheet</CardTitle>
                <CardDescription>
                  {selectedDate} - Daily total {formatUgandanCurrency(displayedDailyTotal)}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ShiftSheetSwitch selectedDate={selectedDate} selectedShiftType={selectedShiftType} />
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    className="h-10 w-56 rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm text-slate-950 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100"
                    placeholder="Search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <Button type="button" variant="secondary" disabled={!activeShift || saleLoading} onClick={startNewSaleRow}>
                  <Plus className="size-4" />
                  Add item
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <form ref={saleFormRef} onSubmit={handleSaleSubmit}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-normal text-slate-600">
                    <tr>
                      <SheetHead>Item name</SheetHead>
                      <SheetHead className="w-[150px]">Quantity</SheetHead>
                      <SheetHead className="w-[180px]">Sell price</SheetHead>
                    </tr>
                  </thead>
                  <tbody>
                    {showSaleRow && activeShift ? (
                      <tr className="bg-sky-50/80">
                        <SheetCell>
                          <input
                            ref={saleItemNameRef}
                            aria-label="Item name"
                            list="sales-stock-items"
                            className={cellInputClass}
                            placeholder={tenantKind === "pharmacy" ? "Paracetamol 500mg" : "Consultation fee"}
                            value={saleForm.itemName}
                            onChange={(event) => updateSaleField("itemName", event.target.value)}
                            required
                          />
                          <datalist id="sales-stock-items">
                            {inventory.map((item) => (
                              <option key={item.id} value={item.name} />
                            ))}
                          </datalist>
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
                            aria-label="Sell price"
                            className={cn(cellInputClass, "text-right")}
                            type="number"
                            min="0"
                            step="1"
                            value={saleForm.unitPrice}
                            onChange={(event) => updateSaleField("unitPrice", event.target.value)}
                            required
                          />
                        </SheetCell>
                      </tr>
                    ) : null}

                    {visibleSales.length ? (
                      visibleSales.map((sale, index) => (
                        <tr
                          key={sale.id}
                          className={cn(index % 2 === 0 ? "bg-white" : "bg-slate-50/60", "hover:bg-sky-50/50")}
                        >
                          <SheetCell className="font-medium text-slate-950">{sale.item_name}</SheetCell>
                          <SheetCell className="text-right font-medium text-slate-950">{formatQuantity(sale.quantity)}</SheetCell>
                          <SheetCell className="text-right text-slate-700">{formatUgandanCurrency(Number(sale.unit_price))}</SheetCell>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <SheetCell colSpan={3} className="py-10 text-center text-sm font-medium text-slate-500">
                          No saved rows for this view.
                        </SheetCell>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 text-sm font-bold text-slate-950">
                      <SheetCell colSpan={2} className="text-right uppercase tracking-normal text-slate-600">
                        Total price of items sold
                      </SheetCell>
                      <SheetCell className="text-right">
                        {formatUgandanCurrency(shiftTotal)}
                      </SheetCell>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {showSaleRow && activeShift ? (
                <div className="flex justify-end border-t border-slate-200 bg-white px-5 py-4">
                  <Button type="submit" size="sm" disabled={saleLoading}>
                    {saleLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save item
                  </Button>
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

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

function ShiftSheetSwitch({
  selectedDate,
  selectedShiftType,
}: {
  selectedDate: string;
  selectedShiftType: SalesShiftType;
}) {
  return (
    <div className="grid min-w-[250px] grid-cols-2 gap-1 rounded-lg border border-slate-300 bg-slate-100 p-1">
      {(["day", "night"] as const).map((type) => (
        <Link
          key={type}
          href={`/dashboard/sales?date=${selectedDate}&shift=${type}`}
          className={cn(
            "inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-semibold transition",
            selectedShiftType === type
              ? "bg-sky-600 text-white shadow-sm shadow-sky-200"
              : "bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-800",
          )}
        >
          {shiftTypeLabel(type)}
        </Link>
      ))}
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

function getShiftDate(shift: { shift_date?: string; opened_at: string }) {
  return shift.shift_date ?? shift.opened_at.slice(0, 10);
}

function getShiftType(shift: { shift_type?: string }): SalesShiftType {
  return shift.shift_type === "night" ? "night" : "day";
}

function shiftTypeLabel(type: SalesShiftType) {
  return type === "night" ? "Night Shift" : "Day Shift";
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function hasSaleDraft(form: SaleForm) {
  return Boolean(
    form.inventoryItemId ||
      form.itemName.trim() ||
      form.unitPrice.trim() ||
      form.unitCost.trim() ||
      form.customerName.trim() ||
      form.notes.trim() ||
      form.quantity.trim() !== "1",
  );
}
