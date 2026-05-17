import { ClipboardPlus, PackageCheck, Timer } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/dashboard/page-heading";
import { PrescriptionTable } from "@/components/dashboard/prescription-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { formatUgandanCurrency } from "@/lib/utils";

const statusTone = {
  received: "blue",
  dispensing: "amber",
  ready: "green",
  collected: "slate",
  cancelled: "rose",
} as const;

export default async function PrescriptionsPage() {
  const data = await getDashboardData();

  if (data.tenant.tenant_kind !== "pharmacy") {
    redirect("/dashboard/appointments");
  }

  const activeOrders = data.prescriptions.filter((item) => item.status !== "collected");
  const pendingValue = activeOrders.reduce((sum, item) => sum + item.total_amount, 0);

  return (
    <div>
      <PageHeading
        eyebrow="Dispensing"
        title="Prescriptions"
        description="Store and monitor prescription orders from intake through dispensing, payment, and pickup."
        actions={
          <Button>
            <ClipboardPlus className="size-4" />
            New prescription
          </Button>
        }
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <Timer className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{activeOrders.length}</p>
              <p className="text-sm text-slate-500">Active orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <PackageCheck className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">
                {data.prescriptions.filter((item) => item.status === "ready").length}
              </p>
              <p className="text-sm text-slate-500">Ready pickups</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Pending order value</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {formatUgandanCurrency(pendingValue)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <PrescriptionTable prescriptions={data.prescriptions} title="Dispensing ledger" />
        <Card>
          <CardHeader>
            <CardTitle>Status lanes</CardTitle>
            <CardDescription>Current prescription work by fulfillment state.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.prescriptions.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.patient_name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.medicine}</p>
                  </div>
                  <Badge tone={statusTone[item.status]} className="capitalize">
                    {item.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  {formatUgandanCurrency(item.total_amount)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
