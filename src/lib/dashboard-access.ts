import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/data/repositories";
import { canAccessDashboardPath, defaultDashboardPath } from "@/lib/rbac";

export async function requireDashboardPath(pathname: string) {
  const data = await getDashboardData();

  if (!canAccessDashboardPath(pathname, data.user.role, data.user.is_platform_admin)) {
    redirect(defaultDashboardPath(data.user.role, data.user.is_platform_admin));
  }

  return data;
}
