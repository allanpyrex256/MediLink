import { Plus, Stethoscope } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { formatUgandanCurrency } from "@/lib/utils";

const tone = {
  available: "green",
  busy: "amber",
  offline: "slate",
} as const;

export default async function DoctorsPage() {
  const data = await getDashboardData();

  if (data.tenant.tenant_kind === "pharmacy") {
    redirect("/dashboard/inventory");
  }

  return (
    <div>
      <PageHeading
        eyebrow="Clinical team"
        title="Doctors and schedules"
        description="Manage doctor profiles, specializations, rooms, consultation fees, and availability."
        actions={
          <Button>
            <Plus className="size-4" />
            Add doctor
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
                  <Stethoscope className="size-5" />
                </div>
                <Badge tone={tone[doctor.status]} className="capitalize">
                  {doctor.status}
                </Badge>
              </div>
              <CardTitle className="mt-4">{doctor.full_name}</CardTitle>
              <CardDescription>{doctor.specialization}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">License</span>
                <span className="font-medium text-slate-950">{doctor.license_number}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Room</span>
                <span className="font-medium text-slate-950">{doctor.room}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Fee</span>
                <span className="font-medium text-slate-950">{formatUgandanCurrency(doctor.consultation_fee)}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-slate-600">
                Mon-Fri · 08:00-16:30 · 30 min slots
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
