import { PackagePlus, Pill } from "lucide-react";
import { InventorySnapshot } from "@/components/dashboard/inventory-snapshot";
import { PageHeading } from "@/components/dashboard/page-heading";
import { PrescriptionTable } from "@/components/dashboard/prescription-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        title="Pharmacy management"
        description="Drug inventory, expiry alerts, low stock alerts, prescription tracking, and sales visibility."
        actions={
          <Button>
            <PackagePlus className="size-4" />
            Add stock
          </Button>
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
        <PrescriptionTable prescriptions={data.prescriptions} title="Prescription tracking" />
        <div className="grid gap-5">
          <InventorySnapshot items={data.inventory} title="Stock alerts" />
          <Card>
            <CardHeader>
              <CardTitle>Module pricing</CardTitle>
              <CardDescription>Pharmacies can subscribe to this module separately.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-slate-950">UGX 100,000</p>
                <p className="mt-1 text-sm text-slate-500">Per month</p>
              </div>
              <Badge tone="blue">Standalone</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
