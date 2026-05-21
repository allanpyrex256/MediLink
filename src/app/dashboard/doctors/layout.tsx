import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function DoctorsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/doctors");

  return children;
}
