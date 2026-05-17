import {
  PlanCards,
  PlatformSectionHeader,
  sectionIcons,
} from "@/components/super-admin/platform-sections";

export const metadata = {
  title: "Subscription Plans | MediLink",
};

export default function PlansPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Pricing"
        title="Subscription Plans"
        description="Manage Starter, Pro, and Enterprise plans for hospitals, clinics, and pharmacies."
        icon={sectionIcons.plans}
      />
      <PlanCards />
    </div>
  );
}
