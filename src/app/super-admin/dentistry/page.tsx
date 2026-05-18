import {
  PlatformSectionHeader,
  TenantDirectory,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { getPlatformOverview } from "@/lib/platform-live";

export const metadata = {
  title: "Dentistry | MediLink",
};

export default async function DentistryPage() {
  const { tenants, usingLiveData } = await getPlatformOverview();

  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Tenant management"
        title="Dentistry"
        description="Manage dental practices using MediLink, including chair scheduling, treatment workflow, subscription status, and account activity."
        icon={sectionIcons.dentistry}
      />
      <TenantDirectory tenants={tenants} kind="dentistry" allowDelete={usingLiveData} />
    </div>
  );
}
