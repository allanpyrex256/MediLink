import {
  PlatformSectionHeader,
  TicketList,
  sectionIcons,
} from "@/components/super-admin/platform-sections";
import { supportTickets } from "@/lib/platform-demo";

export const metadata = {
  title: "Support Tickets | MediLink",
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PlatformSectionHeader
        eyebrow="Customer success"
        title="Support Tickets"
        description="Track client issues that can block onboarding, payment, renewals, or expansion."
        icon={sectionIcons.support}
      />
      <TicketList tickets={supportTickets} />
    </div>
  );
}
