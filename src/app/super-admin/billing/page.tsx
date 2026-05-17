import {
  BillingLedger,
  PlatformSectionHeader,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { getPlatformOverview } from "@/lib/platform-live";

export const metadata = {
  title: "Billing | MediLink",
};

export default async function BillingPage() {
  const { tenants, usingLiveData } = await getPlatformOverview();

  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Revenue operations"
        title="Billing"
        description="Track payments, expired subscriptions, trial accounts, unpaid invoices, and upcoming renewals."
        icon={sectionIcons.billing}
      />
      <BillingLedger tenants={tenants} allowDelete={usingLiveData} />
    </div>
  );
}
