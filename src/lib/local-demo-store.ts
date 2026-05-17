import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { DemoWorkspaceId } from "@/lib/demo-session";
import type { Appointment, DashboardData, Doctor, Patient, Tenant } from "@/lib/types";

type StoredAppointment = Appointment;
type StoredPatient = Patient;

interface WorkspaceState {
  patients: StoredPatient[];
  appointments: StoredAppointment[];
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
  return { patients: [], appointments: [] };
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
  return state.workspaces[workspaceId] ?? emptyWorkspace();
}

export async function saveLocalDemoAppointment({
  workspaceId,
  appointment,
}: {
  workspaceId: DemoWorkspaceId;
  appointment: Appointment;
}) {
  const state = await readDemoState();
  const workspace = state.workspaces[workspaceId] ?? emptyWorkspace();

  workspace.appointments = [
    ...workspace.appointments.filter((item) => item.id !== appointment.id),
    appointment,
  ];
  state.workspaces[workspaceId] = workspace;
  await writeDemoState(state);

  return appointment;
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
  const workspace = state.workspaces[workspaceId] ?? emptyWorkspace();
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
  const appointments = mergeById(data.appointments, workspace.appointments)
    .map((appointment) => attachRelations(appointment, data.doctors, patients))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  return {
    ...data,
    patients,
    appointments,
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
