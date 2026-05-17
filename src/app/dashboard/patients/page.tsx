import { Plus, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";

export default async function PatientsPage() {
  const data = await getDashboardData();

  if (data.tenant.tenant_kind === "pharmacy") {
    redirect("/dashboard/prescriptions");
  }

  return (
    <div>
      <PageHeading
        eyebrow="Patient registry"
        title="Patient profiles"
        description="Medical history, contacts, allergies, and appointment context remain isolated to this clinic tenant."
        actions={
          <Button>
            <Plus className="size-4" />
            Add patient
          </Button>
        }
      />
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
                Tenant RLS blocks cross-clinic record access.
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
