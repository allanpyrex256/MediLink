import { AlertTriangle, PackagePlus } from "lucide-react";
import { AddInventoryItemDialog } from "@/components/dashboard/create-record-dialog";
import { InventorySnapshot } from "@/components/dashboard/inventory-snapshot";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { formatUgandanCurrency } from "@/lib/utils";

const statusTone = {
  in_stock: "green",
  low_stock: "amber",
  out_of_stock: "rose",
  expiring: "amber",
} as const;

export default async function InventoryPage() {
  const data = await getDashboardData();

  const stockValue = data.inventory.reduce(
    (sum, item) => sum + item.stock_on_hand * item.unit_price,
    0,
  );

  return (
    <div>
      <PageHeading
        eyebrow="Inventory"
        title="Drug stock and expiry"
        description="Track available quantities, low stock drugs, expiring medicines, supplier restocking, and sale value."
        actions={
          <AddInventoryItemDialog />
        }
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <PackagePlus className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{data.inventory.length}</p>
              <p className="text-sm text-slate-500">Stock items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">
                {data.inventory.filter((item) => item.status !== "in_stock").length}
              </p>
              <p className="text-sm text-slate-500">Low stock or expiry alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Stock value</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {formatUgandanCurrency(stockValue)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Stock list</CardTitle>
            <CardDescription>Medicine catalog, available quantity, reorder level, expiry, and selling price.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Medicine</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Reorder</th>
                  <th className="px-5 py-3 font-semibold">Expiry</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Unit price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-950">{item.name}</p>
                      <p className="mt-1 font-mono text-xs text-slate-500">{item.sku}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{item.category}</td>
                    <td className="px-5 py-4 font-medium text-slate-950">{item.stock_on_hand}</td>
                    <td className="px-5 py-4 text-slate-700">{item.reorder_level}</td>
                    <td className="px-5 py-4 text-slate-700">{item.expiry_date ?? "Not tracked"}</td>
                    <td className="px-5 py-4">
                      <Badge tone={statusTone[item.status]} className="capitalize">
                        {item.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-950">
                      {formatUgandanCurrency(item.unit_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <InventorySnapshot items={data.inventory} title="Restocking watch" />
      </div>
    </div>
  );
}
