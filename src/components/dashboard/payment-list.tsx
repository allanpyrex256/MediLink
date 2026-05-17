import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Payment } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

export function PaymentList({ payments }: { payments: Payment[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales and payments</CardTitle>
        <CardDescription>MTN MoMo, Airtel Money, cash/card references, and receipt status.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4"
          >
            <div>
              <p className="text-sm font-semibold text-slate-950">{payment.provider_reference}</p>
              <p className="mt-1 text-xs capitalize text-slate-600">
                {payment.provider.replace("_", " ")} - {payment.phone}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-slate-950">
                {formatUgandanCurrency(payment.amount, payment.currency)}
              </p>
              <Badge tone={payment.status === "paid" ? "green" : payment.status === "failed" ? "rose" : "amber"} className="capitalize">
                {payment.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
