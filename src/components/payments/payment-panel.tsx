"use client";

import { Loader2, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Appointment, PaymentProvider, Tenant } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

const providers: { value: PaymentProvider; label: string }[] = [
  { value: "flutterwave", label: "Flutterwave Mobile Money" },
  { value: "mtn_momo", label: "MTN Mobile Money" },
  { value: "airtel_money", label: "Airtel Money" },
  { value: "stripe", label: "Mastercard / Visa card" },
];

export function PaymentPanel({
  tenant,
  appointments,
}: {
  tenant: Tenant;
  appointments: Appointment[];
}) {
  const isPharmacy = tenant.tenant_kind === "pharmacy";
  const payableAppointments = appointments.filter((appointment) => appointment.payment_status !== "paid");
  const [appointmentId, setAppointmentId] = useState(payableAppointments[0]?.id ?? "");
  const [provider, setProvider] = useState<PaymentProvider>("mtn_momo");
  const [phone, setPhone] = useState(
    payableAppointments[0]?.patient?.phone ?? "+256700000000",
  );
  const [email, setEmail] = useState(
    payableAppointments[0]?.patient?.email ?? "patient@example.com",
  );
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const appointment = useMemo(
    () => payableAppointments.find((item) => item.id === appointmentId) ?? payableAppointments[0],
    [appointmentId, payableAppointments],
  );

  async function initiate() {
    if (!appointment) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant.id,
          appointmentId: appointment.id,
          patientId: appointment.patient_id,
          provider,
          amount: appointment.fee,
          currency: "UGX",
          phone,
          email,
          patientName: appointment.patient?.full_name ?? `${tenant.name} customer`,
          network: provider === "airtel_money" ? "airtel" : provider === "mtn_momo" ? "mtn" : undefined,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to initiate payment");
      setResult(`${payload.data.reference}: ${payload.data.instructions}`);
    } catch (caught) {
      setResult(caught instanceof Error ? caught.message : "Unable to initiate payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isPharmacy ? "Collect pharmacy payment" : "Collect appointment payment"}</CardTitle>
        <CardDescription>
          {isPharmacy
            ? "Initiate mobile money or card payment for prescription orders."
            : "Initiate mobile money or card payment with auditable references."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Select
          label={isPharmacy ? "Prescription order" : "Appointment"}
          value={appointmentId}
          onChange={(event) => setAppointmentId(event.target.value)}
        >
          {payableAppointments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.patient?.full_name ?? (isPharmacy ? "Customer" : "Patient")} - {formatUgandanCurrency(item.fee)}
            </option>
          ))}
        </Select>
        <Select label="Payment provider" value={provider} onChange={(event) => setProvider(event.target.value as PaymentProvider)}>
          {providers.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Mobile money phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <Input label="Receipt email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        {appointment ? (
          <div className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">
            Amount due: <span className="font-semibold text-slate-950">{formatUgandanCurrency(appointment.fee)}</span>
          </div>
        ) : null}
        {result ? <p className="rounded-lg bg-sky-50 p-3 text-sm leading-6 text-sky-800">{result}</p> : null}
        <Button onClick={initiate} disabled={!appointment || loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Smartphone className="size-4" />}
          Send payment prompt
        </Button>
      </CardContent>
    </Card>
  );
}
