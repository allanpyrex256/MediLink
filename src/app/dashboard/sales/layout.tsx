import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function SalesLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/sales");

  return children;
}
