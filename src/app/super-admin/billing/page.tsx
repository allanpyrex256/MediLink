import {
  BillingLedger,
  PlatformSectionHeader,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { platformTenants } from "@/lib/platform-demo";

export const metadata = {
  title: "Billing | MediLink",
};

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Revenue operations"
        title="Billing"
        description="Track payments, expired subscriptions, trial accounts, unpaid invoices, and upcoming renewals."
        icon={sectionIcons.billing}
      />
      <BillingLedger tenants={platformTenants} />
    </div>
  );
}
