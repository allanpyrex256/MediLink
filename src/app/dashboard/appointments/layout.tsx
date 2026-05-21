import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function AppointmentsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/appointments");

  return children;
}
