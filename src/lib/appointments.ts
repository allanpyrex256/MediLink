import { addMinutes, format, isBefore, parseISO } from "date-fns";
import { z } from "zod";
import type { Appointment, Doctor } from "@/lib/types";

export const appointmentCreateSchema = z.object({
  tenantId: z.string().uuid(),
  doctorId: z.string().min(1),
  patientId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(180).default(30),
  reason: z.string().min(3).max(240),
  fee: z.number().min(0),
});

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;

export const publicAppointmentCreateSchema = z.object({
  tenantSlug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  doctorId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(180).default(30),
  reason: z.string().min(3).max(240),
  patientName: z.string().min(2).max(120),
  phone: z.string().min(7).max(30),
  email: z
    .string()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  sex: z.enum(["female", "male", "other"]).default("other"),
  dateOfBirth: z
    .string()
    .date()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
});

export type PublicAppointmentCreateInput = z.infer<typeof publicAppointmentCreateSchema>;

export function isSlotAvailable(
  appointments: Appointment[],
  doctorId: string,
  scheduledAt: string,
  durationMinutes: number,
) {
  const requestedStart = parseISO(scheduledAt);
  const requestedEnd = addMinutes(requestedStart, durationMinutes);

  if (isBefore(requestedStart, new Date())) {
    return false;
  }

  return !appointments.some((appointment) => {
    if (appointment.doctor_id !== doctorId) return false;
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return false;
    }

    const existingStart = parseISO(appointment.scheduled_at);
    const existingEnd = addMinutes(existingStart, appointment.duration_minutes);
    return requestedStart < existingEnd && requestedEnd > existingStart;
  });
}

export function generateDailySlots(date: Date, doctors: Doctor[]) {
  const hours = [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 14, 14.5, 15, 15.5, 16];

  return doctors.flatMap((doctor) =>
    hours.map((hour) => {
      const wholeHour = Math.floor(hour);
      const minutes = hour % 1 === 0 ? 0 : 30;
      const slot = new Date(date);
      slot.setHours(wholeHour, minutes, 0, 0);

      return {
        doctorId: doctor.id,
        doctorName: doctor.full_name,
        specialization: doctor.specialization,
        fee: doctor.consultation_fee,
        time: format(slot, "HH:mm"),
        iso: slot.toISOString(),
      };
    }),
  );
}
