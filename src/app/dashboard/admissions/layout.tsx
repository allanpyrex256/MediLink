import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function AdmissionsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/admissions");

  return children;
}
