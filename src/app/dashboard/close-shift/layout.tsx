import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function CloseShiftLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/close-shift");

  return children;
}
