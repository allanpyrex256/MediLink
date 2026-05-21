import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function BranchesLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/branches");

  return children;
}
