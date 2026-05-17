"use client";

import { CalendarPlus, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateDailySlots } from "@/lib/appointments";
import type { Doctor, Patient, Tenant } from "@/lib/types";

export function AppointmentBooking({
  tenant,
  doctors,
  patients,
}: {
  tenant: Tenant;
  doctors: Doctor[];
  patients: Patient[];
}) {
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [slot, setSlot] = useState("");
  const [reason, setReason] = useState("General consultation");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId) ?? doctors[0];
  const slots = useMemo(
    () => generateDailySlots(new Date(`${date}T00:00:00`), doctors).filter((item) => item.doctorId === doctorId),
    [date, doctorId, doctors],
  );

  async function book() {
    if (!selectedDoctor || !slot || !patientId) return;
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          doctorId,
          patientId,
          scheduledAt: slot,
          durationMinutes: 30,
          reason,
          fee: selectedDoctor.consultation_fee,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to book slot");

      setStatus("Appointment request created. Confirm payment to lock the visit.");
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Unable to book appointment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book appointment</CardTitle>
        <CardDescription>Real-time-ready slot selection with tenant-safe API validation.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Doctor" value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.full_name} · {doctor.specialization}
              </option>
            ))}
          </Select>
          <Select label="Patient" value={patientId} onChange={(event) => setPatientId(event.target.value)}>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </Select>
        </div>
        <Input label="Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Available slots</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {slots.map((item) => (
              <button
                key={item.iso}
                type="button"
                onClick={() => setSlot(item.iso)}
                className={
                  slot === item.iso
                    ? "h-10 rounded-lg bg-sky-600 text-sm font-semibold text-white"
                    : "h-10 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-sky-300"
                }
              >
                {item.time}
              </button>
            ))}
          </div>
        </div>
        <Textarea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
        {status ? <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{status}</p> : null}
        <Button onClick={book} disabled={loading || !slot}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />}
          Create appointment
        </Button>
      </CardContent>
    </Card>
  );
}
