import { Banknote, CreditCard, ReceiptText } from "lucide-react";
import { PlatformRevenueChart } from "@/components/super-admin/platform-charts";
import {
  BillingLedger,
  PlatformSectionHeader,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlatformOverview } from "@/lib/platform-live";
import { formatUsd } from "@/lib/utils";

export const metadata = {
  title: "Revenue | MediLink",
};

export default async function RevenuePage() {
  const { metrics, tenants, revenueGrowth, usingLiveData } = await getPlatformOverview();

  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Revenue operations"
        title="Revenue"
        description="Monitor monthly SaaS revenue, pending payments, active subscriptions, and tenant renewal exposure."
        icon={sectionIcons.revenue}
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Summary label="Monthly SaaS Revenue" value={formatUsd(metrics.monthlyRevenue)} icon={Banknote} />
        <Summary label="Pending Payments" value={String(metrics.pendingPayments)} icon={ReceiptText} />
        <Summary label="Active Subscriptions" value={String(metrics.activeTenants)} icon={CreditCard} />
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue growth</CardTitle>
          <CardDescription>Monthly subscription income across MediLink tenants.</CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformRevenueChart data={revenueGrowth} />
        </CardContent>
      </Card>
      <BillingLedger tenants={tenants} allowDelete={usingLiveData} />
    </div>
  );
}

function Summary({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Banknote }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="grid size-12 place-items-center rounded-lg bg-violet-100 text-violet-700">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-950">{value}</p>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
