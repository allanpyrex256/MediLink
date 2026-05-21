import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function BillingLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/billing");

  return children;
}
