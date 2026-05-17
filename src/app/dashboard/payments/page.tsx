import { PaymentList } from "@/components/dashboard/payment-list";
import { PageHeading } from "@/components/dashboard/page-heading";
import { PaymentPanel } from "@/components/payments/payment-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { formatUgandanCurrency } from "@/lib/utils";

export default async function PaymentsPage() {
  const data = await getDashboardData();
  const isPharmacy = data.tenant.tenant_kind === "pharmacy";
  const paid = data.payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div>
      <PageHeading
        eyebrow={isPharmacy ? "Sales" : "Payments"}
        title={isPharmacy ? "Pharmacy sales and invoices" : "Mobile money and invoices"}
        description={
          isPharmacy
            ? "Collect prescription order payments through MTN Mobile Money, Airtel Money, Flutterwave, or Stripe."
            : "Collect appointment payments through MTN Mobile Money, Airtel Money, Flutterwave, or Stripe."
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)]">
        <PaymentPanel tenant={data.tenant} appointments={data.appointments} />
        <div className="grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle>{isPharmacy ? "Sales snapshot" : "Revenue snapshot"}</CardTitle>
              <CardDescription>
                {isPharmacy ? "Dispensing payment confirmation and invoice readiness." : "Payment confirmation and invoice readiness."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Confirmed collections</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{formatUgandanCurrency(paid)}</p>
              </div>
              <div className="flex gap-2">
                <Badge tone="green">MTN MoMo</Badge>
                <Badge tone="blue">Flutterwave</Badge>
                <Badge tone="amber">Airtel</Badge>
              </div>
            </CardContent>
          </Card>
          <PaymentList payments={data.payments} />
        </div>
      </div>
    </div>
  );
}
