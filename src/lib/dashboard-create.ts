import { addDays } from "date-fns";
import { z } from "zod";
import type { Branch, DailySale, Doctor, InventoryItem, Invoice, SalesShift } from "@/lib/types";
import { slugify } from "@/lib/utils";

export const inventoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(140),
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  category: z.string().trim().min(2).max(80),
  stockOnHand: z.coerce.number().int().min(0).default(0),
  reorderLevel: z.coerce.number().int().min(0).default(0),
  unitPrice: z.coerce.number().min(0).default(0),
  unitCost: z.coerce.number().min(0).default(0),
  expiryDate: z
    .string()
    .date()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
});

export const doctorCreateSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  specialization: z.string().trim().min(2).max(100),
  licenseNumber: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email(),
  consultationFee: z.coerce.number().min(0).default(0),
  room: z.string().trim().min(1).max(80).default("Unassigned"),
  status: z.enum(["available", "busy", "offline"]).default("available"),
});

export const branchCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  region: z.string().trim().min(2).max(80),
  manager: z.string().trim().min(2).max(120),
  patientsToday: z.coerce.number().int().min(0).default(0),
  revenueMonth: z.coerce.number().min(0).default(0),
  staffOnline: z.coerce.number().int().min(0).default(0),
  status: z.enum(["active", "attention", "closed"]).default("active"),
});

export const invoiceCreateSchema = z.object({
  customerName: z.string().trim().min(2).max(140),
  amount: z.coerce.number().min(0),
  paidAmount: z.coerce.number().min(0).default(0),
  status: z.enum(["draft", "issued", "paid", "overdue", "void"]).default("issued"),
  payerType: z.enum(["cash", "mobile_money", "insurance"]).default("cash"),
  dueAt: z
    .string()
    .date()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
});

export const dailySaleCreateSchema = z.object({
  shiftId: z.string().trim().min(1),
  inventoryItemId: z.string().trim().optional().or(z.literal("")),
  saleDate: z
    .string()
    .date()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || new Date().toISOString().slice(0, 10)),
  itemName: z.string().trim().min(2).max(160),
  category: z.enum([
    "medicine",
    "tablet",
    "clinic_service",
    "consultation",
    "lab_test",
    "medical_supply",
    "other",
  ]).default("medicine"),
  quantity: z.coerce.number().positive().max(100000).default(1),
  unitPrice: z.coerce.number().min(0).max(100000000).default(0),
  unitCost: z.coerce.number().min(0).max(100000000).default(0),
  paymentMethod: z.enum([
    "cash",
    "mtn_momo",
    "airtel_money",
    "card",
    "insurance",
    "other",
  ]).default("cash"),
  customerName: z.string().trim().max(140).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const salesShiftOpenSchema = z.object({
  shiftDate: z
    .string()
    .date()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || todayInEastAfrica()),
  shiftType: z.enum(["day", "night"]).default("day"),
  sellerName: z.string().trim().min(2).max(120),
  branchName: z.string().trim().min(2).max(120),
  openingCashBalance: z.coerce.number().min(0).max(100000000).default(0),
  deviceName: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const salesShiftCloseSchema = z.object({
  closingCashBalance: z.coerce.number().min(0).max(100000000),
  expensesTotal: z.coerce.number().min(0).max(100000000).default(0),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type InventoryCreateInput = z.infer<typeof inventoryCreateSchema>;
export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;
export type BranchCreateInput = z.infer<typeof branchCreateSchema>;
export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
export type DailySaleCreateInput = z.infer<typeof dailySaleCreateSchema>;
export type SalesShiftOpenInput = z.infer<typeof salesShiftOpenSchema>;
export type SalesShiftCloseInput = z.infer<typeof salesShiftCloseSchema>;

export function buildInventoryInsert(input: InventoryCreateInput, tenantId: string) {
  const sku = input.sku?.trim() || `${slugify(input.name).slice(0, 16).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;

  return {
    tenant_id: tenantId,
    name: input.name,
    sku,
    category: input.category,
    stock_on_hand: input.stockOnHand,
    reorder_level: input.reorderLevel,
    unit_price: input.unitPrice,
    unit_cost: input.unitCost,
    expiry_date: input.expiryDate ?? null,
    status: inventoryStatus(input.stockOnHand, input.reorderLevel, input.expiryDate),
  };
}

export function buildLocalDemoInventoryItem(input: InventoryCreateInput, tenantId: string): InventoryItem {
  return {
    ...buildInventoryInsert(input, tenantId),
    id: `local-stock-${crypto.randomUUID()}`,
  };
}

export function buildDoctorInsert(input: DoctorCreateInput, tenantId: string) {
  return {
    tenant_id: tenantId,
    user_id: null,
    full_name: input.fullName,
    specialization: input.specialization,
    license_number: input.licenseNumber,
    phone: input.phone,
    email: input.email,
    consultation_fee: input.consultationFee,
    room: input.room,
    status: input.status,
  };
}

export function buildLocalDemoDoctor(input: DoctorCreateInput, tenantId: string): Doctor {
  return {
    ...buildDoctorInsert(input, tenantId),
    id: `local-doc-${crypto.randomUUID()}`,
  };
}

export function buildBranchInsert(input: BranchCreateInput, tenantId: string) {
  return {
    tenant_id: tenantId,
    name: input.name,
    region: input.region,
    manager: input.manager,
    patients_today: input.patientsToday,
    revenue_month: input.revenueMonth,
    staff_online: input.staffOnline,
    status: input.status,
  };
}

export function buildLocalDemoBranch(input: BranchCreateInput, tenantId: string): Branch {
  return {
    ...buildBranchInsert(input, tenantId),
    id: `local-branch-${crypto.randomUUID()}`,
  };
}

export function buildInvoiceInsert(input: InvoiceCreateInput, tenantId: string) {
  const invoiceNumber = `MLK-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

  return {
    tenant_id: tenantId,
    patient_id: null,
    invoice_number: invoiceNumber,
    customer_name: input.customerName,
    amount: input.amount,
    paid_amount: Math.min(input.paidAmount, input.amount),
    status: input.status,
    payer_type: input.payerType,
    due_at: input.dueAt ? new Date(input.dueAt).toISOString() : addDays(new Date(), 7).toISOString(),
  };
}

export function buildLocalDemoInvoice(input: InvoiceCreateInput, tenantId: string): Invoice {
  return {
    ...buildInvoiceInsert(input, tenantId),
    id: `local-invoice-${crypto.randomUUID()}`,
    created_at: new Date().toISOString(),
  };
}

export function buildDailySaleInsert(input: DailySaleCreateInput, tenantId: string, soldBy: string | null) {
  return {
    tenant_id: tenantId,
    shift_id: input.shiftId,
    inventory_item_id: input.inventoryItemId || null,
    sale_date: input.saleDate,
    item_name: input.itemName,
    category: input.category,
    quantity: input.quantity,
    unit_price: input.unitPrice,
    unit_cost: input.unitCost,
    payment_method: input.paymentMethod,
    customer_name: input.customerName?.trim() || null,
    sold_by: soldBy,
    notes: input.notes?.trim() || null,
  };
}

export function buildLocalDemoDailySale(
  input: DailySaleCreateInput,
  tenantId: string,
  soldBy: string | null,
): DailySale {
  const insert = buildDailySaleInsert(input, tenantId, soldBy);
  const totalAmount = Number(insert.quantity) * Number(insert.unit_price);
  const profitAmount = (Number(insert.unit_price) - Number(insert.unit_cost)) * Number(insert.quantity);

  return {
    ...insert,
    id: `local-sale-${crypto.randomUUID()}`,
    total_amount: totalAmount,
    profit_amount: profitAmount,
    stock_remaining_after: null,
    status: "sold",
    created_at: new Date().toISOString(),
  };
}

export function buildSalesShiftOpenInsert(input: SalesShiftOpenInput, tenantId: string, sellerId: string | null) {
  return {
    tenant_id: tenantId,
    shift_code: buildShiftCode(input.shiftDate, input.shiftType),
    shift_date: input.shiftDate,
    shift_type: input.shiftType,
    seller_id: sellerId,
    seller_name: input.sellerName,
    branch_name: input.branchName,
    opening_cash_balance: input.openingCashBalance,
    device_name: input.deviceName?.trim() || null,
    notes: input.notes?.trim() || null,
    status: "open" as const,
  };
}

export function buildLocalDemoSalesShift(
  input: SalesShiftOpenInput,
  tenantId: string,
  sellerId: string | null,
): SalesShift {
  const now = new Date().toISOString();

  return {
    ...buildSalesShiftOpenInsert(input, tenantId, sellerId),
    id: `local-shift-${crypto.randomUUID()}`,
    closing_cash_balance: null,
    expenses_total: 0,
    expected_cash: null,
    cash_difference: null,
    closing_notes: null,
    opened_at: now,
    closed_at: null,
    created_at: now,
  };
}

export function inventoryStatus(stockOnHand: number, reorderLevel: number, expiryDate?: string | null): InventoryItem["status"] {
  if (stockOnHand <= 0) return "out_of_stock";
  if (expiryDate) {
    const daysToExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86_400_000);
    if (daysToExpiry <= 90) return "expiring";
  }
  if (stockOnHand <= reorderLevel) return "low_stock";
  return "in_stock";
}

function buildShiftCode(shiftDate: string, shiftType: SalesShiftOpenInput["shiftType"]) {
  const date = shiftDate.replaceAll("-", "");
  return `SHIFT-${date}-${shiftType.toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
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
