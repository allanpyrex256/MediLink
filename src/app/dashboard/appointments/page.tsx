import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, CalendarClock, Send } from "lucide-react";
import { AppointmentRequestQueue } from "@/components/dashboard/appointment-request-queue";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { tenantBookingUrl } from "@/lib/tenant-host";

export default async function AppointmentsPage() {
  const data = await getDashboardData();
  const bookingUrl = tenantBookingUrl(data.tenant);

  if (data.tenant.tenant_kind === "pharmacy") {
    redirect("/dashboard/sales");
  }

  return (
    <div>
      <PageHeading
        eyebrow="Scheduling"
        title="Appointment requests"
        description="Review requested visits, approve the time, or reschedule before the patient receives a notification."
        actions={
          <Link
            href={bookingUrl}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm shadow-slate-100 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
          >
            Open public booking page
          </Link>
        }
      />
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <RequestStat
          label="Waiting approval"
          value={String(data.appointments.filter((item) => item.status === "pending").length)}
          detail="Needs staff decision"
          icon={CalendarClock}
        />
        <RequestStat
          label="Approved visits"
          value={String(data.appointments.filter((item) => item.status === "confirmed").length)}
          detail="Patient notification queued"
          icon={CalendarCheck}
        />
        <RequestStat
          label="Patient updates"
          value={String(data.notifications.filter((item) => item.appointment_id).length)}
          detail="SMS, WhatsApp, email, or in-app log"
          icon={Send}
        />
      </div>
      <AppointmentRequestQueue
        key={data.appointments.map((item) => `${item.id}:${item.status}:${item.scheduled_at}`).join("|")}
        appointments={data.appointments}
        doctors={data.doctors}
      />
    </div>
  );
}

function RequestStat({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof CalendarClock;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-950">{value}</p>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
