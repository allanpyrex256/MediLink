import {
  PlatformSectionHeader,
  TenantDirectory,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { getPlatformOverview } from "@/lib/platform-live";

export const metadata = {
  title: "Pharmacies | MediLink",
};

export default async function PharmaciesPage() {
  const { tenants } = await getPlatformOverview();

  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Tenant management"
        title="Pharmacies"
        description="Manage subscribed pharmacy businesses, stock-module plans, renewal status, and account activity."
        icon={sectionIcons.pharmacies}
      />
      <TenantDirectory tenants={tenants} kind="pharmacy" />
    </div>
  );
}
