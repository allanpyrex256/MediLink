import {
  SubscriptionStatusChart,
  TenantGrowthChart,
} from "@/components/super-admin/platform-charts";
import {
  ActivityList,
  PlatformSectionHeader,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { platformTenants, subscriptionStatus, tenantGrowth } from "@/lib/platform-demo";

export const metadata = {
  title: "Analytics | MediLink",
};

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Growth analytics"
        title="Analytics"
        description="See tenant growth, subscription status, and active or inactive businesses across the platform."
        icon={sectionIcons.analytics}
      />
      <div className="mb-6 grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Tenant growth</CardTitle>
            <CardDescription>Hospitals, clinics, and pharmacies joining MediLink.</CardDescription>
          </CardHeader>
          <CardContent>
            <TenantGrowthChart data={tenantGrowth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscription status</CardTitle>
            <CardDescription>Active, trial, and expired tenant accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionStatusChart data={subscriptionStatus} />
          </CardContent>
        </Card>
      </div>
      <ActivityList tenants={platformTenants} />
    </div>
  );
}
