import { ReceiptText, Smartphone, WalletCards } from "lucide-react";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { formatUgandanCurrency } from "@/lib/utils";

const statusTone = {
  draft: "slate",
  issued: "blue",
  paid: "green",
  overdue: "rose",
  void: "slate",
} as const;

const payerTone = {
  cash: "amber",
  mobile_money: "green",
  insurance: "blue",
} as const;

export default async function BillingPage() {
  const data = await getDashboardData();
  const totalBilled = data.invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const totalPaid = data.invoices.reduce((sum, invoice) => sum + invoice.paid_amount, 0);
  const outstanding = totalBilled - totalPaid;

  return (
    <div>
      <PageHeading
        eyebrow="Billing and finance"
        title="Receipts, invoices, and cash tracking"
        description="Monitor receipts, invoices, cash, mobile money, and insurance balances in one finance view."
        actions={
          <>
            <Button variant="secondary">
              <Smartphone className="size-4" />
              Mobile money
            </Button>
            <Button>
              <ReceiptText className="size-4" />
              New invoice
            </Button>
          </>
        }
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-lg bg-sky-50 text-sky-700">
              <ReceiptText className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-950">{formatUgandanCurrency(totalBilled)}</p>
              <p className="text-sm text-slate-500">Total billed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Collected</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatUgandanCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm text-slate-500">Outstanding</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatUgandanCurrency(outstanding)}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.75fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Invoice ledger</CardTitle>
            <CardDescription>Billing status, payer type, receipt readiness, and balances.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Invoice</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Payer</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Paid</th>
                  <th className="px-5 py-3 font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/80">
                    <td className="px-5 py-4 font-mono text-xs text-slate-700">{invoice.invoice_number}</td>
                    <td className="px-5 py-4 font-medium text-slate-950">{invoice.customer_name}</td>
                    <td className="px-5 py-4">
                      <Badge tone={payerTone[invoice.payer_type]} className="capitalize">
                        {invoice.payer_type.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={statusTone[invoice.status]} className="capitalize">
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-950">{formatUgandanCurrency(invoice.amount)}</td>
                    <td className="px-5 py-4 text-slate-700">{formatUgandanCurrency(invoice.paid_amount)}</td>
                    <td className="px-5 py-4 font-medium text-slate-950">
                      {formatUgandanCurrency(invoice.amount - invoice.paid_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Finance controls</CardTitle>
            <CardDescription>Signals clinics use to stop revenue leakage.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ["Receipts", "Print or send official receipts after payment."],
              ["Cash tracking", "Compare front-desk cash against issued invoices."],
              ["Mobile money", "Trace MTN, Airtel, Flutterwave, and Stripe references."],
              ["Insurance", "Track claims that remain unpaid by insurers."],
            ].map(([title, body]) => (
              <div key={title} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-600">
                  <WalletCards className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{body}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
