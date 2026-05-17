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
        description="Manage clinic, hospital, Basic Pharmacy, Advanced Pharmacy, and Enterprise plans."
        icon={sectionIcons.plans}
      />
      <PlanCards />
    </div>
  );
}
