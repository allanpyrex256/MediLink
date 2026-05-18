"use client";

import { format } from "date-fns";
import { CalendarClock, CheckCircle2, Loader2, Send, UserRoundCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Appointment, Doctor } from "@/lib/types";
import { cn } from "@/lib/utils";

type AppointmentAction = "approve" | "reschedule";

export function AppointmentRequestQueue({
  appointments,
  doctors,
}: {
  appointments: Appointment[];
  doctors: Doctor[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(appointments);
  const [dates, setDates] = useState(() => dateState(appointments));
  const [times, setTimes] = useState(() => timeState(appointments));
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const pending = items.filter((appointment) => appointment.status === "pending");
  const confirmed = items
    .filter((appointment) => appointment.status === "confirmed")
    .sort((left, right) => new Date(left.scheduled_at).getTime() - new Date(right.scheduled_at).getTime());

  async function decide(appointment: Appointment, action: AppointmentAction) {
    const nextDate = dates[appointment.id] ?? inputDate(appointment.scheduled_at);
    const nextTime = times[appointment.id] ?? inputTime(appointment.scheduled_at);
    const scheduledAt = new Date(`${nextDate}T${nextTime}:00`).toISOString();

    setWorking(`${appointment.id}-${action}`);
    setMessage(null);

    try {
      const response = await fetch(`/api/appointments/${encodeURIComponent(appointment.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          scheduledAt: action === "reschedule" ? scheduledAt : undefined,
          note: notes[appointment.id] ?? "",
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update appointment request.");
      }

      setItems((current) =>
        current.map((item) =>
          item.id === appointment.id
            ? {
                ...item,
                status: "confirmed",
                scheduled_at: action === "reschedule" ? scheduledAt : item.scheduled_at,
              }
            : item,
        ),
      );
      setMessage({
        kind: "success",
        text: payload.notification ?? "Appointment updated and patient notification queued.",
      });
      router.refresh();
    } catch (caught) {
      setMessage({
        kind: "error",
        text: caught instanceof Error ? caught.message : "Unable to update appointment request.",
      });
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="grid gap-5">
      {message ? (
        <div
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4 text-sm font-semibold leading-6",
            message.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800",
          )}
        >
          {message.kind === "success" ? (
            <Send className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          ) : (
            <CalendarClock className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          )}
          <span>{message.text}</span>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Requested appointments</CardTitle>
          <CardDescription>
            Approve the requested time or choose a new date and time before the patient is notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {pending.length ? (
            pending.map((appointment) => (
              <article
                key={appointment.id}
                className="rounded-lg border border-amber-200 bg-amber-50/60 p-4"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="amber">Requested</Badge>
                      <span className="text-xs font-bold uppercase tracking-normal text-slate-500">
                        {format(new Date(appointment.created_at), "MMM d, HH:mm")}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-slate-950">
                      {appointment.patient?.full_name ?? "Patient request"}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {appointment.patient?.phone ?? "No phone recorded"}
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InfoBlock label="Requested time" value={format(new Date(appointment.scheduled_at), "EEE, MMM d 'at' HH:mm")} />
                      <InfoBlock label="Requested doctor" value={doctorLabel(appointment, doctors)} />
                    </div>
                    <p className="mt-4 rounded-lg bg-white/80 p-3 text-sm font-medium leading-6 text-slate-700">
                      {appointment.reason}
                    </p>
                  </div>

                  <div className="grid gap-3 rounded-lg border border-white bg-white p-4 shadow-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="New date"
                        type="date"
                        value={dates[appointment.id] ?? inputDate(appointment.scheduled_at)}
                        onChange={(event) =>
                          setDates((current) => ({
                            ...current,
                            [appointment.id]: event.target.value,
                          }))
                        }
                      />
                      <Input
                        label="New time"
                        type="time"
                        value={times[appointment.id] ?? inputTime(appointment.scheduled_at)}
                        onChange={(event) =>
                          setTimes((current) => ({
                            ...current,
                            [appointment.id]: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <Textarea
                      label="Message note optional"
                      placeholder="Example: Please arrive 15 minutes early."
                      value={notes[appointment.id] ?? ""}
                      onChange={(event) =>
                        setNotes((current) => ({
                          ...current,
                          [appointment.id]: event.target.value,
                        }))
                      }
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button
                        onClick={() => decide(appointment, "approve")}
                        disabled={Boolean(working)}
                      >
                        {working === `${appointment.id}-approve` ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-4" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => decide(appointment, "reschedule")}
                        disabled={Boolean(working)}
                      >
                        {working === `${appointment.id}-reschedule` ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CalendarClock className="size-4" />
                        )}
                        Reschedule
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-800">
              No appointment requests are waiting for approval.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approved schedule</CardTitle>
          <CardDescription>Confirmed visits after staff approval or rescheduling.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {confirmed.length ? (
            confirmed.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    <UserRoundCheck className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-950">
                      {appointment.patient?.full_name ?? "Patient"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {format(new Date(appointment.scheduled_at), "EEE, MMM d 'at' HH:mm")} · {doctorLabel(appointment, doctors)}
                    </p>
                  </div>
                </div>
                <Badge tone="green">Approved</Badge>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm font-semibold text-slate-600">
              Approved appointments will appear here after requests are accepted.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-amber-100 bg-white/80 p-3">
      <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function doctorLabel(appointment: Appointment, doctors: Doctor[]) {
  const doctor = appointment.doctor ?? doctors.find((item) => item.id === appointment.doctor_id);

  if (!doctor) return "Doctor to assign";

  return `${doctor.full_name} · ${doctor.specialization}`;
}

function dateState(appointments: Appointment[]) {
  return Object.fromEntries(
    appointments.map((appointment) => [appointment.id, inputDate(appointment.scheduled_at)]),
  );
}

function timeState(appointments: Appointment[]) {
  return Object.fromEntries(
    appointments.map((appointment) => [appointment.id, inputTime(appointment.scheduled_at)]),
  );
}

function inputDate(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function inputTime(value: string) {
  const date = new Date(value);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}
