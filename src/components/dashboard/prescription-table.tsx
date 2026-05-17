import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PrescriptionOrder } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

const statusTone = {
  received: "blue",
  dispensing: "amber",
  ready: "green",
  collected: "slate",
  cancelled: "rose",
} as const;

export function PrescriptionTable({
  prescriptions,
  title = "Prescription queue",
}: {
  prescriptions: PrescriptionOrder[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Customer, prescriber, medicine, fulfillment status, and value.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-emerald-50/80 text-xs uppercase tracking-[0.14em] text-slate-600">
            <tr>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Medicine</th>
              <th className="px-5 py-3 font-semibold">Prescriber</th>
              <th className="px-5 py-3 font-semibold">Due</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {prescriptions.map((prescription) => (
              <tr key={prescription.id} className="hover:bg-emerald-50/60">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-950">{prescription.patient_name}</p>
                  <p className="mt-1 text-xs text-slate-600">Qty {prescription.quantity}</p>
                </td>
                <td className="px-5 py-4 text-slate-700">{prescription.medicine}</td>
                <td className="px-5 py-4 text-slate-700">{prescription.prescriber}</td>
                <td className="px-5 py-4 text-slate-700">
                  {format(new Date(prescription.fulfillment_due), "MMM d, HH:mm")}
                </td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone[prescription.status]} className="capitalize">
                    {prescription.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-5 py-4 font-medium text-slate-950">
                  {formatUgandanCurrency(prescription.total_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
