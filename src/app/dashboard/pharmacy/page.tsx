import { Pill } from "lucide-react";
import { AddInventoryItemDialog } from "@/components/dashboard/create-record-dialog";
import { InventorySnapshot } from "@/components/dashboard/inventory-snapshot";
import { PageHeading } from "@/components/dashboard/page-heading";
import { PrescriptionTable } from "@/components/dashboard/prescription-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { formatUgandanCurrency } from "@/lib/utils";

export default async function PharmacyPage() {
  const data = await getDashboardData();
  const lowStock = data.inventory.filter((item) => item.status !== "in_stock").length;
  const prescriptionValue = data.prescriptions.reduce((sum, item) => sum + item.total_amount, 0);

  return (
    <div>
      <PageHeading
        eyebrow="Pharmacy"
        title="Pharmacy sales and stock"
        description="Fast counter sales, receipts, mobile money tracking, stock alerts, expiry alerts, and simple prescription orders."
        actions={
          <AddInventoryItemDialog label="Add stock" />
        }
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-violet-50 text-violet-600">
              <Pill className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{data.inventory.length}</p>
              <p className="text-sm text-slate-500">Drug inventory items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Low stock or expiry alerts</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{lowStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Prescription value</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {formatUgandanCurrency(prescriptionValue)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.8fr)]">
        <PrescriptionTable prescriptions={data.prescriptions} title="Prescription Orders" />
        <div className="grid gap-5">
          <InventorySnapshot items={data.inventory} title="Low stock and expiry alerts" />
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy plans</CardTitle>
              <CardDescription>Small drug shops can stay simple. Larger pharmacies can add prescription workflows.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-950">Basic Pharmacy</p>
                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                      Inventory, sales, receipts, low stock, expiry alerts.
                    </p>
                  </div>
                  <Badge tone="green">Simple</Badge>
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-emerald-950">Advanced Pharmacy</p>
                    <p className="mt-1 text-xs font-medium leading-5 text-emerald-700">
                      Adds prescription orders, prescriber tracking, and pickup status.
                    </p>
                  </div>
                  <Badge tone="blue">Growth</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
