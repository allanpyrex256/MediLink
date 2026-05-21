import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function InventoryLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/inventory");

  return children;
}
