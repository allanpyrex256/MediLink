import { format } from "date-fns";
import { MessageCircle, Phone } from "lucide-react";
import { PrescriptionOrderActions } from "@/components/dashboard/prescription-order-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { whatsappChatUrl } from "@/lib/phone";
import type { PrescriptionOrder } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

const statusTone = {
  received: "blue",
  dispensing: "amber",
  ready: "green",
  collected: "slate",
  cancelled: "rose",
} as const;

const statusLabel = {
  received: "Received",
  dispensing: "Preparing",
  ready: "Ready",
  collected: "Picked Up",
  cancelled: "Cancelled",
} as const;

const paymentLabel = {
  mtn_momo: "MTN MoMo",
  airtel_money: "Airtel Money",
  cash: "Cash",
} as const;

export function PrescriptionTable({
  prescriptions,
  title = "Prescription Orders",
}: {
  prescriptions: PrescriptionOrder[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Customer, delivery details, prescriber, medicine, status, and customer notification.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-emerald-50/80 text-xs uppercase tracking-[0.14em] text-slate-600">
            <tr>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Medicine</th>
              <th className="px-5 py-3 font-semibold">Prescriber</th>
              <th className="px-5 py-3 font-semibold">Fulfillment</th>
              <th className="px-5 py-3 font-semibold">Order Status</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Notify</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {prescriptions.map((prescription) => (
              <tr key={prescription.id} className="hover:bg-emerald-50/60">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-950">{prescription.patient_name}</p>
                  <p className="mt-1 text-xs text-slate-600">{prescription.customer_phone ?? "No phone recorded"}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Qty {prescription.quantity}</p>
                  {prescription.customer_phone ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={whatsappChatUrl(
                          prescription.customer_phone,
                          `Hello ${prescription.patient_name}, this is the pharmacy about your medicine request for ${prescription.quantity} x ${prescription.medicine}.`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <MessageCircle className="size-3.5" aria-hidden="true" />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${prescription.customer_phone}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-sky-50 px-3 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
                      >
                        <Phone className="size-3.5" aria-hidden="true" />
                        Call
                      </a>
                    </div>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-slate-700">
                  <p>{prescription.medicine}</p>
                  {prescription.customer_notes ? (
                    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{prescription.customer_notes}</p>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-slate-700">{prescription.prescriber}</td>
                <td className="px-5 py-4 text-slate-700">
                  <p className="font-semibold capitalize text-slate-900">{prescription.fulfillment_method ?? "pickup"}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Ready by {format(new Date(prescription.fulfillment_due), "MMM d, HH:mm")}
                  </p>
                  {prescription.fulfillment_method === "delivery" && prescription.delivery_address ? (
                    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-600">{prescription.delivery_address}</p>
                  ) : null}
                  {prescription.payment_method ? (
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Payment: {paymentLabel[prescription.payment_method]}
                    </p>
                  ) : null}
                </td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone[prescription.status]}>
                    {orderStatusLabel(prescription)}
                  </Badge>
                </td>
                <td className="px-5 py-4 font-medium text-slate-950">
                  {formatUgandanCurrency(prescription.total_amount)}
                </td>
                <td className="px-5 py-4">
                  <PrescriptionOrderActions order={prescription} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function orderStatusLabel(prescription: PrescriptionOrder) {
  if (prescription.status === "ready" && prescription.fulfillment_method === "delivery") {
    return "Ready for Delivery";
  }

  if (prescription.status === "ready") return "Ready for Pickup";
  if (prescription.status === "collected" && prescription.fulfillment_method === "delivery") {
    return "Delivered";
  }

  return statusLabel[prescription.status];
}
