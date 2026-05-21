import { Pill } from "lucide-react";
import { AddInventoryItemDialog } from "@/components/dashboard/create-record-dialog";
import { InventorySnapshot } from "@/components/dashboard/inventory-snapshot";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";

export default async function PharmacyPage() {
  const data = await getDashboardData();
  const lowStock = data.inventory.filter((item) => item.status !== "in_stock").length;

  return (
    <div>
      <PageHeading
        eyebrow="Pharmacy"
        title="Pharmacy sales and stock"
        description="Fast counter sales, receipts, mobile money tracking, stock alerts, and expiry alerts."
        actions={
          <AddInventoryItemDialog label="Add stock" />
        }
      />
      <div className="mb-5 grid gap-4 md:grid-cols-2">
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
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)]">
        <InventorySnapshot items={data.inventory} title="Low stock and expiry alerts" />
        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy plans</CardTitle>
              <CardDescription>Keep pharmacy work focused on stock, sales, payments, and expiry alerts.</CardDescription>
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
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-emerald-950">Advanced Pharmacy</p>
                    <p className="mt-1 text-xs font-medium leading-5 text-emerald-700">
                      Adds branch-level reports, staff controls, and payment tracking.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
