import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function PrescriptionsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/prescriptions");

  return children;
}
