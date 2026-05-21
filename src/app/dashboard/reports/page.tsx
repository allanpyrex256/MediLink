import { BarChart3, Download, Eye, FileText, TrendingUp } from "lucide-react";
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
  const reportPacks = isPharmacy
    ? [
        { label: "Daily sales ledger", href: "/api/documents/daily-sales-ledger" },
        { label: "Inventory reorder watch", href: "/api/documents/inventory-reorder-watch" },
        { label: "Mobile money reconciliation", href: "/api/documents/mobile-money-reconciliation" },
        { label: "Sales growth", href: "/api/documents/sales-growth" },
      ]
    : [
        { label: "Daily appointment register", href: "/api/documents/daily-appointment-register" },
        { label: "Doctor utilization", href: "/api/documents/doctor-utilization" },
        { label: "Mobile money reconciliation", href: "/api/documents/mobile-money-reconciliation" },
        { label: "Patient growth", href: "/api/documents/patient-growth" },
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
              {isPharmacy ? "Monthly counter sales collections and demand signal." : "Monthly appointment collections and demand signal."}
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
            {reportPacks.map((item) => (
              <div key={item.href} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={`${item.href}?disposition=inline`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-transparent px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-sky-50 hover:text-slate-950"
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    View
                  </a>
                  <a
                    href={item.href}
                    download
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-transparent px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-sky-50 hover:text-slate-950"
                  >
                    <Download className="size-4" aria-hidden="true" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
