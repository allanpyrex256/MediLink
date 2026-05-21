import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function SuppliersLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/suppliers");

  return children;
}
