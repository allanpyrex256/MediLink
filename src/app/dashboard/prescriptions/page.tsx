import { ClipboardList, PackageCheck, Timer } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/dashboard/page-heading";
import { PrescriptionTable } from "@/components/dashboard/prescription-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { dashboardRoleForUser } from "@/lib/rbac";
import { formatUgandanCurrency } from "@/lib/utils";

const statusTone = {
  received: "blue",
  dispensing: "amber",
  ready: "green",
  collected: "slate",
  cancelled: "rose",
} as const;

const statusLabel = {
  received: "Received",
  dispensing: "Dispensing",
  ready: "Ready",
  collected: "Collected",
  cancelled: "Cancelled",
} as const;

export default async function PrescriptionsPage() {
  const data = await getDashboardData();
  const role = dashboardRoleForUser(data.user);

  if (role === "seller") redirect("/dashboard/sales");

  const openOrders = data.prescriptions.filter((item) =>
    ["received", "dispensing", "ready"].includes(item.status),
  );
  const readyOrders = data.prescriptions.filter((item) => item.status === "ready");
  const openValue = openOrders.reduce((sum, item) => sum + item.total_amount, 0);

  return (
    <div>
      <PageHeading
        eyebrow="Pharmacist"
        title="Prescriptions and dispensing"
        description="Simple pharmacist view for medicine requests, dispensing status, pickup, and delivery."
      />

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <SummaryCard icon={Timer} label="Open prescriptions" value={String(openOrders.length)} />
        <SummaryCard icon={PackageCheck} label="Ready for pickup" value={String(readyOrders.length)} tone="green" />
        <SummaryCard icon={ClipboardList} label="Open value" value={formatUgandanCurrency(openValue)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <PrescriptionTable prescriptions={data.prescriptions} title="Prescription queue" />
        <Card>
          <CardHeader>
            <CardTitle>Dispensing status</CardTitle>
            <CardDescription>Mark requests as dispensing, ready, or collected from the queue.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.prescriptions.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.patient_name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.medicine}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                      {item.fulfillment_method === "delivery"
                        ? `Delivery: ${item.delivery_address ?? "Address missing"}`
                        : "Pickup at pharmacy"}
                    </p>
                  </div>
                  <Badge tone={statusTone[item.status]}>{statusLabel[item.status]}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  tone = "blue",
  value,
}: {
  icon: typeof Timer;
  label: string;
  tone?: "blue" | "green";
  value: string;
}) {
  const toneClass = tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700";

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`grid size-12 place-items-center rounded-lg ${toneClass}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-950">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
