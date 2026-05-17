import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getDashboardData } from "@/lib/data/repositories";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getDashboardData();

  if (!data.user.is_platform_admin) {
    redirect("/dashboard");
  }

  return (
    <AppShell tenant={data.tenant} user={data.user}>
      {children}
    </AppShell>
  );
}
