import { ClipboardPlus, PackageCheck, Timer } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/dashboard/page-heading";
import { WorkflowActionButton } from "@/components/dashboard/workflow-action-button";
import { PrescriptionTable } from "@/components/dashboard/prescription-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { getDashboardData } from "@/lib/data/repositories";
import { tenantBranding } from "@/lib/tenant-branding";
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
  dispensing: "Preparing",
  ready: "Ready",
  collected: "Picked Up",
  cancelled: "Cancelled",
} as const;

export default async function PrescriptionsPage() {
  const data = await getDashboardData();

  if (data.tenant.tenant_kind !== "pharmacy") {
    redirect("/dashboard/appointments");
  }

  const brand = tenantBranding(data.tenant);
  const pendingOrders = data.prescriptions.filter((item) =>
    ["received", "dispensing", "ready"].includes(item.status),
  );
  const pendingValue = pendingOrders.reduce((sum, item) => sum + item.total_amount, 0);

  return (
    <div>
      <PageHeading
        eyebrow="Prescriptions"
        title={`${brand.name} prescription orders`}
        description="Simple record of who prescribed, what medicine was given, quantity, payment, and pickup."
        actions={
          <WorkflowActionButton
            title="New prescription order"
            description="Prescription order capture is ready to become a form for customer, prescriber, medicine, quantity, price, and pickup status."
          >
            <ClipboardPlus className="size-4" />
            New order
          </WorkflowActionButton>
        }
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <Timer className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{pendingOrders.length}</p>
              <p className="text-sm text-slate-500">Prescriptions pending</p>
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
              <p className="text-sm text-slate-500">Ready pickup/delivery</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Pending order amount</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {formatUgandanCurrency(pendingValue)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <PrescriptionTable prescriptions={data.prescriptions} title="Prescription Orders" />
        <Card>
          <CardHeader>
            <Logo
              label={brand.name}
              tagline={brand.tagline}
              imageUrl={brand.logoUrl}
              initials={brand.initials}
              color={brand.primaryColor}
            />
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Simple status view for prescriptions, pickup, and delivery notifications.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {data.prescriptions.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.patient_name}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.medicine}</p>
                    {item.fulfillment_method === "delivery" ? (
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">
                        Delivery: {item.delivery_address ?? "Address missing"}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">Pickup at pharmacy</p>
                    )}
                  </div>
                  <Badge tone={statusTone[item.status]}>
                    {statusLabel[item.status]}
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
