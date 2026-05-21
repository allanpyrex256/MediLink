import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getDashboardData } from "@/lib/data/repositories";
import { canAccessDashboardPath, defaultDashboardPath } from "@/lib/rbac";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getDashboardData();
  const headerStore = await headers();
  const pathname = headerStore.get("x-medilink-pathname") ?? "/dashboard";

  if (data.user.is_platform_admin) {
    redirect("/super-admin");
  }

  if (!canAccessDashboardPath(pathname, data.user.role, data.user.is_platform_admin)) {
    redirect(defaultDashboardPath(data.user.role, data.user.is_platform_admin));
  }

  return (
    <AppShell tenant={data.tenant} user={data.user}>
      {children}
    </AppShell>
  );
}
