import {
  PlanCards,
  PlatformSectionHeader,
  TenantDirectory,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { platformTenants } from "@/lib/platform-demo";

export const metadata = {
  title: "Subscriptions | MediLink",
};

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Subscription control"
        title="Subscriptions"
        description="Track active, trial, expired, and upcoming tenant subscriptions across hospitals, clinics, and pharmacies."
        icon={sectionIcons.subscriptions}
      />
      <PlanCards />
      <div className="mt-6">
        <TenantDirectory tenants={platformTenants} />
      </div>
    </div>
  );
}
