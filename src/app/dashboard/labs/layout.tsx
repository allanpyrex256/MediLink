import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function LabsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/labs");

  return children;
}
