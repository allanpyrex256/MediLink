import {
  PlatformSectionHeader,
  TenantDirectory,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { platformTenants } from "@/lib/platform-demo";

export const metadata = {
  title: "Hospitals | MediLink",
};

export default function HospitalsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Tenant management"
        title="Hospitals"
        description="Manage all hospitals using MediLink, including subscription plan, payment status, user count, and renewal dates."
        icon={sectionIcons.hospitals}
      />
      <TenantDirectory tenants={platformTenants} kind="hospital" />
    </div>
  );
}
