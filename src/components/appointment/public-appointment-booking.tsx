"use client";

import { format } from "date-fns";
import { CalendarCheck, CalendarPlus, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { generateDailySlots } from "@/lib/appointments";
import type { Appointment, Doctor, Tenant } from "@/lib/types";
import { cn, formatUgandanCurrency } from "@/lib/utils";

export function PublicAppointmentBooking({
  tenant,
  doctors,
  bookedAppointments,
}: {
  tenant: Tenant;
  doctors: Doctor[];
  bookedAppointments: Appointment[];
}) {
  const [service, setService] = useState(doctors[0]?.specialization ?? "");
  const serviceDoctors = doctors.filter((doctor) => doctor.specialization === service);
  const [doctorId, setDoctorId] = useState(serviceDoctors[0]?.id ?? doctors[0]?.id ?? "");
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 10);
  });
  const [slot, setSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sex, setSex] = useState<"female" | "male" | "other">("other");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null);
  const [confirmationReference, setConfirmationReference] = useState("");
  const [loading, setLoading] = useState(false);

  const services = Array.from(new Set(doctors.map((doctor) => doctor.specialization)));
  const selectedDoctor =
    doctors.find((doctor) => doctor.id === doctorId) ?? serviceDoctors[0] ?? doctors[0];

  const slots = selectedDoctor
    ? generateDailySlots(new Date(`${date}T00:00:00`), [selectedDoctor]).filter((item) =>
        isPublicSlotAvailable(bookedAppointments, selectedDoctor.id, item.iso, 30),
      )
    : [];

  function updateService(value: string) {
    setService(value);
    const nextDoctor = doctors.find((doctor) => doctor.specialization === value);
    setDoctorId(nextDoctor?.id ?? "");
    setSlot("");
  }

  async function bookAppointment() {
    if (!selectedDoctor || !slot || !patientName || !phone || !reason) {
      setStatus({ kind: "error", message: "Please complete the required booking details." });
      return;
    }

    setLoading(true);
    setStatus(null);
    setConfirmationReference("");

    try {
      const response = await fetch("/api/public-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: tenant.slug,
          doctorId: selectedDoctor.id,
          scheduledAt: slot,
          durationMinutes: 30,
          reason,
          patientName,
          phone,
          email,
          sex,
          dateOfBirth,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to send appointment request");

      setConfirmationReference(payload.data?.confirmationReference ?? "");
      setStatus({
        kind: "success",
        message: `${tenant.name} has received your appointment request. Reception will confirm by phone, SMS, or WhatsApp.`,
      });
      setSlot("");
      setReason("");
    } catch (caught) {
      setStatus({
        kind: "error",
        message: caught instanceof Error ? caught.message : "Unable to send appointment request",
      });
    } finally {
      setLoading(false);
    }
  }

  if (!doctors.length) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-800">
        Online booking is not available yet because this facility has not added doctors.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-violet-100">
      <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-600">
          <CalendarCheck className="size-7" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-normal text-[#080833]">Book your appointment</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
            Choose a time and send your request directly to {tenant.name}.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Service" value={service} onChange={(event) => updateService(event.target.value)}>
            {services.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            label="Doctor"
            value={doctorId}
            onChange={(event) => {
              setDoctorId(event.target.value);
              setSlot("");
            }}
          >
            {serviceDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.full_name}
              </option>
            ))}
          </Select>
        </div>

        {selectedDoctor ? (
          <div className="rounded-lg border border-violet-100 bg-violet-50/70 p-4">
            <p className="text-sm font-bold text-[#080833]">{selectedDoctor.full_name}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {selectedDoctor.specialization} in {selectedDoctor.room}
            </p>
            <p className="mt-2 text-sm font-bold text-violet-600">
              Consultation fee: {formatUgandanCurrency(selectedDoctor.consultation_fee)}
            </p>
          </div>
        ) : null}

        <Input
          label="Appointment date"
          type="date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setSlot("");
          }}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Available time</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {slots.map((item) => (
              <button
                key={item.iso}
                type="button"
                onClick={() => setSlot(item.iso)}
                className={cn(
                  "h-11 rounded-lg border text-sm font-bold transition",
                  slot === item.iso
                    ? "border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-100"
                    : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50",
                )}
              >
                {item.time}
              </button>
            ))}
          </div>
          {!slots.length ? (
            <p className="mt-2 text-sm font-medium text-amber-600">
              No open slots for this date. Please choose another day.
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Full name"
            placeholder="e.g. Sarah Nansubuga"
            value={patientName}
            onChange={(event) => setPatientName(event.target.value)}
          />
          <Input
            label="Phone number"
            placeholder="+256 700 000 000"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Email optional"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Select label="Sex" value={sex} onChange={(event) => setSex(event.target.value as typeof sex)}>
            <option value="other">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </Select>
          <Input
            label="Date of birth optional"
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
          />
        </div>

        <Textarea
          label="Reason for visit"
          placeholder="Tell the clinic what you need help with"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        {status ? (
          <div
            className={cn(
              "rounded-lg p-4 text-sm font-medium leading-6",
              status.kind === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700",
            )}
          >
            <div className="flex items-start gap-3">
              {status.kind === "success" ? (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              ) : (
                <MessageCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              )}
              <div>
                <p>{status.message}</p>
                {confirmationReference ? (
                  <p className="mt-1 font-bold">Reference: {confirmationReference}</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <Button
          onClick={bookAppointment}
          disabled={loading || !slot}
          className="h-12 bg-violet-600 text-base font-bold shadow-lg shadow-violet-100 hover:bg-violet-700 focus-visible:outline-violet-600"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : <CalendarPlus className="size-5" />}
          Request appointment
        </Button>
      </div>
    </div>
  );
}

function isPublicSlotAvailable(
  appointments: Appointment[],
  doctorId: string,
  scheduledAt: string,
  durationMinutes: number,
) {
  const requestedStart = new Date(scheduledAt);
  const requestedEnd = new Date(requestedStart.getTime() + durationMinutes * 60_000);

  if (requestedStart < new Date()) return false;

  return !appointments.some((appointment) => {
    if (appointment.doctor_id !== doctorId) return false;
    if (appointment.status === "cancelled" || appointment.status === "completed") return false;

    const existingStart = new Date(appointment.scheduled_at);
    const existingEnd = new Date(existingStart.getTime() + appointment.duration_minutes * 60_000);
    return requestedStart < existingEnd && requestedEnd > existingStart;
  });
}

export function PublicBookingSummary({
  tenant,
  doctors,
}: {
  tenant: Tenant;
  doctors: Doctor[];
}) {
  const nextAvailableDoctor = doctors.find((doctor) => doctor.status === "available") ?? doctors[0];

  return (
    <div className="grid gap-4">
      {[
        ["Location", tenant.address],
        ["Contact", `${tenant.phone} / ${tenant.email}`],
        ["Open booking", nextAvailableDoctor ? `${nextAvailableDoctor.full_name} available` : "Reception will assign a provider"],
        ["Confirmation", "Reception confirms by phone, SMS, or WhatsApp"],
      ].map(([label, value]) => (
        <div key={label} className="rounded-lg border border-white/70 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-normal text-violet-600">{label}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{value}</p>
        </div>
      ))}
      <div className="rounded-lg border border-violet-200 bg-violet-600 p-5 text-white shadow-xl shadow-violet-200">
        <p className="text-sm font-bold">What happens after booking?</p>
        <p className="mt-2 text-sm font-medium leading-6 text-violet-50">
          Your request appears inside {tenant.name}&apos;s appointments dashboard as pending.
          Staff can confirm it, check you in, and prepare your patient file.
        </p>
        <p className="mt-4 text-xs font-semibold text-violet-100">
          Today is {format(new Date(), "EEEE, d MMMM yyyy")}
        </p>
      </div>
    </div>
  );
}
