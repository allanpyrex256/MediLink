import { AppShell } from "@/components/layout/app-shell";
import { getDashboardData } from "@/lib/data/repositories";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getDashboardData();

  return (
    <AppShell tenant={data.tenant} user={data.user}>
      {children}
    </AppShell>
  );
}
