export type UserRole =
  | "admin"
  | "doctor"
  | "receptionist"
  | "pharmacist"
  | "patient";

export type TenantKind = "clinic" | "hospital" | "pharmacy";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "refunded";

export type PaymentProvider =
  | "flutterwave"
  | "mtn_momo"
  | "airtel_money"
  | "stripe";

export type NotificationChannel = "email" | "whatsapp" | "sms" | "in_app";

export type TenantStatus = "active" | "trialing" | "past_due" | "disabled";
export type TenantTheme = "purple" | "blue" | "green" | "dark";

export interface Tenant {
  id: string;
  tenant_kind: TenantKind;
  name: string;
  slug: string;
  legal_name: string;
  region: string;
  address: string;
  phone: string;
  email: string;
  status: TenantStatus;
  subdomain: string | null;
  logo_url?: string | null;
  cover_image_url?: string | null;
  profile_image_url?: string | null;
  primary_color?: string | null;
  accent_color?: string | null;
  theme?: TenantTheme | null;
  brand_tagline?: string | null;
  logo_approved_at?: string | null;
  storage_usage_mb?: number | null;
  created_at: string;
}

export interface AppUser {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  is_platform_admin: boolean;
  last_seen_at: string | null;
}

export interface Doctor {
  id: string;
  tenant_id: string;
  user_id: string | null;
  full_name: string;
  specialization: string;
  license_number: string;
  phone: string;
  email: string;
  consultation_fee: number;
  status: "available" | "busy" | "offline";
  room: string;
}

export interface Patient {
  id: string;
  tenant_id: string;
  user_id: string | null;
  full_name: string;
  date_of_birth: string | null;
  sex: "female" | "male" | "other";
  phone: string;
  email: string | null;
  national_id: string | null;
  medical_history: string[];
  allergies: string[];
  emergency_contact: {
    name: string;
    phone: string;
  } | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface Schedule {
  id: string;
  tenant_id: string;
  doctor_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  doctor_id: string;
  patient_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  fee: number;
  payment_status: PaymentStatus;
  created_at: string;
  doctor?: Doctor;
  patient?: Patient;
}

export interface Payment {
  id: string;
  tenant_id: string;
  appointment_id: string | null;
  patient_id: string | null;
  provider: PaymentProvider;
  provider_reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  phone: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string | null;
  patient_id: string | null;
  appointment_id: string | null;
  channel: NotificationChannel;
  destination: string;
  subject: string;
  body: string;
  status: "queued" | "sent" | "failed";
  created_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plan: "starter" | "growth" | "enterprise";
  status: "trialing" | "active" | "past_due" | "cancelled";
  amount: number;
  currency: string;
  current_period_end: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  tone: "blue" | "green" | "amber" | "rose";
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  appointments: number;
}

export interface Diagnosis {
  id: string;
  tenant_id: string;
  patient_id: string;
  label: string;
  status: "active" | "resolved";
  diagnosed_at: string;
  notes: string | null;
}

export interface ClinicalPrescription {
  id: string;
  tenant_id: string;
  patient_id: string;
  medication: string;
  dosage: string;
  status: "active" | "completed" | "cancelled";
  prescribed_by: string;
  prescribed_at: string;
}

export interface LabResult {
  id: string;
  tenant_id: string;
  patient_id: string;
  test_name: string;
  requested_by: string;
  status: "requested" | "processing" | "completed" | "cancelled";
  result_summary: string | null;
  report_url: string | null;
  requested_at: string;
  completed_at: string | null;
}

export interface VisitRecord {
  id: string;
  tenant_id: string;
  patient_id: string;
  doctor_name: string;
  visit_type: string;
  notes: string;
  visited_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  patient_id: string | null;
  invoice_number: string;
  customer_name: string;
  amount: number;
  paid_amount: number;
  status: "draft" | "issued" | "paid" | "overdue" | "void";
  payer_type: "cash" | "mobile_money" | "insurance";
  due_at: string;
  created_at: string;
}

export interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  region: string;
  manager: string;
  patients_today: number;
  revenue_month: number;
  staff_online: number;
  status: "active" | "attention" | "closed";
}

export interface InventoryItem {
  id: string;
  tenant_id: string;
  name: string;
  sku: string;
  category: string;
  stock_on_hand: number;
  reorder_level: number;
  unit_price: number;
  expiry_date: string | null;
  status: "in_stock" | "low_stock" | "out_of_stock" | "expiring";
}

export interface PrescriptionOrder {
  id: string;
  tenant_id: string;
  patient_name: string;
  prescriber: string;
  medicine: string;
  quantity: number;
  status: "received" | "dispensing" | "ready" | "collected" | "cancelled";
  total_amount: number;
  fulfillment_due: string;
  created_at: string;
}

export interface DashboardData {
  tenant: Tenant;
  user: AppUser;
  metrics: DashboardMetric[];
  doctors: Doctor[];
  patients: Patient[];
  appointments: Appointment[];
  payments: Payment[];
  notifications: Notification[];
  subscriptions: Subscription[];
  revenue: RevenuePoint[];
  diagnoses: Diagnosis[];
  clinicalPrescriptions: ClinicalPrescription[];
  labResults: LabResult[];
  visitRecords: VisitRecord[];
  invoices: Invoice[];
  branches: Branch[];
  inventory: InventoryItem[];
  prescriptions: PrescriptionOrder[];
}
