import type {
  AppUser,
  Appointment,
  Branch,
  ClinicalPrescription,
  DashboardData,
  Diagnosis,
  Doctor,
  InventoryItem,
  Invoice,
  LabResult,
  Notification,
  Patient,
  Payment,
  PrescriptionOrder,
  RevenuePoint,
  Subscription,
  Tenant,
  VisitRecord,
} from "@/lib/types";
import type { DemoWorkspaceId } from "@/lib/demo-session";
import { defaultDemoWorkspaceId } from "@/lib/demo-session";
import { formatUgandanCurrency } from "@/lib/utils";

export const demoTenant: Tenant = {
  id: "11111111-1111-4111-8111-111111111111",
  tenant_kind: "hospital",
  name: "Kampala Care Hospital",
  slug: "kampala-family-clinic",
  legal_name: "Kampala Care Hospital Ltd",
  region: "Kampala, Uganda",
  address: "Plot 21 Acacia Avenue, Kololo",
  phone: "+256 700 112 233",
  email: "admin@kampalacarehospital.ug",
  status: "trialing",
  subdomain: "kampala-family-clinic",
  created_at: new Date("2026-01-12T08:00:00.000Z").toISOString(),
};

export const demoJinjaTenant: Tenant = {
  id: "33333333-3333-4333-8333-333333333333",
  tenant_kind: "hospital",
  name: "Jinja Children Hospital",
  slug: "jinja-children-hospital",
  legal_name: "Jinja Children Hospital Ltd",
  region: "Jinja, Uganda",
  address: "Main Street, Jinja",
  phone: "+256 701 900 884",
  email: "admin@jinjachildren.ug",
  status: "active",
  subdomain: "jinja-children",
  created_at: new Date("2025-11-10T08:00:00.000Z").toISOString(),
};

export const demoPharmacyTenant: Tenant = {
  id: "55555555-5555-4555-8555-555555555555",
  tenant_kind: "pharmacy",
  name: "Acacia Care Pharmacy",
  slug: "acacia-care-pharmacy",
  legal_name: "Acacia Care Pharmacy Ltd",
  region: "Kampala, Uganda",
  address: "Acacia Mall, Kisementi",
  phone: "+256 759 412 882",
  email: "manager@acaciacarepharmacy.ug",
  status: "active",
  subdomain: "acacia-care-pharmacy",
  created_at: new Date("2026-02-03T08:00:00.000Z").toISOString(),
};

export const demoUser: AppUser = {
  id: "22222222-2222-4222-8222-222222222222",
  tenant_id: demoTenant.id,
  email: "owner@medilink.test",
  full_name: "MediLink Super Admin",
  role: "admin",
  phone: "+256 772 410 100",
  avatar_url: null,
  is_platform_admin: true,
  last_seen_at: new Date().toISOString(),
};

export const demoJinjaUser: AppUser = {
  id: "66666666-6666-4666-8666-666666666666",
  tenant_id: demoJinjaTenant.id,
  email: "admin@jinjachildren.ug",
  full_name: "Grace Namatovu",
  role: "admin",
  phone: "+256 701 900 884",
  avatar_url: null,
  is_platform_admin: false,
  last_seen_at: new Date().toISOString(),
};

export const demoPharmacyUser: AppUser = {
  id: "77777777-7777-4777-8777-777777777777",
  tenant_id: demoPharmacyTenant.id,
  email: "manager@acaciacarepharmacy.ug",
  full_name: "Michael Ssewanyana",
  role: "admin",
  phone: "+256 759 412 882",
  avatar_url: null,
  is_platform_admin: false,
  last_seen_at: new Date().toISOString(),
};

export const demoDoctors: Doctor[] = [
  {
    id: "doc-1",
    tenant_id: demoTenant.id,
    user_id: null,
    full_name: "Dr. Sarah Namusoke",
    specialization: "General Medicine",
    license_number: "UMD-10492",
    phone: "+256 701 654 810",
    email: "sarah.namusoke@kampalacarehospital.ug",
    consultation_fee: 65000,
    status: "available",
    room: "Room 3",
  },
  {
    id: "doc-2",
    tenant_id: demoTenant.id,
    user_id: null,
    full_name: "Dr. Aisha Nakasujja",
    specialization: "Pediatrics",
    license_number: "UMD-11984",
    phone: "+256 752 889 401",
    email: "aisha.nakasujja@kampalacarehospital.ug",
    consultation_fee: 80000,
    status: "busy",
    room: "Room 6",
  },
  {
    id: "doc-3",
    tenant_id: demoTenant.id,
    user_id: null,
    full_name: "Dr. Peter Mwangi",
    specialization: "Cardiology",
    license_number: "KMP-22109",
    phone: "+256 782 550 140",
    email: "peter.mwangi@kampalacarehospital.ug",
    consultation_fee: 120000,
    status: "available",
    room: "Room 8",
  },
  {
    id: "doc-4",
    tenant_id: demoTenant.id,
    user_id: null,
    full_name: "Dr. Grace Atim",
    specialization: "Obstetrics",
    license_number: "UMD-99304",
    phone: "+256 775 238 444",
    email: "grace.atim@kampalacarehospital.ug",
    consultation_fee: 95000,
    status: "offline",
    room: "Room 11",
  },
];

export const demoPatients: Patient[] = [
  {
    id: "pat-1",
    tenant_id: demoTenant.id,
    user_id: null,
    full_name: "John Doe",
    date_of_birth: "1987-05-11",
    sex: "male",
    phone: "+256 703 222 118",
    email: "john.doe@example.com",
    national_id: "CM87000123Q",
    medical_history: ["Hypertension monitoring", "Annual wellness review"],
    allergies: ["Penicillin"],
    emergency_contact: { name: "Jane Doe", phone: "+256 772 000 120" },
    created_at: new Date("2026-03-01T09:00:00.000Z").toISOString(),
  },
  {
    id: "pat-2",
    tenant_id: demoTenant.id,
    user_id: null,
    full_name: "Mary Akello",
    date_of_birth: "1994-10-21",
    sex: "female",
    phone: "+256 786 450 441",
    email: "mary.akello@example.com",
    national_id: "CM94000391P",
    medical_history: ["Recent malaria treatment", "Follow-up lab review"],
    allergies: [],
    emergency_contact: { name: "Peter Akello", phone: "+256 700 761 109" },
    created_at: new Date("2026-02-18T09:00:00.000Z").toISOString(),
  },
  {
    id: "pat-3",
    tenant_id: demoTenant.id,
    user_id: null,
    full_name: "Brian Kato",
    date_of_birth: "2018-07-02",
    sex: "male",
    phone: "+256 755 912 676",
    email: null,
    national_id: null,
    medical_history: ["Pediatric immunization"],
    allergies: ["Peanuts"],
    emergency_contact: { name: "Allen Kato", phone: "+256 759 100 221" },
    created_at: new Date("2026-04-04T09:00:00.000Z").toISOString(),
  },
];

const now = new Date();

export const demoAppointments: Appointment[] = [
  {
    id: "apt-1",
    tenant_id: demoTenant.id,
    doctor_id: "doc-1",
    patient_id: "pat-1",
    scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30).toISOString(),
    duration_minutes: 30,
    status: "confirmed",
    reason: "Blood pressure review",
    notes: "Review recent readings and medication adherence.",
    fee: 65000,
    payment_status: "paid",
    created_at: new Date("2026-05-10T08:00:00.000Z").toISOString(),
  },
  {
    id: "apt-2",
    tenant_id: demoTenant.id,
    doctor_id: "doc-2",
    patient_id: "pat-3",
    scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0).toISOString(),
    duration_minutes: 30,
    status: "pending",
    reason: "Malaria follow-up",
    notes: "Review fever history and rapid test result.",
    fee: 80000,
    payment_status: "pending",
    created_at: new Date("2026-05-11T08:00:00.000Z").toISOString(),
  },
  {
    id: "apt-3",
    tenant_id: demoTenant.id,
    doctor_id: "doc-3",
    patient_id: "pat-2",
    scheduled_at: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0).toISOString(),
    duration_minutes: 45,
    status: "confirmed",
    reason: "Pediatric checkup",
    notes: "Growth review and immunization schedule.",
    fee: 120000,
    payment_status: "processing",
    created_at: new Date("2026-05-12T08:00:00.000Z").toISOString(),
  },
];

export const demoPayments: Payment[] = [
  {
    id: "pay-1",
    tenant_id: demoTenant.id,
    appointment_id: "apt-1",
    patient_id: "pat-1",
    provider: "mtn_momo",
    provider_reference: "MLK-MTN-104883",
    amount: 65000,
    currency: "UGX",
    status: "paid",
    phone: "+256703222118",
    metadata: { channel: "collections" },
    created_at: new Date("2026-05-10T08:04:00.000Z").toISOString(),
  },
  {
    id: "pay-2",
    tenant_id: demoTenant.id,
    appointment_id: "apt-3",
    patient_id: "pat-2",
    provider: "flutterwave",
    provider_reference: "MLK-FLW-552110",
    amount: 120000,
    currency: "UGX",
    status: "processing",
    phone: "+256786450441",
    metadata: { network: "mtn", charge_id: "chg_demo" },
    created_at: new Date("2026-05-12T08:20:00.000Z").toISOString(),
  },
];

export const demoNotifications: Notification[] = [
  {
    id: "not-1",
    tenant_id: demoTenant.id,
    user_id: null,
    patient_id: "pat-1",
    appointment_id: "apt-1",
    channel: "whatsapp",
    destination: "+256703222118",
    subject: "Appointment confirmed",
    body: "Your appointment with Dr. Sarah Namusoke is confirmed for today at 10:30.",
    status: "sent",
    created_at: new Date("2026-05-10T08:05:00.000Z").toISOString(),
  },
  {
    id: "not-2",
    tenant_id: demoTenant.id,
    user_id: null,
    patient_id: "pat-3",
    appointment_id: "apt-2",
    channel: "email",
    destination: "frontdesk@kampalacarehospital.ug",
    subject: "Pending payment reminder",
    body: "Brian Kato has a pending appointment payment.",
    status: "queued",
    created_at: new Date("2026-05-12T11:30:00.000Z").toISOString(),
  },
  {
    id: "not-3",
    tenant_id: demoTenant.id,
    user_id: null,
    patient_id: "pat-2",
    appointment_id: "apt-3",
    channel: "sms",
    destination: "+256786450441",
    subject: "Visit reminder",
    body: "Mary Akello has an appointment reminder queued by SMS.",
    status: "queued",
    created_at: new Date("2026-05-14T16:30:00.000Z").toISOString(),
  },
];

export const demoSubscriptions: Subscription[] = [
  {
    id: "sub-1",
    tenant_id: demoTenant.id,
    plan: "growth",
    status: "trialing",
    amount: 290000,
    currency: "UGX",
    current_period_end: new Date("2026-06-14T00:00:00.000Z").toISOString(),
  },
];

export const demoRevenue: RevenuePoint[] = [
  { month: "Jan", revenue: 3200000, appointments: 64 },
  { month: "Feb", revenue: 4100000, appointments: 79 },
  { month: "Mar", revenue: 4700000, appointments: 86 },
  { month: "Apr", revenue: 5250000, appointments: 93 },
  { month: "May", revenue: 6120000, appointments: 108 },
  { month: "Jun", revenue: 7040000, appointments: 124 },
];

export const demoDiagnoses: Diagnosis[] = [
  {
    id: "dx-1",
    tenant_id: demoTenant.id,
    patient_id: "pat-1",
    label: "Essential hypertension",
    status: "active",
    diagnosed_at: new Date("2026-02-02T09:20:00.000Z").toISOString(),
    notes: "Stable on medication, monitor monthly readings.",
  },
  {
    id: "dx-2",
    tenant_id: demoTenant.id,
    patient_id: "pat-2",
    label: "Intermittent asthma",
    status: "active",
    diagnosed_at: new Date("2026-03-15T10:00:00.000Z").toISOString(),
    notes: "Carry reliever inhaler and review triggers.",
  },
  {
    id: "dx-3",
    tenant_id: demoTenant.id,
    patient_id: "pat-3",
    label: "Routine pediatric immunization",
    status: "resolved",
    diagnosed_at: new Date("2026-04-08T12:30:00.000Z").toISOString(),
    notes: "Next review due in six months.",
  },
];

export const demoClinicalPrescriptions: ClinicalPrescription[] = [
  {
    id: "clin-rx-1",
    tenant_id: demoTenant.id,
    patient_id: "pat-1",
    medication: "Amlodipine 5mg",
    dosage: "One tablet daily for 30 days",
    status: "active",
    prescribed_by: "Dr. Sarah Namusoke",
    prescribed_at: new Date("2026-05-10T10:45:00.000Z").toISOString(),
  },
  {
    id: "clin-rx-2",
    tenant_id: demoTenant.id,
    patient_id: "pat-2",
    medication: "Artemether/Lumefantrine 20/120mg",
    dosage: "Four tablets twice daily for 3 days",
    status: "active",
    prescribed_by: "Dr. Peter Mwangi",
    prescribed_at: new Date("2026-05-12T09:40:00.000Z").toISOString(),
  },
  {
    id: "clin-rx-3",
    tenant_id: demoTenant.id,
    patient_id: "pat-3",
    medication: "Paracetamol suspension",
    dosage: "5ml every 8 hours for fever",
    status: "completed",
    prescribed_by: "Dr. Aisha Nakasujja",
    prescribed_at: new Date("2026-05-11T12:10:00.000Z").toISOString(),
  },
];

export const demoLabResults: LabResult[] = [
  {
    id: "lab-1",
    tenant_id: demoTenant.id,
    patient_id: "pat-1",
    test_name: "Full blood count",
    requested_by: "Dr. Sarah Namusoke",
    status: "completed",
    result_summary: "Normal white cell count, mild anemia noted.",
    report_url: null,
    requested_at: new Date("2026-05-10T11:00:00.000Z").toISOString(),
    completed_at: new Date("2026-05-10T14:10:00.000Z").toISOString(),
  },
  {
    id: "lab-2",
    tenant_id: demoTenant.id,
    patient_id: "pat-2",
    test_name: "Malaria rapid test",
    requested_by: "Dr. Peter Mwangi",
    status: "processing",
    result_summary: null,
    report_url: null,
    requested_at: new Date("2026-05-12T09:55:00.000Z").toISOString(),
    completed_at: null,
  },
  {
    id: "lab-3",
    tenant_id: demoTenant.id,
    patient_id: "pat-3",
    test_name: "Pediatric growth panel",
    requested_by: "Dr. Aisha Nakasujja",
    status: "requested",
    result_summary: null,
    report_url: null,
    requested_at: new Date("2026-05-15T08:30:00.000Z").toISOString(),
    completed_at: null,
  },
];

export const demoVisitRecords: VisitRecord[] = [
  {
    id: "visit-1",
    tenant_id: demoTenant.id,
    patient_id: "pat-1",
    doctor_name: "Dr. Sarah Namusoke",
    visit_type: "Follow-up",
    notes: "Blood pressure improving. Continue medicine and reduce salt intake.",
    visited_at: new Date("2026-05-10T10:30:00.000Z").toISOString(),
  },
  {
    id: "visit-2",
    tenant_id: demoTenant.id,
    patient_id: "pat-2",
    doctor_name: "Dr. Peter Mwangi",
    visit_type: "Malaria follow-up",
    notes: "Reviewed fever pattern and requested malaria rapid test.",
    visited_at: new Date("2026-05-12T09:00:00.000Z").toISOString(),
  },
  {
    id: "visit-3",
    tenant_id: demoTenant.id,
    patient_id: "pat-3",
    doctor_name: "Dr. Aisha Nakasujja",
    visit_type: "Pediatric review",
    notes: "Immunization review completed, caregiver counselled.",
    visited_at: new Date("2026-05-11T12:00:00.000Z").toISOString(),
  },
];

export const demoInvoices: Invoice[] = [
  {
    id: "inv-clinic-1",
    tenant_id: demoTenant.id,
    patient_id: "pat-1",
    invoice_number: "MLK-INV-1001",
    customer_name: "John Doe",
    amount: 65000,
    paid_amount: 65000,
    status: "paid",
    payer_type: "mobile_money",
    due_at: new Date("2026-05-10T18:00:00.000Z").toISOString(),
    created_at: new Date("2026-05-10T10:30:00.000Z").toISOString(),
  },
  {
    id: "inv-clinic-2",
    tenant_id: demoTenant.id,
    patient_id: "pat-2",
    invoice_number: "MLK-INV-1002",
    customer_name: "Mary Akello",
    amount: 120000,
    paid_amount: 40000,
    status: "issued",
    payer_type: "insurance",
    due_at: new Date("2026-05-20T18:00:00.000Z").toISOString(),
    created_at: new Date("2026-05-12T09:00:00.000Z").toISOString(),
  },
  {
    id: "inv-clinic-3",
    tenant_id: demoTenant.id,
    patient_id: "pat-3",
    invoice_number: "MLK-INV-1003",
    customer_name: "Brian Kato",
    amount: 80000,
    paid_amount: 0,
    status: "overdue",
    payer_type: "cash",
    due_at: new Date("2026-05-12T18:00:00.000Z").toISOString(),
    created_at: new Date("2026-05-11T12:00:00.000Z").toISOString(),
  },
];

export const demoBranches: Branch[] = [
  {
    id: "branch-1",
    tenant_id: demoTenant.id,
    name: "Kampala Care Main Hospital",
    region: "Kampala",
    manager: "Dr. Sarah Namusoke",
    patients_today: 38,
    revenue_month: 6120000,
    staff_online: 14,
    status: "active",
  },
  {
    id: "branch-2",
    tenant_id: demoTenant.id,
    name: "Outpatient Department",
    region: "Kampala",
    manager: "Grace Atim",
    patients_today: 19,
    revenue_month: 2840000,
    staff_online: 7,
    status: "active",
  },
  {
    id: "branch-3",
    tenant_id: demoTenant.id,
    name: "Pediatric Ward",
    region: "Central Uganda",
    manager: "Peter Mwangi",
    patients_today: 11,
    revenue_month: 1290000,
    staff_online: 3,
    status: "attention",
  },
];

export const demoPharmacyInventory: InventoryItem[] = [
  {
    id: "inv-1",
    tenant_id: demoPharmacyTenant.id,
    name: "Amoxicillin 500mg capsules",
    sku: "ACX-AMOX-500",
    category: "Antibiotics",
    stock_on_hand: 42,
    reorder_level: 60,
    unit_price: 12000,
    expiry_date: "2026-09-30",
    status: "low_stock",
  },
  {
    id: "inv-2",
    tenant_id: demoPharmacyTenant.id,
    name: "Paracetamol 500mg tablets",
    sku: "ACX-PARA-500",
    category: "Pain relief",
    stock_on_hand: 360,
    reorder_level: 120,
    unit_price: 4500,
    expiry_date: "2027-01-12",
    status: "in_stock",
  },
  {
    id: "inv-3",
    tenant_id: demoPharmacyTenant.id,
    name: "ORS sachets",
    sku: "ACX-ORS-20",
    category: "Hydration",
    stock_on_hand: 18,
    reorder_level: 50,
    unit_price: 2500,
    expiry_date: "2026-06-18",
    status: "expiring",
  },
  {
    id: "inv-4",
    tenant_id: demoPharmacyTenant.id,
    name: "Salbutamol inhaler",
    sku: "ACX-SALB-INH",
    category: "Respiratory",
    stock_on_hand: 0,
    reorder_level: 20,
    unit_price: 32000,
    expiry_date: "2027-03-01",
    status: "out_of_stock",
  },
];

export const demoPharmacyPatients: Patient[] = [
  {
    id: "rx-pat-1",
    tenant_id: demoPharmacyTenant.id,
    user_id: null,
    full_name: "Rebecca Namara",
    date_of_birth: "1988-08-18",
    sex: "female",
    phone: "+256 706 432 190",
    email: "rebecca.namara@example.com",
    national_id: null,
    medical_history: ["Repeat hypertension refill"],
    allergies: ["Sulfa"],
    emergency_contact: null,
    created_at: new Date("2026-05-12T08:00:00.000Z").toISOString(),
  },
  {
    id: "rx-pat-2",
    tenant_id: demoPharmacyTenant.id,
    user_id: null,
    full_name: "Patrick Wekesa",
    date_of_birth: "1977-12-04",
    sex: "male",
    phone: "+256 778 201 044",
    email: "patrick.wekesa@example.com",
    national_id: null,
    medical_history: ["Asthma medicine pickup"],
    allergies: [],
    emergency_contact: null,
    created_at: new Date("2026-05-13T08:00:00.000Z").toISOString(),
  },
];

export const demoPharmacyPrescriptions: PrescriptionOrder[] = [
  {
    id: "rx-1",
    tenant_id: demoPharmacyTenant.id,
    patient_name: "Rebecca Namara",
    prescriber: "Dr. Sarah Namusoke",
    medicine: "Amlodipine 5mg tablets",
    quantity: 30,
    status: "ready",
    total_amount: 42000,
    fulfillment_due: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 30).toISOString(),
    created_at: new Date("2026-05-14T08:15:00.000Z").toISOString(),
  },
  {
    id: "rx-2",
    tenant_id: demoPharmacyTenant.id,
    patient_name: "Patrick Wekesa",
    prescriber: "Jinja Children Hospital",
    medicine: "Salbutamol inhaler",
    quantity: 1,
    status: "dispensing",
    total_amount: 32000,
    fulfillment_due: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0).toISOString(),
    created_at: new Date("2026-05-14T09:20:00.000Z").toISOString(),
  },
  {
    id: "rx-3",
    tenant_id: demoPharmacyTenant.id,
    patient_name: "Amina Kato",
    prescriber: "Walk-in OTC",
    medicine: "Paracetamol 500mg tablets",
    quantity: 20,
    status: "collected",
    total_amount: 9000,
    fulfillment_due: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 13, 45).toISOString(),
    created_at: new Date("2026-05-13T11:20:00.000Z").toISOString(),
  },
];

export const demoPharmacyPayments: Payment[] = [
  {
    id: "rx-pay-1",
    tenant_id: demoPharmacyTenant.id,
    appointment_id: "rx-order-1",
    patient_id: "rx-pat-1",
    provider: "mtn_momo",
    provider_reference: "MLK-RX-MTN-220418",
    amount: 42000,
    currency: "UGX",
    status: "paid",
    phone: "+256706432190",
    metadata: { channel: "dispensary" },
    created_at: new Date("2026-05-14T08:22:00.000Z").toISOString(),
  },
  {
    id: "rx-pay-2",
    tenant_id: demoPharmacyTenant.id,
    appointment_id: "rx-order-2",
    patient_id: "rx-pat-2",
    provider: "airtel_money",
    provider_reference: "MLK-RX-AIR-442011",
    amount: 32000,
    currency: "UGX",
    status: "processing",
    phone: "+256778201044",
    metadata: { channel: "dispensary" },
    created_at: new Date("2026-05-14T09:28:00.000Z").toISOString(),
  },
];

export const demoPharmacyRevenue: RevenuePoint[] = [
  { month: "Jan", revenue: 2100000, appointments: 190 },
  { month: "Feb", revenue: 2650000, appointments: 224 },
  { month: "Mar", revenue: 2840000, appointments: 241 },
  { month: "Apr", revenue: 3320000, appointments: 278 },
  { month: "May", revenue: 3810000, appointments: 316 },
  { month: "Jun", revenue: 4260000, appointments: 352 },
];

export const demoPharmacyInvoices: Invoice[] = [
  {
    id: "rx-invoice-1",
    tenant_id: demoPharmacyTenant.id,
    patient_id: "rx-pat-1",
    invoice_number: "ACX-RX-2001",
    customer_name: "Rebecca Namara",
    amount: 42000,
    paid_amount: 42000,
    status: "paid",
    payer_type: "mobile_money",
    due_at: new Date("2026-05-14T18:00:00.000Z").toISOString(),
    created_at: new Date("2026-05-14T08:22:00.000Z").toISOString(),
  },
  {
    id: "rx-invoice-2",
    tenant_id: demoPharmacyTenant.id,
    patient_id: "rx-pat-2",
    invoice_number: "ACX-RX-2002",
    customer_name: "Patrick Wekesa",
    amount: 32000,
    paid_amount: 0,
    status: "issued",
    payer_type: "mobile_money",
    due_at: new Date("2026-05-15T18:00:00.000Z").toISOString(),
    created_at: new Date("2026-05-14T09:28:00.000Z").toISOString(),
  },
];

export const demoPharmacyBranches: Branch[] = [
  {
    id: "rx-branch-1",
    tenant_id: demoPharmacyTenant.id,
    name: "Acacia Mall Dispensary",
    region: "Kampala",
    manager: "Michael Ssewanyana",
    patients_today: 84,
    revenue_month: 4260000,
    staff_online: 6,
    status: "active",
  },
  {
    id: "rx-branch-2",
    tenant_id: demoPharmacyTenant.id,
    name: "Ntinda Pickup Point",
    region: "Kampala",
    manager: "Harriet Nambi",
    patients_today: 41,
    revenue_month: 1780000,
    staff_online: 3,
    status: "attention",
  },
];

export const demoPlatformTenants: Tenant[] = [
  demoTenant,
  demoJinjaTenant,
  {
    id: "44444444-4444-4444-8444-444444444444",
    tenant_kind: "clinic",
    name: "Nairobi East Medical Centre",
    slug: "nairobi-east-medical-centre",
    legal_name: "Nairobi East Medical Centre PLC",
    region: "Nairobi, Kenya",
    address: "Mombasa Road, Nairobi",
    phone: "+254 711 300 550",
    email: "ops@nairobi-east.co.ke",
    status: "past_due",
    subdomain: "nairobi-east",
    created_at: new Date("2025-09-22T08:00:00.000Z").toISOString(),
  },
  demoPharmacyTenant,
];

function attachAppointmentRelations(
  appointments: Appointment[],
  doctors: Doctor[],
  patients: Patient[],
) {
  return appointments.map((appointment) => ({
    ...appointment,
    doctor: doctors.find((doctor) => doctor.id === appointment.doctor_id),
    patient: patients.find((patient) => patient.id === appointment.patient_id),
  }));
}

function buildClinicDashboardData(
  tenant: Tenant,
  user: AppUser,
  workspace: "kampala" | "jinja",
): DashboardData {
  const doctors =
    workspace === "kampala"
      ? demoDoctors
      : demoDoctors.map((doctor, index) => ({
          ...doctor,
          id: `jinja-${doctor.id}`,
          tenant_id: tenant.id,
          full_name: ["Dr. Mary Akello", "Dr. Simon Ouma", "Dr. Linda Nabulime", "Dr. Isaac Waiswa"][index],
          specialization: ["Pediatrics", "Neonatal care", "Nutrition", "Emergency care"][index],
          room: `Ward ${index + 1}`,
        }));
  const patients =
    workspace === "kampala"
      ? demoPatients
      : demoPatients.map((patient, index) => ({
          ...patient,
          id: `jinja-${patient.id}`,
          tenant_id: tenant.id,
          full_name: ["Brian Mugisha", "Esther Nakato", "Samuel Otieno"][index],
          medical_history: [["Immunization catch-up"], ["Malaria review"], ["Nutrition follow-up"]][index],
        }));
  const appointments =
    workspace === "kampala"
      ? demoAppointments
      : demoAppointments.map((appointment, index) => ({
          ...appointment,
          id: `jinja-${appointment.id}`,
          tenant_id: tenant.id,
          doctor_id: doctors[index % doctors.length].id,
          patient_id: patients[index % patients.length].id,
          reason: ["Pediatric fever review", "Growth monitoring", "Follow-up consultation"][index],
        }));
  const payments =
    workspace === "kampala"
      ? demoPayments
      : demoPayments.map((payment, index) => ({
          ...payment,
          id: `jinja-${payment.id}`,
          tenant_id: tenant.id,
          appointment_id: appointments[index % appointments.length].id,
          patient_id: patients[index % patients.length].id,
          provider_reference: payment.provider_reference.replace("MLK-", "JINJA-"),
        }));
  const diagnoses =
    workspace === "kampala"
      ? demoDiagnoses
      : demoDiagnoses.map((diagnosis, index) => ({
          ...diagnosis,
          id: `jinja-${diagnosis.id}`,
          tenant_id: tenant.id,
          patient_id: patients[index % patients.length].id,
        }));
  const clinicalPrescriptions =
    workspace === "kampala"
      ? demoClinicalPrescriptions
      : demoClinicalPrescriptions.map((prescription, index) => ({
          ...prescription,
          id: `jinja-${prescription.id}`,
          tenant_id: tenant.id,
          patient_id: patients[index % patients.length].id,
          prescribed_by: doctors[index % doctors.length].full_name,
        }));
  const labResults =
    workspace === "kampala"
      ? demoLabResults
      : demoLabResults.map((result, index) => ({
          ...result,
          id: `jinja-${result.id}`,
          tenant_id: tenant.id,
          patient_id: patients[index % patients.length].id,
          requested_by: doctors[index % doctors.length].full_name,
          test_name: ["Malaria microscopy", "Hemoglobin", "Blood culture"][index],
        }));
  const visitRecords =
    workspace === "kampala"
      ? demoVisitRecords
      : demoVisitRecords.map((visit, index) => ({
          ...visit,
          id: `jinja-${visit.id}`,
          tenant_id: tenant.id,
          patient_id: patients[index % patients.length].id,
          doctor_name: doctors[index % doctors.length].full_name,
        }));
  const invoices =
    workspace === "kampala"
      ? demoInvoices
      : demoInvoices.map((invoice, index) => ({
          ...invoice,
          id: `jinja-${invoice.id}`,
          tenant_id: tenant.id,
          patient_id: patients[index % patients.length].id,
          invoice_number: invoice.invoice_number.replace("MLK-", "JINJA-"),
          customer_name: patients[index % patients.length].full_name,
        }));
  const branches =
    workspace === "kampala"
      ? demoBranches
      : demoBranches.map((branch, index) => ({
          ...branch,
          id: `jinja-${branch.id}`,
          tenant_id: tenant.id,
          name: ["Jinja Main Hospital", "Walukuba Clinic", "Njeru Outreach"][index],
          region: index === 0 ? "Jinja" : "Busoga",
          manager: ["Grace Namatovu", "Dr. Mary Akello", "Simon Ouma"][index],
        }));
  const paidRevenue = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const availableDoctors = doctors.filter((doctor) => doctor.status === "available").length;

  return {
    tenant,
    user,
    metrics: [
      {
        label: "Total patients",
        value: workspace === "kampala" ? "3,284" : "1,816",
        change: "+18% this quarter",
        tone: "blue",
      },
      {
        label: "Appointments today",
        value: String(appointments.length),
        change: "2 confirmed, 1 pending",
        tone: "green",
      },
      {
        label: "Collected revenue",
        value: formatUgandanCurrency(paidRevenue),
        change: "+24% vs last month",
        tone: "amber",
      },
      {
        label: "Doctor availability",
        value: `${availableDoctors}/${doctors.length}`,
        change: `${availableDoctors} doctors ready now`,
        tone: "rose",
      },
    ],
    doctors,
    patients,
    appointments: attachAppointmentRelations(appointments, doctors, patients),
    payments,
    notifications: demoNotifications,
    subscriptions: demoSubscriptions,
    revenue: demoRevenue,
    diagnoses,
    clinicalPrescriptions,
    labResults,
    visitRecords,
    invoices,
    branches,
    inventory: demoPharmacyInventory.map((item) => ({
      ...item,
      id: `${workspace}-${item.id}`,
      tenant_id: tenant.id,
    })),
    prescriptions: demoPharmacyPrescriptions.map((prescription) => ({
      ...prescription,
      id: `${workspace}-${prescription.id}`,
      tenant_id: tenant.id,
    })),
  };
}

function buildPharmacyDashboardData(): DashboardData {
  const paidRevenue = demoPharmacyPayments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const lowStock = demoPharmacyInventory.filter(
    (item) => item.status === "low_stock" || item.status === "out_of_stock",
  ).length;
  const payableAppointments: Appointment[] = demoPharmacyPrescriptions.map((prescription, index) => ({
    id: `rx-order-${index + 1}`,
    tenant_id: demoPharmacyTenant.id,
    doctor_id: demoDoctors[index % demoDoctors.length].id,
    patient_id: demoPharmacyPatients[index % demoPharmacyPatients.length].id,
    scheduled_at: prescription.fulfillment_due,
    duration_minutes: 15,
    status: prescription.status === "collected" ? "completed" : "pending",
    reason: `Prescription order: ${prescription.medicine}`,
    notes: prescription.prescriber,
    fee: prescription.total_amount,
    payment_status: prescription.status === "collected" ? "paid" : "pending",
    created_at: prescription.created_at,
  }));

  return {
    tenant: demoPharmacyTenant,
    user: demoPharmacyUser,
    metrics: [
      {
        label: "Active prescriptions",
        value: String(demoPharmacyPrescriptions.filter((item) => item.status !== "collected").length),
        change: "Dispensing queue",
        tone: "blue",
      },
      {
        label: "Low stock items",
        value: String(lowStock),
        change: "Needs reorder",
        tone: "amber",
      },
      {
        label: "Collected sales",
        value: formatUgandanCurrency(paidRevenue),
        change: "Paid pharmacy orders",
        tone: "green",
      },
      {
        label: "Ready pickups",
        value: String(demoPharmacyPrescriptions.filter((item) => item.status === "ready").length),
        change: "Customer notification ready",
        tone: "rose",
      },
    ],
    doctors: [],
    patients: demoPharmacyPatients,
    appointments: attachAppointmentRelations(payableAppointments, demoDoctors, demoPharmacyPatients),
    payments: demoPharmacyPayments,
    notifications: demoNotifications.map((notification) => ({
      ...notification,
      tenant_id: demoPharmacyTenant.id,
      subject: notification.subject.replace("Appointment", "Prescription"),
      body: notification.body.replace("appointment", "prescription order"),
    })),
    subscriptions: demoSubscriptions.map((subscription) => ({
      ...subscription,
      tenant_id: demoPharmacyTenant.id,
    })),
    revenue: demoPharmacyRevenue,
    diagnoses: [],
    clinicalPrescriptions: [],
    labResults: [],
    visitRecords: [],
    invoices: demoPharmacyInvoices,
    branches: demoPharmacyBranches,
    inventory: demoPharmacyInventory,
    prescriptions: demoPharmacyPrescriptions,
  };
}

export function buildDemoDashboardData(
  workspaceId: DemoWorkspaceId = defaultDemoWorkspaceId,
): DashboardData {
  if (workspaceId === "acacia-care-pharmacy") {
    return buildPharmacyDashboardData();
  }

  if (workspaceId === "jinja-children-hospital") {
    return buildClinicDashboardData(demoJinjaTenant, demoJinjaUser, "jinja");
  }

  return buildClinicDashboardData(demoTenant, demoUser, "kampala");
}
