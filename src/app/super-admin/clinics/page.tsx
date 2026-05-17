import {
  PlatformSectionHeader,
  TenantDirectory,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { getPlatformOverview } from "@/lib/platform-live";

export const metadata = {
  title: "Clinics | MediLink",
};

export default async function ClinicsPage() {
  const { tenants, usingLiveData } = await getPlatformOverview();

  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Tenant management"
        title="Clinics"
        description="Manage smaller outpatient clinics, renewal dates, subscription status, and account activity."
        icon={sectionIcons.clinics}
      />
      <TenantDirectory tenants={tenants} kind="clinic" allowDelete={usingLiveData} />
    </div>
  );
}
