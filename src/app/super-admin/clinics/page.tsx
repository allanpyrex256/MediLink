import {
  PlatformSectionHeader,
  TenantDirectory,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { platformTenants } from "@/lib/platform-demo";

export const metadata = {
  title: "Clinics | MediLink",
};

export default function ClinicsPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Tenant management"
        title="Clinics"
        description="Manage smaller outpatient clinics, renewal dates, subscription status, and account activity."
        icon={sectionIcons.clinics}
      />
      <TenantDirectory tenants={platformTenants} kind="clinic" />
    </div>
  );
}
