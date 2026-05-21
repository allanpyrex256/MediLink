import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function PatientsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/patients");

  return children;
}
