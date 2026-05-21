import { redirect } from "next/navigation";
import { getDashboardData } from "@/lib/data/repositories";

export default async function PrescriptionsPage() {
  const data = await getDashboardData();

  redirect(data.tenant.tenant_kind === "pharmacy" ? "/dashboard/sales" : "/dashboard/emr");
}
