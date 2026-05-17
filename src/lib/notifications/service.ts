import { sendEmail } from "@/lib/notifications/email";
import { sendWhatsApp } from "@/lib/notifications/whatsapp";
import type { Appointment, Doctor, Patient, Tenant } from "@/lib/types";

export async function sendAppointmentConfirmation(input: {
  tenant: Tenant;
  appointment: Appointment;
  doctor: Doctor;
  patient: Patient;
}) {
  const when = new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(input.appointment.scheduled_at));

  const message = `Your appointment at ${input.tenant.name} with ${input.doctor.full_name} is scheduled for ${when}.`;

  const [email, whatsapp] = await Promise.allSettled([
    input.patient.email
      ? sendEmail({
          to: input.patient.email,
          subject: `${input.tenant.name} appointment confirmation`,
          html: `<p>${message}</p>`,
        })
      : Promise.resolve({ skipped: true }),
    sendWhatsApp({
      to: input.patient.phone,
      body: message,
    }),
  ]);

  return { email, whatsapp };
}
