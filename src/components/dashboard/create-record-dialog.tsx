"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, CheckCircle2, Loader2, PackagePlus, ReceiptText, Save, Stethoscope, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Field =
  | {
      name: string;
      label: string;
      type?: "text" | "email" | "number" | "date";
      placeholder?: string;
      required?: boolean;
      min?: string;
    }
  | {
      name: string;
      label: string;
      type: "select";
      options: Array<{ value: string; label: string }>;
      required?: boolean;
    };

type CreateConfig = {
  actionParam: string;
  description: string;
  endpoint: string;
  fields: Field[];
  icon: ReactNode;
  success: string;
  title: string;
  trigger: string;
};

const configs = {
  inventory: {
    actionParam: "add-item",
    description: "Add a medicine, stock count, reorder level, price, and expiry date.",
    endpoint: "/api/inventory",
    icon: <PackagePlus className="size-4" />,
    success: "Stock item saved. Inventory totals will update after refresh.",
    title: "Add stock item",
    trigger: "Add item",
    fields: [
      { name: "name", label: "Medicine / item name", placeholder: "Amoxicillin 500mg", required: true },
      { name: "sku", label: "SKU optional", placeholder: "AMOX-500" },
      { name: "category", label: "Category", placeholder: "Antibiotics", required: true },
      { name: "stockOnHand", label: "Quantity in stock", type: "number", min: "0", placeholder: "120", required: true },
      { name: "reorderLevel", label: "Reorder level", type: "number", min: "0", placeholder: "30", required: true },
      { name: "unitPrice", label: "Unit price UGX", type: "number", min: "0", placeholder: "2500", required: true },
      { name: "expiryDate", label: "Expiry date", type: "date" },
    ],
  },
  doctor: {
    actionParam: "add-doctor",
    description: "Create a doctor profile for appointment assignment and consultation billing.",
    endpoint: "/api/doctors",
    icon: <Stethoscope className="size-4" />,
    success: "Doctor profile saved. The clinical team list will refresh.",
    title: "Add doctor",
    trigger: "Add doctor",
    fields: [
      { name: "fullName", label: "Doctor full name", placeholder: "Dr. Sarah Namusoke", required: true },
      { name: "specialization", label: "Specialization", placeholder: "General Medicine", required: true },
      { name: "licenseNumber", label: "License number", placeholder: "UCP-12345", required: true },
      { name: "phone", label: "Phone", placeholder: "+256 700 000 000", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "doctor@clinic.ug", required: true },
      { name: "consultationFee", label: "Consultation fee UGX", type: "number", min: "0", placeholder: "50000", required: true },
      { name: "room", label: "Room", placeholder: "Room 3", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "available", label: "Available" },
          { value: "busy", label: "Busy" },
          { value: "offline", label: "Offline" },
        ],
      },
    ],
  },
  branch: {
    actionParam: "add-branch",
    description: "Add a branch location with manager, staff, patient activity, and revenue.",
    endpoint: "/api/branches",
    icon: <Building2 className="size-4" />,
    success: "Branch saved. The owner overview will refresh.",
    title: "Add branch",
    trigger: "Add branch",
    fields: [
      { name: "name", label: "Branch name", placeholder: "Mukono Branch", required: true },
      { name: "region", label: "Region / town", placeholder: "Mukono", required: true },
      { name: "manager", label: "Manager", placeholder: "Grace Nankya", required: true },
      { name: "patientsToday", label: "Patients today", type: "number", min: "0", placeholder: "18", required: true },
      { name: "revenueMonth", label: "Monthly revenue UGX", type: "number", min: "0", placeholder: "2400000", required: true },
      { name: "staffOnline", label: "Staff online", type: "number", min: "0", placeholder: "6", required: true },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "attention", label: "Needs attention" },
          { value: "closed", label: "Closed" },
        ],
      },
    ],
  },
  invoice: {
    actionParam: "new-invoice",
    description: "Create a bill for consultation, lab, medicine, admission, or other services.",
    endpoint: "/api/invoices",
    icon: <ReceiptText className="size-4" />,
    success: "Invoice saved. Billing totals will update after refresh.",
    title: "New invoice",
    trigger: "New invoice",
    fields: [
      { name: "customerName", label: "Customer / patient name", placeholder: "Sarah Nakato", required: true },
      { name: "amount", label: "Amount UGX", type: "number", min: "0", placeholder: "85000", required: true },
      { name: "paidAmount", label: "Paid amount UGX", type: "number", min: "0", placeholder: "0", required: true },
      {
        name: "payerType",
        label: "Payment type",
        type: "select",
        options: [
          { value: "cash", label: "Cash" },
          { value: "mobile_money", label: "Mobile money" },
          { value: "insurance", label: "Insurance" },
        ],
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "issued", label: "Issued" },
          { value: "draft", label: "Draft" },
          { value: "paid", label: "Paid" },
          { value: "overdue", label: "Overdue" },
        ],
      },
      { name: "dueAt", label: "Due date", type: "date" },
    ],
  },
} satisfies Record<string, CreateConfig>;

type CreateKind = keyof typeof configs;

export function AddInventoryItemDialog({ label = "Add item", autoOpen = true }: { label?: string; autoOpen?: boolean }) {
  return <CreateRecordDialog kind="inventory" label={label} autoOpen={autoOpen} />;
}

export function AddDoctorDialog() {
  return <CreateRecordDialog kind="doctor" />;
}

export function AddBranchDialog() {
  return <CreateRecordDialog kind="branch" />;
}

export function AddInvoiceDialog({ label = "New invoice", autoOpen = true }: { label?: string; autoOpen?: boolean }) {
  return <CreateRecordDialog kind="invoice" label={label} autoOpen={autoOpen} />;
}

function CreateRecordDialog({ kind, label, autoOpen = true }: { kind: CreateKind; label?: string; autoOpen?: boolean }) {
  const config = configs[kind];
  const router = useRouter();
  const initialForm = useMemo(() => initialValues(config.fields), [config.fields]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(name: string, value: string) {
    setMessage("");
    setError("");
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(payload.error ?? "Unable to save this record.");

      setForm(initialForm);
      setMessage(payload.demo ? `${config.success} Saved in local demo mode.` : config.success);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this record.");
    } finally {
      setLoading(false);
    }
  }

  function closeDialog() {
    setOpen(false);
    setMessage("");
    setError("");
  }

  return (
    <>
      {autoOpen ? (
        <Suspense fallback={null}>
          <CreateRecordDialogAutoOpen actionParam={config.actionParam} setOpen={setOpen} />
        </Suspense>
      ) : null}

      <Button onClick={() => setOpen(true)}>
        {config.icon}
        {label ?? config.trigger}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-hidden bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${kind}-dialog-title`}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-2xl shadow-slate-950/20 sm:max-h-[calc(100dvh-2.5rem)]"
          >
            <div className="shrink-0 border-b border-slate-300 bg-white px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-normal text-sky-700">Quick create</p>
                  <h3 id={`${kind}-dialog-title`} className="mt-1 text-xl font-bold text-slate-950">
                    {config.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{config.description}</p>
                </div>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  aria-label={`Close ${config.title} form`}
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
                <div className="grid gap-5">
                  {message ? (
                    <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                      <span>{message}</span>
                    </div>
                  ) : null}
                  {error ? (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                      {error}
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    {config.fields.map((field) =>
                      field.type === "select" ? (
                        <Select
                          key={field.name}
                          label={field.label}
                          name={field.name}
                          value={form[field.name] ?? ""}
                          onChange={(event) => updateField(field.name, event.target.value)}
                          required={field.required}
                        >
                          {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          key={field.name}
                          label={field.label}
                          name={field.name}
                          type={field.type ?? "text"}
                          min={field.min}
                          placeholder={field.placeholder}
                          value={form[field.name] ?? ""}
                          onChange={(event) => updateField(field.name, event.target.value)}
                          required={field.required}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 shrink-0 border-t border-slate-300 bg-white px-5 py-4 shadow-[0_-12px_30px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function CreateRecordDialogAutoOpen({
  actionParam,
  setOpen,
}: {
  actionParam: string;
  setOpen: (open: boolean) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === actionParam) {
      setOpen(true);
    }
  }, [actionParam, searchParams, setOpen]);

  return null;
}

function initialValues(fields: Field[]) {
  const values: Record<string, string> = {};
  for (const field of fields) {
    if (field.type === "select") {
      values[field.name] = field.options[0]?.value ?? "";
    } else {
      values[field.name] = "";
    }
  }
  return values;
}
