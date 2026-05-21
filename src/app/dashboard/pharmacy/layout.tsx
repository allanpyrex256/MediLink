import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function PharmacyLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/pharmacy");

  return children;
}
