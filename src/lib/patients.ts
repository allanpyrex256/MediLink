import { z } from "zod";
import type { Patient } from "@/lib/types";

export const patientCreateSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  sex: z.enum(["female", "male", "other"]).default("other"),
  dateOfBirth: z
    .string()
    .date()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  address: z
    .string()
    .trim()
    .max(160)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  nextOfKin: z
    .string()
    .trim()
    .max(160)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  medicalHistory: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  allergies: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
});

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;

export function buildPatientInsert(input: PatientCreateInput, tenantId: string) {
  return {
    tenant_id: tenantId,
    user_id: null,
    full_name: input.fullName,
    date_of_birth: input.dateOfBirth ?? null,
    sex: input.sex,
    phone: input.phone,
    email: null,
    national_id: null,
    medical_history: listFromText(input.medicalHistory),
    allergies: listFromText(input.allergies),
    emergency_contact: emergencyContactFromText(input.nextOfKin),
    metadata: {
      address: input.address ?? null,
      notes: input.notes ?? null,
      source: "dashboard_add_patient",
    },
  };
}

export function buildLocalDemoPatient(input: PatientCreateInput, tenantId: string): Patient {
  return {
    ...buildPatientInsert(input, tenantId),
    id: `local-pat-${crypto.randomUUID()}`,
    created_at: new Date().toISOString(),
  };
}

function listFromText(value: string | undefined) {
  if (!value) return [];

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function emergencyContactFromText(value: string | undefined) {
  if (!value) return null;

  const [name, ...phoneParts] = value.split(/\s[-,]\s|[-,]/);
  return {
    name: name.trim(),
    phone: phoneParts.join(" ").trim(),
  };
}
