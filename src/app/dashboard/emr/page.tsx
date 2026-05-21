import { format } from "date-fns";
import { FilePlus2, Pill, Stethoscope } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/dashboard/page-heading";
import { WorkflowActionButton } from "@/components/dashboard/workflow-action-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";

const diagnosisTone = {
  active: "amber",
  resolved: "green",
} as const;

const prescriptionTone = {
  active: "blue",
  completed: "green",
  cancelled: "rose",
} as const;

export default async function EmrPage() {
  const data = await getDashboardData();

  if (data.tenant.tenant_kind === "pharmacy") {
    redirect("/dashboard/sales");
  }

  return (
    <div>
      <PageHeading
        eyebrow="EMR"
        title="Patient records"
        description="Digital patient files covering history, diagnoses, prescriptions, lab results, and visit notes."
        actions={
          <WorkflowActionButton
            title="New patient record"
            description="EMR record creation is ready to become a form for diagnosis, notes, prescriptions, and lab requests."
          >
            <FilePlus2 className="size-4" />
            New record
          </WorkflowActionButton>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <Stethoscope className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{data.patients.length}</p>
              <p className="text-sm text-slate-500">Patient files</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Active diagnoses</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {data.diagnoses.filter((item) => item.status === "active").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Active prescriptions</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {data.clinicalPrescriptions.filter((item) => item.status === "active").length}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Patient files</CardTitle>
            <CardDescription>Every file combines history, allergies, visits, labs, and prescriptions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {data.patients.map((patient) => {
              const diagnoses = data.diagnoses.filter((item) => item.patient_id === patient.id);
              const prescriptions = data.clinicalPrescriptions.filter((item) => item.patient_id === patient.id);
              const labs = data.labResults.filter((item) => item.patient_id === patient.id);
              const visits = data.visitRecords.filter((item) => item.patient_id === patient.id);

              return (
                <div key={patient.id} className="rounded-lg border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{patient.full_name}</p>
                      <p className="mt-1 text-sm text-slate-500">{patient.phone}</p>
                    </div>
                    <Badge tone={patient.allergies.length ? "amber" : "green"}>
                      {patient.allergies.length ? `${patient.allergies.length} allergies` : "No allergies"}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <RecordBlock title="History" items={patient.medical_history} empty="No history recorded" />
                    <RecordBlock title="Diagnoses" items={diagnoses.map((item) => item.label)} empty="No diagnoses" />
                    <RecordBlock title="Prescriptions" items={prescriptions.map((item) => item.medication)} empty="No prescriptions" />
                    <RecordBlock title="Lab results" items={labs.map((item) => item.test_name)} empty="No lab results" />
                  </div>
                  {visits[0] ? (
                    <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                      Last visit: {format(new Date(visits[0].visited_at), "MMM d, yyyy")} - {visits[0].notes}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </CardContent>
        </Card>
        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Diagnoses</CardTitle>
              <CardDescription>Active and resolved conditions.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {data.diagnoses.map((diagnosis) => (
                <div key={diagnosis.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">{diagnosis.label}</p>
                    <Badge tone={diagnosisTone[diagnosis.status]} className="capitalize">
                      {diagnosis.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{diagnosis.notes}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>Current medicine orders from doctors.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {data.clinicalPrescriptions.map((prescription) => (
                <div key={prescription.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700">
                    <Pill className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950">{prescription.medication}</p>
                      <Badge tone={prescriptionTone[prescription.status]} className="capitalize">
                        {prescription.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{prescription.dosage}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RecordBlock({
  title,
  items,
  empty,
}: {
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <Badge key={item} tone="slate">
              {item}
            </Badge>
          ))
        ) : (
          <Badge tone="green">{empty}</Badge>
        )}
      </div>
    </div>
  );
}
