import { NextRequest } from "next/server";
import { getDashboardData } from "@/lib/data/repositories";
import type { DashboardData, Patient } from "@/lib/types";
import { formatUgandanCurrency, slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type DocumentContext = {
  params: Promise<{ documentType: string }>;
};

export async function GET(request: NextRequest, { params }: DocumentContext) {
  const { documentType } = await params;
  const data = await getDashboardData();
  const patientId = request.nextUrl.searchParams.get("patientId");
  const disposition = request.nextUrl.searchParams.get("disposition") === "inline" ? "inline" : "attachment";

  switch (documentType) {
    case "patient-intake-form":
      return htmlDownload(
        patientIntakeForm(data),
        fileName(data, "patient-intake-form", "html"),
        disposition,
      );
    case "consent-form":
      return htmlDownload(consentForm(data), fileName(data, "consent-form", "html"), disposition);
    case "referral-form":
      return htmlDownload(referralForm(data), fileName(data, "referral-form", "html"), disposition);
    case "patient-register":
      return csvDownload(
        patientRegisterRows(data),
        fileName(data, "patient-register", "csv"),
        disposition,
      );
    case "patient-summary":
      return patientSummaryDownload(data, patientId, disposition);
    case "operational-report":
      return htmlDownload(
        operationalReport(data),
        fileName(data, "operational-report", "html"),
        disposition,
      );
    case "daily-appointment-register":
      return csvDownload(
        appointmentRegisterRows(data),
        fileName(data, "daily-appointment-register", "csv"),
        disposition,
      );
    case "doctor-utilization":
      return csvDownload(
        doctorUtilizationRows(data),
        fileName(data, "doctor-utilization", "csv"),
        disposition,
      );
    case "mobile-money-reconciliation":
      return csvDownload(
        paymentReconciliationRows(data),
        fileName(data, "mobile-money-reconciliation", "csv"),
        disposition,
      );
    case "patient-growth":
      return csvDownload(patientGrowthRows(data), fileName(data, "patient-growth", "csv"), disposition);
    case "daily-sales-ledger":
      return csvDownload(
        dailySalesLedgerRows(data),
        fileName(data, "daily-sales-ledger", "csv"),
        disposition,
      );
    case "inventory-reorder-watch":
      return csvDownload(
        inventoryReorderRows(data),
        fileName(data, "inventory-reorder-watch", "csv"),
        disposition,
      );
    case "sales-growth":
      return csvDownload(salesGrowthRows(data), fileName(data, "sales-growth", "csv"), disposition);
    default:
      return Response.json({ error: "Unknown document type." }, { status: 404 });
  }
}

function patientSummaryDownload(
  data: DashboardData,
  patientId: string | null,
  disposition: "inline" | "attachment",
) {
  const patient = data.patients.find((item) => item.id === patientId);

  if (!patient) {
    return Response.json({ error: "Patient not found." }, { status: 404 });
  }

  return htmlDownload(
    patientSummary(data, patient),
    `${slugify(data.tenant.name)}-${slugify(patient.full_name)}-summary.html`,
    disposition,
  );
}

function patientIntakeForm(data: DashboardData) {
  return documentHtml({
    tenantName: data.tenant.name,
    title: "Patient Intake Form",
    subtitle: "Use this form at reception before consultation, billing, or lab work.",
    sections: [
      {
        title: "Patient details",
        fields: [
          "Full name",
          "Phone number",
          "Date of birth",
          "Sex",
          "Address",
          "National ID or insurance number",
        ],
      },
      {
        title: "Emergency contact",
        fields: ["Name", "Relationship", "Phone number", "Address"],
      },
      {
        title: "Clinical intake",
        fields: [
          "Reason for visit",
          "Current symptoms",
          "Medical history",
          "Known allergies",
          "Current medication",
          "Triage notes",
        ],
        large: true,
      },
      {
        title: "Vitals",
        fields: ["Temperature", "Blood pressure", "Pulse", "Weight", "Height", "Recorded by"],
      },
      {
        title: "Sign off",
        fields: ["Patient or guardian signature", "Staff name", "Date"],
      },
    ],
  });
}

function consentForm(data: DashboardData) {
  return documentHtml({
    tenantName: data.tenant.name,
    title: "Consent and Records Release Form",
    subtitle: "Use this for consent to treatment, record keeping, and payment follow-up.",
    notice:
      "I consent to assessment, treatment, record keeping, billing communication, and sharing records with referred providers where medically necessary.",
    sections: [
      {
        title: "Patient or guardian",
        fields: ["Full name", "Phone number", "Relationship to patient", "Patient name"],
      },
      {
        title: "Consent choices",
        fields: [
          "Consent to treatment",
          "Consent to store medical records",
          "Consent to payment or insurance follow-up",
          "Consent to referral record sharing",
        ],
      },
      {
        title: "Signature",
        fields: ["Signature", "Witness name", "Staff name", "Date"],
      },
    ],
  });
}

function referralForm(data: DashboardData) {
  return documentHtml({
    tenantName: data.tenant.name,
    title: "Referral Form",
    subtitle: "Use this when sending a patient to another doctor, dentist, lab, clinic, or hospital.",
    sections: [
      {
        title: "Referral details",
        fields: ["Referred to", "Facility", "Department", "Urgency", "Referral date"],
      },
      {
        title: "Patient details",
        fields: ["Patient name", "Phone number", "Date of birth", "Sex", "Known allergies"],
      },
      {
        title: "Clinical summary",
        fields: [
          "Reason for referral",
          "Diagnosis or working impression",
          "Treatment already given",
          "Tests requested or attached",
          "Medication list",
        ],
        large: true,
      },
      {
        title: "Provider sign off",
        fields: ["Referring doctor", "License number", "Phone number", "Signature"],
      },
    ],
  });
}

function patientSummary(data: DashboardData, patient: Patient) {
  const appointments = data.appointments.filter((item) => item.patient_id === patient.id);
  const invoices = data.invoices.filter((item) => item.patient_id === patient.id);
  const diagnoses = data.diagnoses.filter((item) => item.patient_id === patient.id);
  const prescriptions = data.clinicalPrescriptions.filter((item) => item.patient_id === patient.id);
  const visits = data.visitRecords.filter((item) => item.patient_id === patient.id);

  return documentHtml({
    tenantName: data.tenant.name,
    title: `${patient.full_name} Patient Summary`,
    subtitle: `Generated ${formatDateTime(new Date().toISOString())}`,
    sections: [
      {
        title: "Patient profile",
        values: [
          ["Name", patient.full_name],
          ["Phone", patient.phone],
          ["Sex", patient.sex],
          ["Date of birth", formatDate(patient.date_of_birth)],
          ["Address", metadataText(patient, "address") || "Not recorded"],
          ["Emergency contact", emergencyContactText(patient)],
        ],
      },
      {
        title: "Clinical background",
        values: [
          ["Medical history", listText(patient.medical_history)],
          ["Allergies", listText(patient.allergies)],
          ["Intake notes", metadataText(patient, "notes") || "Not recorded"],
        ],
      },
      {
        title: "Recent activity",
        values: [
          ["Appointments", appointments.length ? appointments.map((item) => `${formatDateTime(item.scheduled_at)} - ${item.reason}`).join("; ") : "None recorded"],
          ["Diagnoses", diagnoses.length ? diagnoses.map((item) => item.label).join(", ") : "None recorded"],
          ["Prescriptions", prescriptions.length ? prescriptions.map((item) => `${item.medication} (${item.dosage})`).join(", ") : "None recorded"],
          ["Visit notes", visits.length ? visits.map((item) => `${formatDate(item.visited_at)} - ${item.notes}`).join("; ") : "None recorded"],
          ["Invoices", invoices.length ? invoices.map((item) => `${item.invoice_number}: ${formatUgandanCurrency(item.amount)} ${item.status}`).join("; ") : "None recorded"],
        ],
      },
    ],
  });
}

function operationalReport(data: DashboardData) {
  const paidRevenue = data.payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + Number(payment.amount), 0);

  return documentHtml({
    tenantName: data.tenant.name,
    title: "Operations Report",
    subtitle: `Generated ${formatDateTime(new Date().toISOString())}`,
    sections: [
      {
        title: "Overview",
        values: [
          ["Patients", String(data.patients.length)],
          ["Appointments", String(data.appointments.length)],
          ["Collected revenue", formatUgandanCurrency(paidRevenue)],
          ["Pending invoices", String(data.invoices.filter((item) => item.status !== "paid").length)],
        ],
      },
      {
        title: data.tenant.tenant_kind === "pharmacy" ? "Pharmacy activity" : "Clinical activity",
        values:
          data.tenant.tenant_kind === "pharmacy"
            ? [
                ["Sales entries", String(data.payments.length)],
                ["Inventory items", String(data.inventory.length)],
                ["Low or risky stock", String(data.inventory.filter((item) => item.status !== "in_stock").length)],
              ]
            : [
                ["Doctors", String(data.doctors.length)],
                ["Lab requests", String(data.labResults.length)],
                ["Clinical prescriptions", String(data.clinicalPrescriptions.length)],
              ],
      },
    ],
  });
}

function patientRegisterRows(data: DashboardData) {
  return [
    ["Patient ID", "Full name", "Phone", "Sex", "Date of birth", "Emergency contact", "Medical history", "Allergies", "Created"],
    ...data.patients.map((patient) => [
      patient.id,
      patient.full_name,
      patient.phone,
      patient.sex,
      formatDate(patient.date_of_birth),
      emergencyContactText(patient),
      listText(patient.medical_history),
      listText(patient.allergies),
      formatDateTime(patient.created_at),
    ]),
  ];
}

function appointmentRegisterRows(data: DashboardData) {
  return [
    ["Appointment ID", "Scheduled", "Patient", "Doctor", "Reason", "Status", "Payment", "Fee"],
    ...data.appointments.map((appointment) => [
      appointment.id,
      formatDateTime(appointment.scheduled_at),
      appointment.patient?.full_name ?? patientName(data, appointment.patient_id),
      appointment.doctor?.full_name ?? doctorName(data, appointment.doctor_id),
      appointment.reason,
      appointment.status,
      appointment.payment_status,
      formatUgandanCurrency(appointment.fee),
    ]),
  ];
}

function doctorUtilizationRows(data: DashboardData) {
  return [
    ["Doctor", "Specialization", "Status", "Room", "Appointments", "Consultation fee"],
    ...data.doctors.map((doctor) => [
      doctor.full_name,
      doctor.specialization,
      doctor.status,
      doctor.room,
      String(data.appointments.filter((item) => item.doctor_id === doctor.id).length),
      formatUgandanCurrency(doctor.consultation_fee),
    ]),
  ];
}

function paymentReconciliationRows(data: DashboardData) {
  return [
    ["Payment ID", "Created", "Provider", "Reference", "Patient", "Phone", "Amount", "Status"],
    ...data.payments.map((payment) => [
      payment.id,
      formatDateTime(payment.created_at),
      payment.provider,
      payment.provider_reference,
      payment.patient_id ? patientName(data, payment.patient_id) : "General payment",
      payment.phone,
      formatUgandanCurrency(payment.amount, payment.currency),
      payment.status,
    ]),
  ];
}

function patientGrowthRows(data: DashboardData) {
  const counts = new Map<string, number>();

  for (const patient of data.patients) {
    const month = patient.created_at.slice(0, 7);
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }

  return [
    ["Month", "New patients"],
    ...Array.from(counts.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([month, count]) => [month, String(count)]),
  ];
}

function dailySalesLedgerRows(data: DashboardData) {
  return [
    ["Payment ID", "Created", "Reference", "Method", "Status", "Amount"],
    ...data.payments.map((payment) => [
      payment.id,
      formatDateTime(payment.created_at),
      payment.provider_reference,
      payment.provider,
      payment.status,
      formatUgandanCurrency(payment.amount),
    ]),
  ];
}

function inventoryReorderRows(data: DashboardData) {
  return [
    ["Item", "SKU", "Category", "Stock on hand", "Reorder level", "Status", "Expiry date", "Unit price"],
    ...data.inventory
      .filter((item) => item.status !== "in_stock" || item.stock_on_hand <= item.reorder_level)
      .map((item) => [
        item.name,
        item.sku,
        item.category,
        String(item.stock_on_hand),
        String(item.reorder_level),
        item.status,
        formatDate(item.expiry_date),
        formatUgandanCurrency(item.unit_price),
      ]),
  ];
}

function salesGrowthRows(data: DashboardData) {
  return [
    ["Month", "Revenue", "Volume"],
    ...data.revenue.map((point) => [
      point.month,
      formatUgandanCurrency(point.revenue),
      String(point.appointments),
    ]),
  ];
}

function documentHtml({
  tenantName,
  title,
  subtitle,
  notice,
  sections,
}: {
  tenantName: string;
  title: string;
  subtitle: string;
  notice?: string;
  sections: Array<{
    title: string;
    fields?: string[];
    values?: Array<[string, string]>;
    large?: boolean;
  }>;
}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; line-height: 1.45; }
    header { border-bottom: 2px solid #0f766e; padding-bottom: 16px; margin-bottom: 24px; }
    .tenant { color: #0f766e; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.08em; }
    h1 { margin: 8px 0 6px; font-size: 28px; }
    .subtitle { color: #475569; margin: 0; }
    .notice { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 14px; border-radius: 8px; margin: 18px 0; }
    section { break-inside: avoid; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 14px 0; }
    h2 { font-size: 16px; margin: 0 0 12px; color: #0f172a; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .field, .value { min-height: 42px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px; }
    .large .field { min-height: 88px; }
    .label { display: block; color: #475569; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
    .content { white-space: pre-wrap; }
    footer { margin-top: 28px; color: #64748b; font-size: 12px; }
    @media print { body { margin: 18mm; } a { color: inherit; } }
  </style>
</head>
<body>
  <header>
    <div class="tenant">${escapeHtml(tenantName)}</div>
    <h1>${escapeHtml(title)}</h1>
    <p class="subtitle">${escapeHtml(subtitle)}</p>
  </header>
  ${notice ? `<div class="notice">${escapeHtml(notice)}</div>` : ""}
  ${sections.map(renderSection).join("")}
  <footer>Generated by MediLink. Keep this document with the patient record.</footer>
</body>
</html>`;
}

function renderSection(section: {
  title: string;
  fields?: string[];
  values?: Array<[string, string]>;
  large?: boolean;
}) {
  const className = section.large ? "grid large" : "grid";

  return `<section>
    <h2>${escapeHtml(section.title)}</h2>
    <div class="${className}">
      ${(section.fields ?? []).map((fieldName) => `<div class="field"><span class="label">${escapeHtml(fieldName)}</span></div>`).join("")}
      ${(section.values ?? []).map(([label, value]) => `<div class="value"><span class="label">${escapeHtml(label)}</span><span class="content">${escapeHtml(value)}</span></div>`).join("")}
    </div>
  </section>`;
}

function htmlDownload(content: string, filename: string, disposition: "inline" | "attachment") {
  return new Response(content, {
    headers: {
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function csvDownload(rows: string[][], filename: string, disposition: "inline" | "attachment") {
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}

function csvCell(value: string) {
  const normalized = value.replace(/\r?\n/g, " ").trim();

  return /[",]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
}

function fileName(data: DashboardData, name: string, extension: "csv" | "html") {
  return `${slugify(data.tenant.name)}-${name}.${extension}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-UG", { dateStyle: "medium" }).format(date);
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not recorded";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function patientName(data: DashboardData, patientId: string) {
  return data.patients.find((patient) => patient.id === patientId)?.full_name ?? "Unknown patient";
}

function doctorName(data: DashboardData, doctorId: string) {
  return data.doctors.find((doctor) => doctor.id === doctorId)?.full_name ?? "Unassigned";
}

function listText(items: string[]) {
  return items.length ? items.join(", ") : "None recorded";
}

function metadataText(patient: Patient, key: string) {
  const value = patient.metadata?.[key];

  return typeof value === "string" ? value : "";
}

function emergencyContactText(patient: Patient) {
  if (!patient.emergency_contact) return "Not recorded";

  return `${patient.emergency_contact.name} ${patient.emergency_contact.phone}`.trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
