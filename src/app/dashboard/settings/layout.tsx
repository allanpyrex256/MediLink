import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/settings");

  return children;
}
