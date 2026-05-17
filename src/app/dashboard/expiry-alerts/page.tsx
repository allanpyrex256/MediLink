import { AlertTriangle, PackageX } from "lucide-react";
import { redirect } from "next/navigation";
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

export default async function ExpiryAlertsPage() {
  const data = await getDashboardData();

  if (data.tenant.tenant_kind !== "pharmacy") {
    redirect("/dashboard/pharmacy");
  }

  const riskItems = data.inventory.filter((item) => item.status !== "in_stock");
  const visibleItems = riskItems.length ? riskItems : data.inventory;
  const riskValue = riskItems.reduce((sum, item) => sum + item.stock_on_hand * item.unit_price, 0);

  return (
    <div>
      <PageHeading
        eyebrow="Expiry alerts"
        title="Expiry and stock risk"
        description="Watch medicines that are expiring, low, or out of stock before they affect sales."
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Summary label="Risk Items" value={String(riskItems.length)} tone="rose" />
        <Summary label="Expiring Soon" value={String(data.inventory.filter((item) => item.status === "expiring").length)} tone="amber" />
        <Summary label="Stock At Risk" value={formatUgandanCurrency(riskValue)} tone="blue" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Medicine alerts</CardTitle>
          <CardDescription>Items that need reorder, supplier follow-up, discounting, or removal.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Medicine</th>
                <th className="px-5 py-3 font-semibold">SKU</th>
                <th className="px-5 py-3 font-semibold">Stock</th>
                <th className="px-5 py-3 font-semibold">Reorder Level</th>
                <th className="px-5 py-3 font-semibold">Expiry Date</th>
                <th className="px-5 py-3 font-semibold">Action</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4 font-bold text-slate-950">{item.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{item.sku}</td>
                  <td className="px-5 py-4 font-semibold text-slate-950">{item.stock_on_hand}</td>
                  <td className="px-5 py-4 text-slate-700">{item.reorder_level}</td>
                  <td className="px-5 py-4 text-slate-700">{item.expiry_date ?? "Not tracked"}</td>
                  <td className="px-5 py-4 text-slate-700">{actionForStatus(item.status)}</td>
                  <td className="px-5 py-4">
                    <Badge tone={statusTone[item.status]} className="capitalize">
                      {item.status.replace("_", " ")}
                    </Badge>
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

function Summary({ label, value, tone }: { label: string; value: string; tone: "amber" | "blue" | "rose" }) {
  const toneClass = {
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-sky-100 text-sky-700",
    rose: "bg-rose-100 text-rose-700",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`grid size-12 place-items-center rounded-lg ${toneClass}`}>
          {tone === "rose" ? <PackageX className="size-5" /> : <AlertTriangle className="size-5" />}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-950">{value}</p>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function actionForStatus(status: keyof typeof statusTone) {
  if (status === "out_of_stock") return "Place urgent order";
  if (status === "low_stock") return "Reorder this week";
  if (status === "expiring") return "Review expiry batch";
  return "No action needed";
}
