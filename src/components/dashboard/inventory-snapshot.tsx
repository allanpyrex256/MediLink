import { AlertTriangle, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { InventoryItem } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

const statusTone = {
  in_stock: "green",
  low_stock: "amber",
  out_of_stock: "rose",
  expiring: "amber",
} as const;

const statusLabel = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
  expiring: "Expiring",
} as const;

export function InventorySnapshot({
  items,
  title = "Inventory watchlist",
}: {
  items: InventoryItem[];
  title?: string;
}) {
  const watchedItems = items.filter((item) => item.status !== "in_stock");
  const visibleItems = watchedItems.length ? watchedItems : items.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Available quantities, reorder points, expiry dates, and unit price.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                {item.status === "in_stock" ? (
                  <PackageCheck className="size-4" />
                ) : (
                  <AlertTriangle className="size-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950">{item.name}</p>
                <p className="mt-1 truncate text-xs text-slate-600">
                  {item.sku} - {item.stock_on_hand} available - reorder at {item.reorder_level}
                </p>
              </div>
            </div>
            <div className="grid justify-items-end gap-2">
              <Badge tone={statusTone[item.status]}>{statusLabel[item.status]}</Badge>
              <span className="text-xs font-semibold text-slate-600">
                {formatUgandanCurrency(item.unit_price)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
