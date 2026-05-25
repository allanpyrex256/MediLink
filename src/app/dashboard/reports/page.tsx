import { BarChart3, Download, Eye, TrendingUp } from "lucide-react";
import { PageHeading } from "@/components/dashboard/page-heading";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { getDashboardData } from "@/lib/data/repositories";
import { tenantBranding } from "@/lib/tenant-branding";

export default async function ReportsPage() {
  const data = await getDashboardData();
  const isPharmacy = data.tenant.tenant_kind === "pharmacy";
  const brand = tenantBranding(data.tenant);
  const reportMetrics = isPharmacy
    ? [
        {
          label: "Order completion",
          value: "91%",
          change: "Dispensed or ready orders",
          tone: "green" as const,
        },
        {
          label: "Stock alerts",
          value: String(data.inventory.filter((item) => item.status !== "in_stock").length),
          change: "Low stock or expiring drugs",
          tone: "amber" as const,
        },
      ]
    : [
        {
          label: "Patient retention",
          value: "82%",
          change: "Repeat visits across the quarter",
          tone: "green" as const,
        },
        {
          label: "Avg. wait time",
          value: "18m",
          change: "Down from 24m last month",
          tone: "blue" as const,
        },
      ];
  const metrics = [
    { ...reportMetrics[0], icon: TrendingUp },
    { ...reportMetrics[1], icon: BarChart3 },
  ];
  return (
    <div>
      <PageHeading
        eyebrow="Reports"
        title={`${brand.name} reports`}
        description={
          isPharmacy
            ? "Operational analytics for sales, inventory risk, and payment status."
            : "Operational analytics for revenue, care volume, patient retention, and payment risk."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <a
              href="/api/documents/operational-report?disposition=inline"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 shadow-sm shadow-slate-100 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
            >
              <Eye className="size-4" />
              View report
            </a>
            <a
              href="/api/documents/operational-report"
              download
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-md shadow-sky-300/70 transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <Download className="size-4" />
              Download
            </a>
          </div>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {metrics.map((metric) => (
          <StatCard key={metric.label} metric={metric} icon={metric.icon} />
        ))}
      </div>
      <div className="mt-5">
        <Card>
          <CardHeader>
            <Logo
              label={brand.name}
              tagline={brand.tagline}
              imageUrl={brand.logoUrl}
              initials={brand.initials}
              color={brand.primaryColor}
            />
            <CardTitle>{isPharmacy ? "Sales performance" : "Revenue performance"}</CardTitle>
            <CardDescription>
              {isPharmacy ? "Monthly counter sales collections and demand signal." : "Monthly appointment collections and demand signal."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenue} volumeLabel={isPharmacy ? "Orders" : "Appointments"} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
