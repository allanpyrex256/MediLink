import { AddInventoryItemDialog } from "@/components/dashboard/create-record-dialog";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import type { InventoryItem } from "@/lib/types";

const statusTone = {
  "In Stock": "green",
  Low: "amber",
  Out: "rose",
} as const;

export default async function InventoryPage() {
  const data = await getDashboardData();

  return (
    <div>
      <PageHeading
        eyebrow="Inventory"
        title="Drug stock and expiry"
        description="Clean stock view for item quantity, expiry, and current availability."
        actions={
          <AddInventoryItemDialog />
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Stock list</CardTitle>
          <CardDescription>Only the item, quantity, expiry, and stock status.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[620px] border-collapse text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-normal text-slate-600">
              <tr>
                <th className="px-5 py-3 font-bold">Item</th>
                <th className="w-28 px-5 py-3 font-bold">Qty</th>
                <th className="w-32 px-5 py-3 font-bold">Expiry</th>
                <th className="w-36 px-5 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.inventory.map((item) => {
                const status = stockStatus(item);

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-medium text-slate-950">{item.name}</td>
                    <td className="px-5 py-4 font-semibold text-slate-950">{item.stock_on_hand}</td>
                    <td className="px-5 py-4 text-slate-700">{expiryLabel(item)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={statusTone[status]}>
                        {status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function stockStatus(item: InventoryItem): keyof typeof statusTone {
  if (Number(item.stock_on_hand) <= 0) return "Out";
  if (Number(item.stock_on_hand) <= Number(item.reorder_level)) return "Low";
  return "In Stock";
}

function expiryLabel(item: InventoryItem) {
  if (!item.expiry_date) return "-";

  const expiry = new Date(`${item.expiry_date}T00:00:00`);
  const daysToExpiry = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);

  if (daysToExpiry <= 180) return "Soon";
  return String(expiry.getFullYear());
}
