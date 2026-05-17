import {
  PlatformSectionHeader,
  TenantDirectory,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { getPlatformOverview } from "@/lib/platform-live";

export const metadata = {
  title: "Hospitals | MediLink",
};

export default async function HospitalsPage() {
  const { tenants } = await getPlatformOverview();

  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Tenant management"
        title="Hospitals"
        description="Manage all hospitals using MediLink, including subscription plan, payment status, user count, and renewal dates."
        icon={sectionIcons.hospitals}
      />
      <TenantDirectory tenants={tenants} kind="hospital" />
    </div>
  );
}
