import { Bed, ClipboardList, CreditCard, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { formatUgandanCurrency } from "@/lib/utils";

const statusTone = {
  admitted: "blue",
  observation: "amber",
  discharge_ready: "green",
} as const;

const admissions = [
  {
    patient: "Sarah Nakato",
    ward: "Maternity Ward",
    bed: "MW-12",
    doctor: "Dr. Sarah Namusoke",
    status: "admitted",
    payment: "MTN MoMo",
    amount: 240000,
  },
  {
    patient: "Brian Kato",
    ward: "Male Ward",
    bed: "MWD-04",
    doctor: "Dr. Peter Mwangi",
    status: "observation",
    payment: "Pending bill",
    amount: 180000,
  },
  {
    patient: "Achan Byaruhanga",
    ward: "Female Ward",
    bed: "FWD-07",
    doctor: "Dr. Grace Achan",
    status: "discharge_ready",
    payment: "Airtel Money",
    amount: 320000,
  },
  {
    patient: "Okello Nankya",
    ward: "Pediatric Ward",
    bed: "PED-02",
    doctor: "Dr. Mary Nakato",
    status: "admitted",
    payment: "Cashier",
    amount: 150000,
  },
] as const;

export default async function AdmissionsPage() {
  const data = await getDashboardData();

  if (data.tenant.tenant_kind === "pharmacy") {
    redirect("/dashboard/inventory");
  }

  const pendingBills = admissions.filter((admission) => admission.payment === "Pending bill").length;
  const collections = admissions.reduce((sum, admission) => sum + admission.amount, 0);

  return (
    <div>
      <PageHeading
        eyebrow="Admissions"
        title="Admissions and wards"
        description="Track admitted patients, ward beds, discharge readiness, and billing follow-up."
        actions={
          <Button>
            <Bed className="size-4" />
            New admission
          </Button>
        }
      />
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <SummaryCard label="Admissions" value={String(admissions.length)} icon={Users} />
        <SummaryCard label="Observation" value="1" icon={ClipboardList} />
        <SummaryCard label="Pending Bills" value={String(pendingBills)} icon={CreditCard} />
        <SummaryCard label="Ward Collections" value={formatUgandanCurrency(collections)} icon={CreditCard} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ward admissions</CardTitle>
          <CardDescription>Hospital admin view for ward movement, doctors, and payment status.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">Ward</th>
                <th className="px-5 py-3 font-semibold">Bed</th>
                <th className="px-5 py-3 font-semibold">Doctor</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admissions.map((admission) => (
                <tr key={`${admission.patient}-${admission.bed}`} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4 font-bold text-slate-950">{admission.patient}</td>
                  <td className="px-5 py-4 text-slate-700">{admission.ward}</td>
                  <td className="px-5 py-4 font-semibold text-slate-950">{admission.bed}</td>
                  <td className="px-5 py-4 text-slate-700">{admission.doctor}</td>
                  <td className="px-5 py-4">
                    <Badge tone={statusTone[admission.status]} className="capitalize">
                      {admission.status.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{admission.payment}</td>
                  <td className="px-5 py-4 font-bold text-slate-950">
                    {formatUgandanCurrency(admission.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Users;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-slate-950">{value}</p>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
