import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/staff");

  return children;
}
