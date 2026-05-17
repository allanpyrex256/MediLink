import {
  ActivityList,
  PlatformSectionHeader,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { getPlatformOverview } from "@/lib/platform-live";

export const metadata = {
  title: "Tenant Activity | MediLink",
};

export default async function ActivityPage() {
  const { tenants } = await getPlatformOverview();

  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Growth analytics"
        title="Tenant Activity"
        description="See active, quiet, and inactive businesses so you know who is healthy and who needs follow-up."
        icon={sectionIcons.activity}
      />
      <ActivityList tenants={tenants} />
    </div>
  );
}
