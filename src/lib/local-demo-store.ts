import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DemoWorkspaceId } from "@/lib/demo-session";
import type {
  Appointment,
  AppUser,
  Branch,
  DailySale,
  DashboardData,
  Doctor,
  InventoryItem,
  Invoice,
  Notification,
  Patient,
  SalesShift,
  ShiftExpense,
  StaffInvitation,
  Tenant,
  TenantDocumentTemplate,
} from "@/lib/types";

type StoredAppointment = Appointment;
type StoredBranch = Branch;
type StoredDailySale = DailySale;
type StoredDoctor = Doctor;
type StoredInventoryItem = InventoryItem;
type StoredInvoice = Invoice;
type StoredNotification = Notification;
type StoredPatient = Patient;
type StoredSalesShift = SalesShift;
type StoredShiftExpense = ShiftExpense;
type StoredStaffInvitation = StaffInvitation;
type StoredStaffUser = AppUser;
type StoredDocumentTemplate = TenantDocumentTemplate & {
  content_base64: string;
};

interface WorkspaceState {
  patients: StoredPatient[];
  appointments: StoredAppointment[];
  branches: StoredBranch[];
  dailySales: StoredDailySale[];
  doctors: StoredDoctor[];
  inventory: StoredInventoryItem[];
  invoices: StoredInvoice[];
  salesShifts: StoredSalesShift[];
  shiftExpenses: StoredShiftExpense[];
  notifications: StoredNotification[];
  staffInvitations: StoredStaffInvitation[];
  staffUsers: StoredStaffUser[];
  documentTemplates: StoredDocumentTemplate[];
}

interface DemoState {
  workspaces: Partial<Record<DemoWorkspaceId, WorkspaceState>>;
}

const demoDir = path.join(process.cwd(), ".medilink-demo");
const stateFile = path.join(demoDir, "demo-state.json");

function emptyState(): DemoState {
  return { workspaces: {} };
}

function emptyWorkspace(): WorkspaceState {
  return {
    patients: [],
    appointments: [],
    branches: [],
    dailySales: [],
    doctors: [],
    inventory: [],
    invoices: [],
    salesShifts: [],
    shiftExpenses: [],
    notifications: [],
    staffInvitations: [],
    staffUsers: [],
    documentTemplates: [],
  };
}

function normalizeWorkspace(workspace: Partial<WorkspaceState> | undefined): WorkspaceState {
  return {
    ...emptyWorkspace(),
    ...(workspace ?? {}),
  };
}

async function readDemoState(): Promise<DemoState> {
  try {
    const file = await readFile(stateFile, "utf8");
    const parsed = JSON.parse(file) as DemoState;
    return parsed.workspaces ? parsed : emptyState();
  } catch {
    return emptyState();
  }
}

async function writeDemoState(state: DemoState) {
  await mkdir(demoDir, { recursive: true });
  await writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export async function getLocalDemoWorkspaceState(workspaceId: DemoWorkspaceId) {
  const state = await readDemoState();
  return normalizeWorkspace(state.workspaces[workspaceId]);
}

export async function saveLocalDemoAppointment({
  workspaceId,
  appointment,
}: {
  workspaceId: DemoWorkspaceId;
  appointment: Appointment;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);

  workspace.appointments = [
    ...workspace.appointments.filter((item) => item.id !== appointment.id),
    appointment,
  ];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return appointment;
}

export async function saveLocalDemoPatient({
  workspaceId,
  patient,
}: {
  workspaceId: DemoWorkspaceId;
  patient: Patient;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);
  const existingPatient = workspace.patients.find((item) => item.phone === patient.phone);
  const storedPatient = existingPatient ? { ...patient, id: existingPatient.id } : patient;

  workspace.patients = existingPatient
    ? workspace.patients.map((item) => (item.id === existingPatient.id ? storedPatient : item))
    : [...workspace.patients, storedPatient];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return storedPatient;
}

export async function saveLocalDemoBranch({
  workspaceId,
  branch,
}: {
  workspaceId: DemoWorkspaceId;
  branch: Branch;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);

  workspace.branches = [
    ...workspace.branches.filter((item) => item.id !== branch.id && item.name !== branch.name),
    branch,
  ];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return branch;
}

export async function saveLocalDemoDoctor({
  workspaceId,
  doctor,
}: {
  workspaceId: DemoWorkspaceId;
  doctor: Doctor;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);

  workspace.doctors = [
    ...workspace.doctors.filter((item) => item.id !== doctor.id && item.license_number !== doctor.license_number),
    doctor,
  ];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return doctor;
}

export async function saveLocalDemoInventoryItem({
  workspaceId,
  item,
}: {
  workspaceId: DemoWorkspaceId;
  item: InventoryItem;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);

  workspace.inventory = [
    ...workspace.inventory.filter((stored) => stored.id !== item.id && stored.sku !== item.sku),
    item,
  ];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return item;
}

export async function saveLocalDemoInvoice({
  workspaceId,
  invoice,
}: {
  workspaceId: DemoWorkspaceId;
  invoice: Invoice;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);

  workspace.invoices = [
    invoice,
    ...workspace.invoices.filter((item) => item.id !== invoice.id && item.invoice_number !== invoice.invoice_number),
  ];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return invoice;
}

export async function saveLocalDemoDailySale({
  workspaceId,
  sale,
}: {
  workspaceId: DemoWorkspaceId;
  sale: DailySale;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);

  workspace.dailySales = [
    sale,
    ...workspace.dailySales.filter((item) => item.id !== sale.id),
  ];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return sale;
}

export async function saveLocalDemoSalesShift({
  workspaceId,
  shift,
}: {
  workspaceId: DemoWorkspaceId;
  shift: SalesShift;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);

  workspace.salesShifts = [
    shift,
    ...workspace.salesShifts.filter((item) => item.id !== shift.id),
  ];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return shift;
}

export async function updateLocalDemoSalesShift({
  workspaceId,
  shiftId,
  patch,
}: {
  workspaceId: DemoWorkspaceId;
  shiftId: string;
  patch: Partial<SalesShift>;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);
  const existing = workspace.salesShifts.find((shift) => shift.id === shiftId);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updated_at: new Date().toISOString() };

  workspace.salesShifts = workspace.salesShifts.map((shift) =>
    shift.id === shiftId ? updated : shift,
  );
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return updated;
}

export async function saveLocalDemoNotification({
  workspaceId,
  notification,
}: {
  workspaceId: DemoWorkspaceId;
  notification: Notification;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);

  workspace.notifications = [
    notification,
    ...workspace.notifications.filter((item) => item.id !== notification.id),
  ];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return notification;
}

export async function getLocalDemoStaffDirectory(workspaceId: DemoWorkspaceId) {
  const workspace = await getLocalDemoWorkspaceState(workspaceId);

  return {
    invitations: workspace.staffInvitations,
    users: workspace.staffUsers,
  };
}

export async function getLocalDemoDocumentTemplates(workspaceId: DemoWorkspaceId) {
  const workspace = await getLocalDemoWorkspaceState(workspaceId);

  return workspace.documentTemplates.map(stripTemplateContent);
}

export async function getLocalDemoDocumentTemplate({
  workspaceId,
  templateId,
}: {
  workspaceId: DemoWorkspaceId;
  templateId: string;
}) {
  const workspace = await getLocalDemoWorkspaceState(workspaceId);

  return workspace.documentTemplates.find((template) => template.id === templateId) ?? null;
}

export async function saveLocalDemoDocumentTemplate({
  workspaceId,
  template,
}: {
  workspaceId: DemoWorkspaceId;
  template: StoredDocumentTemplate;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);

  workspace.documentTemplates = [
    template,
    ...workspace.documentTemplates.filter((item) => item.id !== template.id),
  ];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return stripTemplateContent(template);
}

export async function saveLocalDemoStaffMember({
  workspaceId,
  invitation,
  user,
}: {
  workspaceId: DemoWorkspaceId;
  invitation: StaffInvitation;
  user: AppUser;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);
  const normalizedEmail = user.email.toLowerCase();

  workspace.staffInvitations = [
    invitation,
    ...workspace.staffInvitations.filter(
      (item) => item.id !== invitation.id && item.email.toLowerCase() !== normalizedEmail,
    ),
  ];
  workspace.staffUsers = [
    user,
    ...workspace.staffUsers.filter(
      (item) => item.id !== user.id && item.email.toLowerCase() !== normalizedEmail,
    ),
  ];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return { invitation, user };
}

export async function saveLocalDemoPublicBooking({
  workspaceId,
  tenant,
  doctor,
  patientName,
  phone,
  email,
  sex,
  dateOfBirth,
  scheduledAt,
  durationMinutes,
  reason,
}: {
  workspaceId: DemoWorkspaceId;
  tenant: Tenant;
  doctor: Doctor;
  patientName: string;
  phone: string;
  email?: string;
  sex: Patient["sex"];
  dateOfBirth?: string;
  scheduledAt: string;
  durationMinutes: number;
  reason: string;
}) {
  const state = await readDemoState();
  const workspace = normalizeWorkspace(state.workspaces[workspaceId]);
  const now = new Date().toISOString();
  const existingPatient = workspace.patients.find((patient) => patient.phone === phone);
  const patient: Patient =
    existingPatient ??
    {
      id: `local-pat-${crypto.randomUUID()}`,
      tenant_id: tenant.id,
      user_id: null,
      full_name: patientName,
      date_of_birth: dateOfBirth ?? null,
      sex,
      phone,
      email: email ?? null,
      national_id: null,
      medical_history: ["Booked from public MediLink page"],
      allergies: [],
      emergency_contact: null,
      created_at: now,
    };

  const appointment: Appointment = {
    id: `local-apt-${crypto.randomUUID()}`,
    tenant_id: tenant.id,
    doctor_id: doctor.id,
    patient_id: patient.id,
    scheduled_at: scheduledAt,
    duration_minutes: durationMinutes,
    status: "pending",
    reason,
    notes: "Booked from the public MediLink booking page.",
    fee: doctor.consultation_fee,
    payment_status: "pending",
    created_at: now,
  };

  workspace.patients = existingPatient
    ? workspace.patients.map((item) => (item.id === existingPatient.id ? patient : item))
    : [...workspace.patients, patient];
  workspace.appointments = [...workspace.appointments, appointment];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return {
    patient,
    appointment,
    confirmationReference: `MLK-${appointment.id.slice(-8).toUpperCase()}`,
  };
}

export async function hydrateLocalDemoDashboardData(
  data: DashboardData,
  workspaceId: DemoWorkspaceId,
): Promise<DashboardData> {
  const workspace = await getLocalDemoWorkspaceState(workspaceId);
  const patients = mergeById(data.patients, workspace.patients);
  const doctors = mergeById(data.doctors, workspace.doctors);
  const appointments = mergeById(data.appointments, workspace.appointments)
    .map((appointment) => attachRelations(appointment, doctors, patients))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const branches = mergeById(data.branches, workspace.branches);
  const inventory = mergeById(data.inventory, workspace.inventory);
  const invoices = mergeById(data.invoices, workspace.invoices);
  const salesShifts = mergeById(data.salesShifts, workspace.salesShifts).sort(
    (a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime(),
  );
  const shiftExpenses = mergeById(data.shiftExpenses, workspace.shiftExpenses).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const dailySales = mergeById(data.dailySales, workspace.dailySales).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const notifications = mergeById(data.notifications, workspace.notifications).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return {
    ...data,
    patients,
    appointments,
    branches,
    doctors,
    inventory,
    invoices,
    salesShifts,
    shiftExpenses,
    dailySales,
    notifications,
    metrics: data.metrics.map((metric) =>
      metric.label.toLowerCase().includes("appointment")
        ? {
            ...metric,
            value: String(appointments.length),
            change: `${appointments.filter((item) => item.status === "pending").length} pending requests`,
          }
        : metric.label.toLowerCase().includes("patient")
          ? {
              ...metric,
              value: String(patients.length),
              change: `${workspace.patients.length} local demo signups`,
            }
          : metric,
    ),
  };
}

function mergeById<T extends { id: string }>(base: T[], added: T[]) {
  const merged = new Map<string, T>();
  for (const item of base) merged.set(item.id, item);
  for (const item of added) merged.set(item.id, item);
  return Array.from(merged.values());
}

function attachRelations(appointment: Appointment, doctors: Doctor[], patients: Patient[]): Appointment {
  return {
    ...appointment,
    doctor: appointment.doctor ?? doctors.find((doctor) => doctor.id === appointment.doctor_id),
    patient: appointment.patient ?? patients.find((patient) => patient.id === appointment.patient_id),
  };
}

function stripTemplateContent(template: StoredDocumentTemplate): TenantDocumentTemplate {
  return {
    id: template.id,
    tenant_id: template.tenant_id,
    name: template.name,
    file_name: template.file_name,
    content_type: template.content_type,
    size_bytes: template.size_bytes,
    storage_path: template.storage_path,
    created_by: template.created_by,
    created_at: template.created_at,
    updated_at: template.updated_at,
  };
}
