import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function PaymentsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/payments");

  return children;
}
