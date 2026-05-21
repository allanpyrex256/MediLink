import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function OpenShiftLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/open-shift");

  return children;
}
