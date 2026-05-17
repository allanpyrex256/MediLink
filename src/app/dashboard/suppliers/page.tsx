import { PackageCheck, Truck } from "lucide-react";
import { redirect } from "next/navigation";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { formatUgandanCurrency } from "@/lib/utils";

const suppliers = [
  {
    name: "Kampala Pharmaceutical Distributors",
    contact: "+256 772 410 889",
    lastDelivery: "May 15",
    nextOrder: "May 20",
    balance: 680000,
    status: "active",
  },
  {
    name: "Joint Medical Store",
    contact: "+256 414 269 432",
    lastDelivery: "May 11",
    nextOrder: "May 22",
    balance: 420000,
    status: "pending",
  },
  {
    name: "Abacus Pharma Uganda",
    contact: "+256 752 390 114",
    lastDelivery: "May 9",
    nextOrder: "May 24",
    balance: 0,
    status: "active",
  },
  {
    name: "Quality Chemicals Ltd",
    contact: "+256 701 908 224",
    lastDelivery: "May 4",
    nextOrder: "May 27",
    balance: 240000,
    status: "review",
  },
] as const;

const statusTone = {
  active: "green",
  pending: "amber",
  review: "blue",
} as const;

export default async function SuppliersPage() {
  const data = await getDashboardData();

  if (data.tenant.tenant_kind !== "pharmacy") {
    redirect("/dashboard/pharmacy");
  }

  const payables = suppliers.reduce((sum, supplier) => sum + supplier.balance, 0);

  return (
    <div>
      <PageHeading
        eyebrow="Suppliers"
        title="Supplier and purchase orders"
        description="Track medicine suppliers, delivery dates, open balances, and reorder follow-up."
        actions={
          <Button>
            <Truck className="size-4" />
            New order
          </Button>
        }
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Summary label="Suppliers" value={String(suppliers.length)} />
        <Summary label="Pending Orders" value="3" />
        <Summary label="Open Payables" value={formatUgandanCurrency(payables)} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supplier ledger</CardTitle>
          <CardDescription>Pharmacy purchasing view for stock replenishment and payment follow-up.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Supplier</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Last Delivery</th>
                <th className="px-5 py-3 font-semibold">Next Order</th>
                <th className="px-5 py-3 font-semibold">Balance</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map((supplier) => (
                <tr key={supplier.name} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4 font-bold text-slate-950">{supplier.name}</td>
                  <td className="px-5 py-4 text-slate-700">{supplier.contact}</td>
                  <td className="px-5 py-4 text-slate-700">{supplier.lastDelivery}</td>
                  <td className="px-5 py-4 text-slate-700">{supplier.nextOrder}</td>
                  <td className="px-5 py-4 font-bold text-slate-950">
                    {supplier.balance ? formatUgandanCurrency(supplier.balance) : "Cleared"}
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone={statusTone[supplier.status]} className="capitalize">
                      {supplier.status}
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

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="grid size-12 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
          <PackageCheck className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-950">{value}</p>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
