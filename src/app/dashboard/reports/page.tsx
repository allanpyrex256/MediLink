import { BarChart3, Download, FileText, TrendingUp } from "lucide-react";
import { PageHeading } from "@/components/dashboard/page-heading";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { WorkflowActionButton } from "@/components/dashboard/workflow-action-button";
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
        {
          label: "Unpaid invoices",
          value: "UGX 32K",
          change: "1 pending pharmacy sale",
          tone: "blue" as const,
          icon: FileText,
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
        {
          label: "Unpaid invoices",
          value: "UGX 80K",
          change: "1 pending payment",
          tone: "amber" as const,
          icon: FileText,
        },
      ];
  const metrics = [
    { ...reportMetrics[0], icon: TrendingUp },
    { ...reportMetrics[1], icon: BarChart3 },
    { ...reportMetrics[2], icon: FileText },
  ];

  return (
    <div>
      <PageHeading
        eyebrow="Reports"
        title={`${brand.name} reports`}
        description={
          isPharmacy
            ? "Operational analytics for sales, prescription volume, inventory risk, and payment status."
            : "Operational analytics for revenue, care volume, patient retention, and payment risk."
        }
        actions={
          <WorkflowActionButton
            title="Download report"
            description="PDF export is ready to connect to a generated report file with the current revenue, billing, and operations data."
          >
            <Download className="size-4" />
            Download PDF
          </WorkflowActionButton>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.label} metric={metric} icon={metric.icon} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
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
              {isPharmacy ? "Monthly prescription order collections and demand signal." : "Monthly appointment collections and demand signal."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={data.revenue} volumeLabel={isPharmacy ? "Orders" : "Appointments"} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Report packs</CardTitle>
            <CardDescription>Prepared exports for {brand.name} leadership.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(isPharmacy
              ? ["Daily prescription ledger", "Inventory reorder watch", "Mobile money reconciliation", "Sales growth"]
              : ["Daily appointment register", "Doctor utilization", "Mobile money reconciliation", "Patient growth"]
            ).map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                <span className="text-sm font-medium text-slate-700">{item}</span>
                <WorkflowActionButton
                  variant="ghost"
                  title={item}
                  description={`${item} opens a prepared report workflow. The next step is to generate the detailed table/export from Supabase data.`}
                >
                  Open
                </WorkflowActionButton>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
