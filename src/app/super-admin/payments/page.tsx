import {
  BillingLedger,
  PlatformSectionHeader,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { getPlatformOverview } from "@/lib/platform-live";

export const metadata = {
  title: "Payments | MediLink",
};

export default async function PaymentsPage() {
  const { tenants } = await getPlatformOverview();

  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Payment follow-up"
        title="Payments"
        description="Follow MTN MoMo, Airtel Money, bank transfer, trial, expired, and unpaid subscription accounts."
        icon={sectionIcons.payments}
      />
      <BillingLedger tenants={tenants} />
    </div>
  );
}
