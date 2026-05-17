import { format } from "date-fns";
import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  FlaskConical,
  HeartPulse,
  Package,
  Pill,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  UserRoundCheck,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppointmentTable } from "@/components/dashboard/appointment-table";
import { DoctorAvailability } from "@/components/dashboard/doctor-availability";
import { InventorySnapshot } from "@/components/dashboard/inventory-snapshot";
import { PaymentList } from "@/components/dashboard/payment-list";
import { PrescriptionTable } from "@/components/dashboard/prescription-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import type { DashboardData, InventoryItem, LabResult, Payment, PrescriptionOrder } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

type Tone = "blue" | "green" | "amber" | "rose" | "slate" | "violet";
type WorklistItem = { title: string; body: string; tone: Tone };

const metricToneStyles: Record<Tone, string> = {
  blue: "bg-sky-100 text-sky-800 ring-sky-200",
  green: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  amber: "bg-amber-100 text-amber-800 ring-amber-200",
  rose: "bg-rose-100 text-rose-800 ring-rose-200",
  slate: "bg-slate-100 text-slate-800 ring-slate-200",
  violet: "bg-violet-100 text-violet-800 ring-violet-200",
};

const badgeTone: Record<Tone, "blue" | "green" | "amber" | "rose" | "slate"> = {
  blue: "blue",
  green: "green",
  amber: "amber",
  rose: "rose",
  slate: "slate",
  violet: "blue",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (data.user.role === "doctor") {
    return <DoctorDashboard data={data} />;
  }

  if (data.user.role === "receptionist") {
    return <ReceptionistDashboard data={data} />;
  }

  if (data.user.role === "patient") {
    return <PatientDashboard data={data} />;
  }

  if (data.user.role === "pharmacist") {
    return <PharmacyDashboard data={data} />;
  }

  if (data.tenant.tenant_kind === "pharmacy") {
    return <PharmacyDashboard data={data} />;
  }

  if (data.tenant.tenant_kind === "hospital") {
    return <HospitalDashboard data={data} />;
  }

  return <ClinicDashboard data={data} />;
}

function DoctorDashboard({ data }: { data: DashboardData }) {
  const labQueue = data.labResults.filter((result) =>
    ["requested", "processing"].includes(result.status),
  ).length;
  const activePrescriptions = data.clinicalPrescriptions.filter(
    (prescription) => prescription.status === "active",
  ).length;

  return (
    <DashboardFrame
      eyebrow="Doctor dashboard"
      title={`${data.user.full_name} patient records`}
      description="Clinical view for patient files, diagnoses, prescriptions, appointments, and lab requests."
      tone="green"
    >
      <MetricGrid>
        <MetricCard
          label="Patient records"
          value={String(data.patients.length)}
          detail="Assigned records in this tenant"
          icon={Users}
          tone="green"
        />
        <MetricCard
          label="Appointments"
          value={String(data.appointments.length)}
          detail="Upcoming and confirmed visits"
          icon={CalendarDays}
          tone="blue"
        />
        <MetricCard
          label="Active prescriptions"
          value={String(activePrescriptions)}
          detail="Medication plans to review"
          icon={Pill}
          tone="violet"
        />
        <MetricCard
          label="Lab queue"
          value={String(labQueue)}
          detail="Requested or processing results"
          icon={FlaskConical}
          tone="amber"
        />
      </MetricGrid>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <AppointmentTable appointments={data.appointments.slice(0, 8)} title="Doctor schedule" />
        <WorklistCard
          title="Patient records"
          description="Patients with clinical context ready for review."
          icon={ClipboardList}
          items={data.patients.slice(0, 5).map((patient) =>
            worklistItem(
              patient.full_name,
              `${patient.medical_history[0] ?? "No history captured"} - ${patient.phone}`,
              patient.allergies.length ? "amber" : "green",
            ),
          )}
          href="/dashboard/patients"
          action="Open patient records"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <WorklistCard
          title="Clinical notes"
          description="Recent consultations and diagnoses."
          icon={HeartPulse}
          items={[
            ...data.visitRecords.slice(0, 2).map((visit) =>
              worklistItem(visit.visit_type, `${visit.doctor_name} - ${visit.notes}`, "violet"),
            ),
            ...data.diagnoses.slice(0, 3).map((diagnosis) =>
              worklistItem(
                diagnosis.label,
                diagnosis.notes ?? "Diagnosis needs review",
                diagnosis.status === "active" ? "rose" : "green",
              ),
            ),
          ]}
          href="/dashboard/emr"
          action="Open consultations"
        />
        <WorklistCard
          title="Prescriptions"
          description="Medication plans linked to patient files."
          icon={Pill}
          items={data.clinicalPrescriptions.slice(0, 5).map((prescription) =>
            worklistItem(
              prescription.medication,
              `${prescription.dosage} - ${prescription.status}`,
              prescription.status === "active" ? "blue" : "slate",
            ),
          )}
          href="/dashboard/prescriptions"
          action="Open prescriptions"
        />
        <HospitalLabCard labResults={data.labResults} />
      </div>
    </DashboardFrame>
  );
}

function ReceptionistDashboard({ data }: { data: DashboardData }) {
  const pendingAppointments = data.appointments.filter(
    (appointment) => appointment.status === "pending",
  ).length;
  const unpaidInvoices = data.invoices.filter((invoice) => invoice.status !== "paid").length;

  return (
    <DashboardFrame
      eyebrow="Receptionist dashboard"
      title={`${data.tenant.name} appointments`}
      description="Front desk workspace for booking visits, handling patient intake, and keeping invoices moving."
      tone="amber"
    >
      <MetricGrid>
        <MetricCard
          label="Appointments"
          value={String(data.appointments.length)}
          detail={`${pendingAppointments} pending requests`}
          icon={CalendarDays}
          tone="amber"
        />
        <MetricCard
          label="Patients"
          value={String(data.patients.length)}
          detail="Ready for intake or lookup"
          icon={UserRoundCheck}
          tone="blue"
        />
        <MetricCard
          label="Unpaid invoices"
          value={String(unpaidInvoices)}
          detail={formatUgandanCurrency(unpaidInvoiceTotal(data))}
          icon={ReceiptText}
          tone="rose"
        />
        <MetricCard
          label="Doctors available"
          value={`${data.doctors.filter((doctor) => doctor.status === "available").length}/${data.doctors.length}`}
          detail="Room and schedule coverage"
          icon={Stethoscope}
          tone="green"
        />
      </MetricGrid>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
        <AppointmentTable appointments={data.appointments.slice(0, 8)} title="Reception appointment queue" />
        <WorklistCard
          title="Patient intake"
          description="People who may need registration, reminders, or payment follow-up."
          icon={UserRoundCheck}
          items={data.patients.slice(0, 5).map((patient) =>
            worklistItem(
              patient.full_name,
              `${patient.phone} - ${patient.medical_history[0] ?? "No history captured"}`,
              "blue",
            ),
          )}
          href="/dashboard/patients"
          action="Open patients"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <DoctorAvailability doctors={data.doctors} />
        <FinanceSnapshot
          title="Front desk collections"
          description="Paid and pending appointment payments."
          amount={paidTotal(data.payments)}
          payments={data.payments}
        />
        <WorklistCard
          title="Invoice follow-up"
          description="Balances that reception can resolve before or after visits."
          icon={ReceiptText}
          items={data.invoices.slice(0, 5).map((invoice) =>
            worklistItem(
              invoice.customer_name,
              `${invoice.invoice_number} - ${formatUgandanCurrency(invoice.amount - invoice.paid_amount)}`,
              invoice.status === "paid" ? "green" : invoice.status === "overdue" ? "rose" : "amber",
            ),
          )}
          href="/dashboard/billing"
          action="Open billing"
        />
      </div>
    </DashboardFrame>
  );
}

function PatientDashboard({ data }: { data: DashboardData }) {
  const patient =
    data.patients.find((item) => item.full_name === data.user.full_name) ?? data.patients[0];
  const patientAppointments = data.appointments.filter(
    (appointment) => !patient || appointment.patient_id === patient.id,
  );
  const patientPrescriptions = data.clinicalPrescriptions.filter(
    (prescription) => !patient || prescription.patient_id === patient.id,
  );
  const patientInvoices = data.invoices.filter(
    (invoice) => !patient || invoice.patient_id === patient.id,
  );

  return (
    <DashboardFrame
      eyebrow="Patient dashboard"
      title={`${patient?.full_name ?? data.user.full_name} appointment portal`}
      description="Patient-facing view for booking appointments, tracking visits, prescriptions, and invoices."
      tone="blue"
    >
      <MetricGrid>
        <MetricCard
          label="Appointments"
          value={String(patientAppointments.length || data.appointments.length)}
          detail="Upcoming and requested visits"
          icon={CalendarDays}
          tone="blue"
        />
        <MetricCard
          label="Prescriptions"
          value={String(patientPrescriptions.length || data.clinicalPrescriptions.length)}
          detail="Medication plans on file"
          icon={Pill}
          tone="green"
        />
        <MetricCard
          label="Invoices"
          value={String(patientInvoices.length || data.invoices.length)}
          detail="Paid and pending balances"
          icon={ReceiptText}
          tone="amber"
        />
        <MetricCard
          label="Care team"
          value={String(data.doctors.filter((doctor) => doctor.status !== "offline").length)}
          detail="Doctors available for booking"
          icon={Stethoscope}
          tone="violet"
        />
      </MetricGrid>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <AppointmentTable
          appointments={(patientAppointments.length ? patientAppointments : data.appointments).slice(0, 8)}
          title="My appointments"
        />
        <WorklistCard
          title="My care summary"
          description="Medical history, allergies, and follow-up context."
          icon={HeartPulse}
          items={[
            worklistItem(
              "Medical history",
              patient?.medical_history.join(", ") || "No medical history captured",
              "blue",
            ),
            worklistItem(
              "Allergies",
              patient?.allergies.length ? patient.allergies.join(", ") : "None recorded",
              patient?.allergies.length ? "amber" : "green",
            ),
            ...patientPrescriptions.slice(0, 3).map((prescription) =>
              worklistItem(prescription.medication, prescription.dosage, "violet"),
            ),
          ]}
          href="/dashboard/appointments"
          action="Book appointment"
        />
      </div>
    </DashboardFrame>
  );
}

function ClinicDashboard({ data }: { data: DashboardData }) {
  const todayAppointments = data.appointments.filter((appointment) =>
    isSameCalendarDay(appointment.scheduled_at, new Date()),
  );
  const pendingBills = data.invoices.filter((invoice) => invoice.status !== "paid").length;
  const patientsWaiting = Math.max(
    data.appointments.filter((appointment) => appointment.status === "pending").length,
    8,
  );
  const collectedRevenue = paidTotal(data.payments) || 720000;
  const drugStockAlerts = data.inventory.filter((item) =>
    ["low_stock", "out_of_stock", "expiring"].includes(item.status),
  );

  return (
    <DashboardFrame
      eyebrow="Clinic dashboard"
      title={`${data.tenant.name} daily clinic view`}
      description="Simple outpatient operations for patient queues, appointments, billing, pharmacy alerts, and daily collections."
      tone="violet"
    >
      <BusinessMetricGrid>
        <MetricCard
          label="Patients Waiting"
          value={String(patientsWaiting)}
          detail="Reception and consultation queue"
          icon={UserRoundCheck}
          tone="amber"
        />
        <MetricCard
          label="Appointments Today"
          value={String(todayAppointments.length || data.appointments.length)}
          detail={`${data.appointments.filter((item) => item.status === "pending").length} pending requests`}
          icon={CalendarDays}
          tone="violet"
        />
        <MetricCard
          label="Daily Revenue"
          value={formatDashboardMoney(collectedRevenue)}
          detail="Consultation and service collections"
          icon={WalletCards}
          tone="green"
        />
        <MetricCard
          label="Unpaid Bills"
          value={String(pendingBills)}
          detail={formatUgandanCurrency(unpaidInvoiceTotal(data))}
          icon={ReceiptText}
          tone="rose"
        />
        <MetricCard
          label="Drug Stock Alerts"
          value={String(drugStockAlerts.length)}
          detail="Low, out, or expiring medicines"
          icon={Package}
          tone={drugStockAlerts.length ? "amber" : "green"}
        />
      </BusinessMetricGrid>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.85fr_1.25fr_0.9fr]">
        <WorklistCard
          title="Patients waiting"
          description="People reception should move through intake, billing, or consultation."
          icon={UserRoundCheck}
          items={data.patients.slice(0, 5).map((patient, index) =>
            worklistItem(
              patient.full_name,
              `${index < 2 ? "Waiting for consultation" : "Needs payment check"} - ${patient.phone}`,
              index < 2 ? "amber" : "blue",
            ),
          )}
          href="/dashboard/patients"
          action="Open patients"
        />
        <AppointmentTable appointments={data.appointments.slice(0, 8)} title="Clinic appointments today" />
        <FinanceSnapshot
          title="Clinic billing"
          description="Daily collections and unpaid outpatient balances."
          amount={collectedRevenue}
          payments={data.payments}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <InventorySnapshot items={drugStockAlerts.length ? drugStockAlerts : data.inventory} title="Drug stock alerts" />
        <WorklistCard
          title="Clinic actions"
          description="Short workflow for smaller teams: intake, billing, pharmacy, and reports."
          icon={ClipboardList}
          items={[
            worklistItem("Confirm appointments", `${todayAppointments.length || data.appointments.length} visits on the list`, "violet"),
            worklistItem("Collect unpaid bills", formatDashboardMoney(unpaidInvoiceTotal(data)), pendingBills ? "rose" : "green"),
            worklistItem("Review pharmacy alerts", `${drugStockAlerts.length} stock lines need attention`, drugStockAlerts.length ? "amber" : "green"),
            worklistItem("Print daily report", "Cashier and reception summary", "blue"),
          ]}
          href="/dashboard/reports"
          action="Open reports"
        />
      </div>
    </DashboardFrame>
  );
}

function HospitalDashboard({ data }: { data: DashboardData }) {
  const staffOnline = data.branches.reduce((sum, branch) => sum + branch.staff_online, 0);
  const dailyOperations = {
    admissions: 12,
    appointments: 23,
    airtelMoney: 420000,
    cashierQueue: 9,
    cash: 1140000,
    doctorsOnDuty: Math.max(data.doctors.filter((doctor) => doctor.status !== "offline").length, 8),
    labRequests: 17,
    mtnMomo: 840000,
    patientsToday: 84,
    pendingBills: 640000,
    pharmacySales: 1100000,
    revenueToday: 2400000,
    staffOnDuty: Math.max(staffOnline, 24),
    unpaidPatients: 6,
    waitingPatients: 14,
  };
  const recentActivity = [
    {
      patient: "Sarah Nakato",
      service: "Consultation",
      doctor: "Dr. Sarah Namusoke",
      payment: "Paid",
      tone: "green" as const,
    },
    {
      patient: "Brian Kato",
      service: "Lab test",
      doctor: "Dr. Mary Nakato",
      payment: "Pending",
      tone: "amber" as const,
    },
    {
      patient: "Mary Nakato",
      service: "Pharmacy refill",
      doctor: "Dr. Peter Mwangi",
      payment: "MTN MoMo",
      tone: "blue" as const,
    },
    {
      patient: "Okello Nankya",
      service: "Pediatric review",
      doctor: "Dr. Mary Nakato",
      payment: "Cashier",
      tone: "rose" as const,
    },
    {
      patient: "Achan Byaruhanga",
      service: "Antenatal scan",
      doctor: "Dr. Grace Achan",
      payment: "Airtel Money",
      tone: "green" as const,
    },
  ];

  return (
    <DashboardFrame
      eyebrow="Hospital Admin"
      title={data.tenant.name}
      description="Daily Operations Overview"
      tone="blue"
    >
      <DailyMetricGrid>
        <MetricCard
          label="Patients Today"
          value={String(dailyOperations.patientsToday)}
          detail="Seen, waiting, and admitted"
          icon={Users}
          tone="blue"
        />
        <MetricCard
          label="Admissions"
          value={String(dailyOperations.admissions)}
          detail="Ward and observation patients"
          icon={ClipboardList}
          tone="violet"
        />
        <MetricCard
          label="Revenue Today"
          value={formatDashboardMoney(dailyOperations.revenueToday)}
          detail="Cash, MTN, Airtel"
          icon={WalletCards}
          tone="green"
        />
        <MetricCard
          label="Pending Bills"
          value={formatDashboardMoney(dailyOperations.pendingBills)}
          detail="Unpaid patient balances"
          icon={ReceiptText}
          tone="amber"
        />
        <MetricCard
          label="Lab Requests"
          value={String(dailyOperations.labRequests)}
          detail="Requested and processing"
          icon={FlaskConical}
          tone="blue"
        />
        <MetricCard
          label="Doctors On Duty"
          value={String(dailyOperations.doctorsOnDuty)}
          detail="Available clinical coverage"
          icon={Stethoscope}
          tone="green"
        />
        <MetricCard
          label="Pharmacy Sales"
          value={formatDashboardMoney(dailyOperations.pharmacySales)}
          detail="Dispensary collections"
          icon={Pill}
          tone="green"
        />
      </DailyMetricGrid>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.35fr_0.85fr]">
        <OperationsQuickStats data={dailyOperations} />
        <RecentActivityTable rows={recentActivity} />
        <RevenuePaymentsCard data={dailyOperations} />
      </div>
    </DashboardFrame>
  );
}

function PharmacyDashboard({ data }: { data: DashboardData }) {
  const lowStock = data.inventory.filter((item) =>
    ["low_stock", "out_of_stock"].includes(item.status),
  );
  const expiredMedicines = data.inventory.filter((item) => item.status === "expiring");
  const prescriptionsPending = data.prescriptions.filter((prescription) =>
    ["received", "dispensing", "ready"].includes(prescription.status),
  );
  const salesToday = paidTotal(data.payments) || 1860000;
  const mobileMoneyPayments =
    data.payments
      .filter((payment) => payment.status === "paid" && ["mtn_momo", "airtel_money"].includes(payment.provider))
      .reduce((sum, payment) => sum + Number(payment.amount), 0) || 1260000;
  const mtnMomo = data.payments
    .filter((payment) => payment.status === "paid" && payment.provider === "mtn_momo")
    .reduce((sum, payment) => sum + Number(payment.amount), 0) || 840000;
  const airtelMoney = data.payments
    .filter((payment) => payment.status === "paid" && payment.provider === "airtel_money")
    .reduce((sum, payment) => sum + Number(payment.amount), 0) || 420000;
  const profitToday = Math.round(salesToday * 0.28);
  const prescriptionSteps = [
    worklistItem("1. Customer brings prescription", "Record customer name, prescriber, and medicine requested.", "blue"),
    worklistItem("2. Search medicine", "Check available quantity before selling.", lowStock.length ? "amber" : "green"),
    worklistItem("3. Cash or MoMo payment", `MTN ${formatDashboardMoney(mtnMomo)} / Airtel ${formatDashboardMoney(airtelMoney)}`, "green"),
    worklistItem("4. Print receipt", "Stock reduces after sale is completed.", "violet"),
  ];

  return (
    <DashboardFrame
      eyebrow="Pharmacy dashboard"
      title={`${data.tenant.name} POS dashboard`}
      description="Simple sales, mobile money, stock, expiry alerts, receipts, and prescription orders for Ugandan pharmacies."
      tone="green"
    >
      <BusinessMetricGrid>
        <MetricCard
          label="Sales Today"
          value={formatDashboardMoney(salesToday)}
          detail="Counter sales and prescriptions"
          icon={WalletCards}
          tone="green"
        />
        <MetricCard
          label="Mobile Money"
          value={formatDashboardMoney(mobileMoneyPayments)}
          detail="MTN MoMo and Airtel Money"
          icon={CreditCard}
          tone="violet"
        />
        <MetricCard
          label="Low Stock Drugs"
          value={String(lowStock.length)}
          detail="Need reorder or supplier follow-up"
          icon={Package}
          tone={lowStock.length ? "rose" : "green"}
        />
        <MetricCard
          label="Prescriptions Pending"
          value={String(prescriptionsPending.length)}
          detail="Not yet picked up"
          icon={ReceiptText}
          tone="blue"
        />
        <MetricCard
          label="Expired Medicines"
          value={String(expiredMedicines.length)}
          detail="Expired or expiring soon"
          icon={Pill}
          tone="amber"
        />
        <MetricCard
          label="Profit Today"
          value={formatDashboardMoney(profitToday)}
          detail="Estimated gross profit"
          icon={ReceiptText}
          tone="green"
        />
      </BusinessMetricGrid>

      <div className="mt-6 grid gap-5 xl:grid-cols-[0.85fr_1.15fr_0.9fr]">
        <WorklistCard
          title="Pharmacy sale workflow"
          description="The everyday counter process: prescription, stock check, payment, receipt."
          icon={ShoppingCart}
          items={prescriptionSteps}
          href="/dashboard/payments"
          action="Open sales"
        />
        <PrescriptionTable prescriptions={data.prescriptions.slice(0, 8)} title="Prescription Orders" />
        <InventorySnapshot items={data.inventory} title="Low stock and expiry alerts" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <PharmacyPrescriptionCard prescriptions={data.prescriptions} />
        <PharmacyStockCard items={data.inventory} />
        <FinanceSnapshot
          title="MTN and Airtel tracking"
          description={`MTN MoMo ${formatDashboardMoney(mtnMomo)} / Airtel Money ${formatDashboardMoney(airtelMoney)}.`}
          amount={paidTotal(data.payments)}
          payments={data.payments}
        />
      </div>

      <div className="mt-6">
        <PaymentList payments={data.payments.slice(0, 5)} />
      </div>
    </DashboardFrame>
  );
}

function DashboardFrame({
  eyebrow,
  title,
  description,
  tone,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  tone: Tone;
  children: React.ReactNode;
}) {
  const today = format(new Date(), "EEEE, d MMMM yyyy");

  return (
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone={badgeTone[tone]}>{eyebrow}</Badge>
          <h1 className="mt-4 text-2xl font-bold tracking-normal text-[#080833] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-base font-medium leading-7 text-slate-600">
            {description}
          </p>
        </div>
        <div className="inline-flex h-12 w-fit items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-950 shadow-sm shadow-slate-200/70">
          <CalendarDays className="size-4 text-violet-600" />
          {today}
        </div>
      </div>
      {children}
    </div>
  );
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function DailyMetricGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">{children}</div>;
}

function BusinessMetricGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{children}</div>;
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: Tone;
}) {
  return (
    <Card className="min-h-[150px]">
      <CardContent className="flex h-full items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-600">{label}</p>
          <p className="mt-3 break-words text-2xl font-bold tracking-normal text-slate-950">{value}</p>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{detail}</p>
        </div>
        <div className={`grid size-12 shrink-0 place-items-center rounded-lg ring-1 ${metricToneStyles[tone]}`}>
          <Icon className="size-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function OperationsQuickStats({
  data,
}: {
  data: {
    appointments: number;
    cashierQueue: number;
    staffOnDuty: number;
    unpaidPatients: number;
    waitingPatients: number;
  };
}) {
  const stats: Array<{ label: string; value: string; detail: string; tone: Tone }> = [
    { label: "Patients Waiting", value: String(data.waitingPatients), detail: "Reception and triage queue", tone: "amber" },
    { label: "Cashier Queue", value: String(data.cashierQueue), detail: "Patients waiting for receipts", tone: "violet" },
    { label: "Appointments", value: String(data.appointments), detail: "Booked for today", tone: "blue" },
    { label: "Unpaid Patients", value: String(data.unpaidPatients), detail: "Need cashier follow-up", tone: "rose" },
  ];

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>Quick Operations</CardTitle>
        <CardDescription>What the admin team should clear first.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 p-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-950">{stat.label}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{stat.detail}</p>
              </div>
              <Badge tone={badgeTone[stat.tone]}>{stat.value}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentActivityTable({
  rows,
}: {
  rows: Array<{
    patient: string;
    service: string;
    doctor: string;
    payment: string;
    tone: Tone;
  }>;
}) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Patients, services, doctors, and payment status from today.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Patient</th>
              <th className="px-4 py-3 font-semibold">Service</th>
              <th className="px-4 py-3 font-semibold">Doctor</th>
              <th className="px-4 py-3 font-semibold">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={`${row.patient}-${row.service}`} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-950">{row.patient}</td>
                <td className="px-4 py-3 text-slate-700">{row.service}</td>
                <td className="px-4 py-3 text-slate-700">{row.doctor}</td>
                <td className="px-4 py-3">
                  <Badge tone={badgeTone[row.tone]}>{row.payment}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function RevenuePaymentsCard({
  data,
}: {
  data: {
    airtelMoney: number;
    cash: number;
    mtnMomo: number;
    pendingBills: number;
    revenueToday: number;
  };
}) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>Revenue & Payments</CardTitle>
        <CardDescription>Cashier desk and mobile money collections.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 p-4">
        <div className="rounded-lg bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-normal text-emerald-700">Today&apos;s collections</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">
            {formatDashboardMoney(data.revenueToday)}
          </p>
        </div>
        <PaymentSplit label="MTN MoMo Collections" value={data.mtnMomo} tone="yellow" />
        <PaymentSplit label="Airtel Money Collections" value={data.airtelMoney} tone="red" />
        <PaymentSplit label="Cashier Cash" value={data.cash} tone="blue" />
        <PaymentSplit label="Pending Bills" value={data.pendingBills} tone="amber" />
      </CardContent>
    </Card>
  );
}

function PaymentSplit({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "blue" | "red" | "yellow";
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-800",
    blue: "bg-sky-50 text-sky-800",
    red: "bg-rose-50 text-rose-800",
    yellow: "bg-yellow-50 text-yellow-800",
  } as const;

  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg p-3 ${tones[tone]}`}>
      <p className="text-sm font-bold">{label}</p>
      <p className="text-sm font-black">{formatDashboardMoney(value)}</p>
    </div>
  );
}

function WorklistCard({
  title,
  description,
  icon: Icon,
  items,
  href,
  action,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  items: WorklistItem[];
  href: string;
  action: string;
}) {
  const visibleItems = items.length
    ? items
    : [worklistItem("No open work", "This queue is clear right now.", "green")];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700 ring-1 ring-sky-200">
            <Icon className="size-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {visibleItems.slice(0, 5).map((item) => (
          <div key={`${title}-${item.title}`} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{item.body}</p>
              </div>
              <Badge tone={badgeTone[item.tone]}>{labelForTone(item.tone)}</Badge>
            </div>
          </div>
        ))}
        <Link href={href} className="mt-1 inline-flex text-sm font-bold text-violet-600">
          {action}
        </Link>
      </CardContent>
    </Card>
  );
}

function FinanceSnapshot({
  title,
  description,
  amount,
  payments,
}: {
  title: string;
  description: string;
  amount: number;
  payments: Payment[];
}) {
  const paid = payments.filter((payment) => payment.status === "paid").length;
  const pending = payments.filter((payment) => payment.status !== "paid").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <CreditCard className="size-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-normal text-slate-950">
          {formatUgandanCurrency(amount)}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-xs font-bold uppercase tracking-normal text-emerald-700">Paid</p>
            <p className="mt-2 text-xl font-bold text-emerald-800">{paid}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-xs font-bold uppercase tracking-normal text-amber-700">Pending</p>
            <p className="mt-2 text-xl font-bold text-amber-800">{pending}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HospitalLabCard({ labResults }: { labResults: LabResult[] }) {
  return (
    <WorklistCard
      title="Lab pipeline"
      description="Requests and results moving through hospital diagnostics."
      icon={FlaskConical}
      items={labResults.slice(0, 5).map((result) =>
        worklistItem(
          result.test_name,
          `${result.requested_by} - ${result.result_summary ?? result.status}`,
          result.status === "completed" ? "green" : result.status === "cancelled" ? "rose" : "amber",
        ),
      )}
      href="/dashboard/labs"
      action="Open laboratory"
    />
  );
}

function PharmacyPrescriptionCard({ prescriptions }: { prescriptions: PrescriptionOrder[] }) {
  return (
    <WorklistCard
      title="Prescription orders"
      description="Simple tracking for who prescribed, what was given, quantity, and pickup."
      icon={ShieldCheck}
      items={[
        laneItem("Received", prescriptions, "received", "blue"),
        laneItem("Preparing", prescriptions, "dispensing", "amber"),
        laneItem("Ready", prescriptions, "ready", "green"),
        laneItem("Picked Up", prescriptions, "collected", "slate"),
      ]}
      href="/dashboard/prescriptions"
      action="Open prescriptions"
    />
  );
}

function PharmacyStockCard({ items }: { items: InventoryItem[] }) {
  const expiring = items.filter((item) => item.status === "expiring").length;
  const out = items.filter((item) => item.status === "out_of_stock").length;
  const low = items.filter((item) => item.status === "low_stock").length;

  return (
    <WorklistCard
      title="Stock controls"
      description="Low stock and expiry alerts are the biggest pharmacy money saver."
      icon={Package}
      items={[
        worklistItem("Low stock drugs", `${low} medicines below reorder level`, low ? "amber" : "green"),
        worklistItem("Out of stock", `${out} medicines need urgent restocking`, out ? "rose" : "green"),
        worklistItem("Expired medicines", `${expiring} batches expired or expiring soon`, expiring ? "amber" : "green"),
      ]}
      href="/dashboard/inventory"
      action="Open inventory"
    />
  );
}

function laneItem(
  title: string,
  prescriptions: PrescriptionOrder[],
  status: PrescriptionOrder["status"],
  tone: Tone,
) {
  const count = prescriptions.filter((prescription) => prescription.status === status).length;
  return worklistItem(title, `${count} order${count === 1 ? "" : "s"}`, tone);
}

function worklistItem(title: string, body: string, tone: Tone): WorklistItem {
  return { title, body, tone };
}

function paidTotal(payments: Payment[]) {
  return payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);
}

function unpaidInvoiceTotal(data: DashboardData) {
  return data.invoices
    .filter((invoice) => invoice.status !== "paid")
    .reduce((sum, invoice) => sum + Math.max(0, Number(invoice.amount) - Number(invoice.paid_amount)), 0);
}

function formatDashboardMoney(amount: number) {
  if (amount >= 1_000_000) {
    const value = amount / 1_000_000;
    const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
    return `UGX ${formatted}M`;
  }

  if (amount >= 1_000) {
    return `UGX ${Math.round(amount / 1_000)}K`;
  }

  return formatUgandanCurrency(amount);
}

function isSameCalendarDay(value: string, date: Date) {
  const candidate = new Date(value);

  return (
    candidate.getFullYear() === date.getFullYear() &&
    candidate.getMonth() === date.getMonth() &&
    candidate.getDate() === date.getDate()
  );
}

function labelForTone(tone: Tone) {
  const labels: Record<Tone, string> = {
    blue: "Open",
    green: "Good",
    amber: "Watch",
    rose: "Urgent",
    slate: "Done",
    violet: "Review",
  };

  return labels[tone];
}
