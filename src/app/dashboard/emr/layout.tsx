import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function EmrLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/emr");

  return children;
}
