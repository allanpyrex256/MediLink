import { ClipboardList, Download, Eye, FileDown, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { AddPatientDialog } from "@/components/dashboard/add-patient-dialog";
import { DocumentTemplateUploader } from "@/components/dashboard/document-template-uploader";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData, getTenantDocumentTemplates } from "@/lib/data/repositories";

export default async function PatientsPage() {
  const data = await getDashboardData();
  const uploadedTemplates = await getTenantDocumentTemplates();
  const documentDownloads = [
    {
      label: "Patient intake form",
      description: "Blank reception form for new patient registration.",
      href: "/api/documents/patient-intake-form",
    },
    {
      label: "Consent form",
      description: "Treatment, records, referral, and billing consent.",
      href: "/api/documents/consent-form",
    },
    {
      label: "Referral form",
      description: "Printable referral note for labs, doctors, or hospitals.",
      href: "/api/documents/referral-form",
    },
    {
      label: "Patient register",
      description: "CSV list of the current patient registry.",
      href: "/api/documents/patient-register",
    },
  ];

  if (data.tenant.tenant_kind === "pharmacy") {
    redirect("/dashboard/prescriptions");
  }

  return (
    <div>
      <PageHeading
        eyebrow="Patient registry"
        title="Patient profiles"
        description="Medical history, contacts, allergies, and appointment context remain isolated to this healthcare tenant."
        actions={<AddPatientDialog />}
      />
      <section className="mb-5">
        <div className="mb-3 flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-sky-100 text-sky-700">
            <ClipboardList className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950">Download forms and documents</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Print blank forms for reception, or export the patient registry when staff need files offline.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {documentDownloads.map((document) => (
            <DownloadCard key={document.href} {...document} />
          ))}
        </div>
        <DocumentTemplateUploader />
        {uploadedTemplates.length ? (
          <div className="mt-4">
            <h3 className="text-sm font-bold uppercase tracking-normal text-slate-500">
              Uploaded facility forms
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {uploadedTemplates.map((template) => (
                <DownloadCard
                  key={template.id}
                  label={template.name}
                  description={`${template.file_name} - ${formatFileSize(template.size_bytes)}`}
                  href={`/api/document-templates/${encodeURIComponent(template.id)}`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>
      <div className="grid gap-4 lg:grid-cols-3">
        {data.patients.map((patient) => (
          <Card key={patient.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{patient.full_name}</CardTitle>
                  <CardDescription>{patient.phone}</CardDescription>
                </div>
                <Badge tone={patient.sex === "female" ? "rose" : "blue"} className="capitalize">
                  {patient.sex}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Medical history
                </p>
                <div className="flex flex-wrap gap-2">
                  {patient.medical_history.map((item) => (
                    <Badge key={item} tone="slate">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Allergies
                </p>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.length ? (
                    patient.allergies.map((item) => (
                      <Badge key={item} tone="amber">
                        {item}
                      </Badge>
                    ))
                  ) : (
                    <Badge tone="green">None recorded</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                Tenant RLS blocks cross-facility record access.
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <a
                  href={`/api/documents/patient-summary?patientId=${encodeURIComponent(patient.id)}&disposition=inline`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-100 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                >
                  <Eye className="size-4" aria-hidden="true" />
                  View summary
                </a>
                <a
                  href={`/api/documents/patient-summary?patientId=${encodeURIComponent(patient.id)}`}
                  download
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Download
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DownloadCard({
  label,
  description,
  href,
}: {
  label: string;
  description: string;
  href: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:shadow-lg hover:shadow-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-10 place-items-center rounded-lg bg-white text-sky-700 shadow-sm shadow-slate-100">
          <FileDown className="size-5" aria-hidden="true" />
        </div>
        <Download className="size-4 text-slate-400" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm font-bold text-slate-950">{label}</p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{description}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={`${href}${href.includes("?") ? "&" : "?"}disposition=inline`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
        >
          <Eye className="size-4" aria-hidden="true" />
          View
        </a>
        <a
          href={href}
          download
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 text-sm font-bold text-white transition hover:bg-sky-700"
        >
          <Download className="size-4" aria-hidden="true" />
          Download
        </a>
      </div>
    </article>
  );
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}
