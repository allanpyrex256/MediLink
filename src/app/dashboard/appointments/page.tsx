import { redirect } from "next/navigation";
import Link from "next/link";
import { AppointmentBooking } from "@/components/appointment/appointment-booking";
import { AppointmentTable } from "@/components/dashboard/appointment-table";
import { PageHeading } from "@/components/dashboard/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/repositories";
import { tenantBookingUrl } from "@/lib/tenant-host";

export default async function AppointmentsPage() {
  const data = await getDashboardData();
  const bookingUrl = tenantBookingUrl(data.tenant);

  if (data.tenant.tenant_kind === "pharmacy") {
    redirect("/dashboard/prescriptions");
  }

  return (
    <div>
      <PageHeading
        eyebrow="Scheduling"
        title="Appointments"
        description="Book through the website, WhatsApp, or reception, then send SMS and WhatsApp reminders to reduce missed visits."
      />
      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Website booking", "Patients can request visits from the online portal."],
          ["Public booking page", `Share ${bookingUrl} when the clinic has no website.`],
          ["WhatsApp intake", "Front desk can turn WhatsApp requests into appointments."],
          ["Reception desk", "Walk-ins are captured in the same schedule ledger."],
        ].map(([title, body]) => (
          <Card key={title}>
            <CardContent>
              <p className="font-semibold text-slate-950">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
              {title === "Public booking page" ? (
                <Link
                  href={bookingUrl}
                  className="mt-3 inline-flex text-sm font-bold text-violet-600"
                >
                  Open booking page
                </Link>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.8fr)_minmax(0,1.2fr)]">
        <AppointmentBooking tenant={data.tenant} doctors={data.doctors} patients={data.patients} />
        <AppointmentTable appointments={data.appointments} title="Schedule ledger" />
      </div>
    </div>
  );
}
