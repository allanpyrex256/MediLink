import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function ExpiryAlertsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/expiry-alerts");

  return children;
}
