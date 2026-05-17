import {
  PlatformSectionHeader,
  TenantDirectory,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { platformTenants } from "@/lib/platform-demo";

export const metadata = {
  title: "Pharmacies | MediLink",
};

export default function PharmaciesPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Tenant management"
        title="Pharmacies"
        description="Manage subscribed pharmacy businesses, stock-module plans, renewal status, and account activity."
        icon={sectionIcons.pharmacies}
      />
      <TenantDirectory tenants={platformTenants} kind="pharmacy" />
    </div>
  );
}
