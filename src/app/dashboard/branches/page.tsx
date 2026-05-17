import { Building2, TrendingUp, Users } from "lucide-react";
import { AddBranchDialog } from "@/components/dashboard/create-record-dialog";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { formatUgandanCurrency } from "@/lib/utils";

const statusTone = {
  active: "green",
  attention: "amber",
  closed: "rose",
} as const;

export default async function BranchesPage() {
  const data = await getDashboardData();
  const totalRevenue = data.branches.reduce((sum, branch) => sum + branch.revenue_month, 0);
  const totalPatients = data.branches.reduce((sum, branch) => sum + branch.patients_today, 0);
  const totalStaff = data.branches.reduce((sum, branch) => sum + branch.staff_online, 0);

  return (
    <div>
      <PageHeading
        eyebrow="Multi-branch dashboard"
        title="Owner overview"
        description="Monitor branches, revenue, patients, and staff from a premium owner dashboard."
        actions={<AddBranchDialog />}
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{data.branches.length}</p>
              <p className="text-sm text-slate-500">Branches</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{formatUgandanCurrency(totalRevenue)}</p>
              <p className="text-sm text-slate-500">Monthly revenue</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{totalPatients}</p>
              <p className="text-sm text-slate-500">Patients today</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Branch performance</CardTitle>
          <CardDescription>Revenue, patient flow, staffing, and attention flags for every branch.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {data.branches.map((branch) => {
            const revenueShare = totalRevenue ? Math.round((branch.revenue_month / totalRevenue) * 100) : 0;
            return (
              <div key={branch.id} className="rounded-lg border border-slate-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{branch.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{branch.region} - Manager: {branch.manager}</p>
                  </div>
                  <Badge tone={statusTone[branch.status]} className="capitalize">
                    {branch.status}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <Metric label="Revenue" value={formatUgandanCurrency(branch.revenue_month)} />
                  <Metric label="Patients today" value={String(branch.patients_today)} />
                  <Metric label="Staff online" value={String(branch.staff_online)} />
                  <Metric label="Revenue share" value={`${revenueShare}%`} />
                </div>
              </div>
            );
          })}
          <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Staff currently online across all branches: <span className="font-semibold text-slate-950">{totalStaff}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}
