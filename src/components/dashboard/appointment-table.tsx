import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Appointment } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

const statusTone = {
  pending: "amber",
  confirmed: "green",
  completed: "blue",
  cancelled: "rose",
} as const;

export function AppointmentTable({
  appointments,
  title = "Upcoming appointments",
}: {
  appointments: Appointment[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Doctor, patient, status, and payment signal in one scan.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-sky-50/80 text-xs uppercase tracking-[0.14em] text-slate-600">
            <tr>
              <th className="px-5 py-3 font-semibold">Patient</th>
              <th className="px-5 py-3 font-semibold">Doctor</th>
              <th className="px-5 py-3 font-semibold">Time</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Fee</th>
              <th className="px-5 py-3 font-semibold">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-sky-50/60">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-950">{appointment.patient?.full_name ?? "Patient"}</p>
                  <p className="mt-1 text-xs text-slate-600">{appointment.reason}</p>
                </td>
                <td className="px-5 py-4 text-slate-700">
                  <p>{appointment.doctor?.full_name ?? "Doctor"}</p>
                  <p className="mt-1 text-xs text-slate-600">{appointment.doctor?.specialization}</p>
                </td>
                <td className="px-5 py-4 text-slate-700">
                  {format(new Date(appointment.scheduled_at), "MMM d, HH:mm")}
                </td>
                <td className="px-5 py-4">
                  <Badge tone={statusTone[appointment.status]} className="capitalize">
                    {appointment.status}
                  </Badge>
                </td>
                <td className="px-5 py-4 font-medium text-slate-950">
                  {formatUgandanCurrency(appointment.fee)}
                </td>
                <td className="px-5 py-4">
                  <Badge tone={appointment.payment_status === "paid" ? "green" : "amber"} className="capitalize">
                    {appointment.payment_status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
