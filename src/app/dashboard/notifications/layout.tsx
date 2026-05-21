import { requireDashboardPath } from "@/lib/dashboard-access";

export default async function NotificationsLayout({ children }: { children: React.ReactNode }) {
  await requireDashboardPath("/dashboard/notifications");

  return children;
}
