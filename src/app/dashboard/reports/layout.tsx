import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function ReportsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/reports");

  return children;
}
