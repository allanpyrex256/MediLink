"use client";

import { CheckCircle2, Loader2, Pill, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Tenant } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PublicPharmacyOrder({ tenant }: { tenant: Tenant }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [medicine, setMedicine] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [prescriber, setPrescriber] = useState("");
  const [pickupOption, setPickupOption] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("mtn_momo");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string; reference?: string } | null>(null);

  async function submitOrder() {
    setStatus(null);

    if (!customerName || !phone || !medicine || Number(quantity) < 1) {
      setStatus({ kind: "error", message: "Please complete the medicine request details." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/public-pharmacy-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: tenant.slug,
          customerName,
          phone,
          medicine,
          quantity: Number(quantity),
          prescriber,
          pickupOption,
          paymentMethod,
          notes,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to send medicine request");

      setStatus({
        kind: "success",
        message: `${tenant.name} has received your medicine request. Pharmacy staff will confirm stock and pickup details.`,
        reference: payload.data?.reference,
      });
      setMedicine("");
      setNotes("");
    } catch (caught) {
      setStatus({
        kind: "error",
        message: caught instanceof Error ? caught.message : "Unable to send medicine request",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-100">
      <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
          <Pill className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#080833]">Order from {tenant.name}</h1>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
            Request medicine, refills, or prescription dispensing without entering the staff dashboard.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Full name" placeholder="Brian Kato" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          <Input label="Phone number" placeholder="+256 700 000 000" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_140px]">
          <Input label="Medicine or prescription request" placeholder="Amoxicillin 500mg, BP refill, inhaler..." value={medicine} onChange={(event) => setMedicine(event.target.value)} />
          <Input label="Quantity" type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </div>
        <Input label="Prescriber optional" placeholder="Dr. Namusoke / clinic prescription" value={prescriber} onChange={(event) => setPrescriber(event.target.value)} />
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Pickup or delivery" value={pickupOption} onChange={(event) => setPickupOption(event.target.value)}>
            <option value="pickup">Pick up at pharmacy</option>
            <option value="delivery">Request delivery</option>
          </Select>
          <Select label="Preferred payment" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            <option value="mtn_momo">MTN MoMo</option>
            <option value="airtel_money">Airtel Money</option>
            <option value="cash">Cash on pickup</option>
          </Select>
        </div>
        <Textarea
          label="Notes optional"
          placeholder="Upload flow comes later. For now, describe the prescription or dosage instructions."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />

        <div className="rounded-lg border border-dashed border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">
          <UploadCloud className="mb-2 size-5" aria-hidden="true" />
          Prescription image upload is the next step. This demo captures the request and sends it to the pharmacy queue.
        </div>

        {status ? (
          <div
            className={cn(
              "rounded-lg p-4 text-sm font-medium leading-6",
              status.kind === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
            )}
          >
            <div className="flex items-start gap-3">
              {status.kind === "success" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" /> : <Pill className="mt-0.5 size-5 shrink-0" />}
              <div>
                <p>{status.message}</p>
                {status.reference ? <p className="mt-1 font-bold">Reference: {status.reference}</p> : null}
              </div>
            </div>
          </div>
        ) : null}

        <Button onClick={submitOrder} disabled={loading} className="h-12 bg-emerald-600 text-base font-bold hover:bg-emerald-700 focus-visible:outline-emerald-600">
          {loading ? <Loader2 className="size-5 animate-spin" /> : <Pill className="size-5" />}
          Send medicine request
        </Button>
      </div>
    </div>
  );
}
