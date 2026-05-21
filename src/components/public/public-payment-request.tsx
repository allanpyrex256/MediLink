"use client";

import { Banknote, CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Tenant } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PublicPaymentRequest({ tenant }: { tenant: Tenant }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [provider, setProvider] = useState<"mtn_momo" | "airtel_money">("mtn_momo");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string; reference?: string } | null>(null);

  async function submitPaymentRequest() {
    setStatus(null);

    if (!customerName || !phone || !amount || Number(amount) <= 0 || !reason) {
      setStatus({ kind: "error", message: "Please complete all payment details." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/public-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: tenant.slug,
          customerName,
          phone,
          amount: Number(amount),
          reason,
          provider,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to send payment request");

      setStatus({
        kind: "success",
        message: `${tenant.name} has received your payment request. Staff will reconcile it with your visit, order, or invoice.`,
        reference: payload.data?.reference,
      });
      setReason("");
      setAmount("");
    } catch (caught) {
      setStatus({
        kind: "error",
        message: caught instanceof Error ? caught.message : "Unable to send payment request",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-100">
      <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
          <Banknote className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#080833]">Pay {tenant.name}</h1>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
            Send a payment request for appointments, medicines, invoices, or clinic services.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Full name" placeholder="Sarah Nakato" value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
          <Input label="Phone number" placeholder="+256 700 000 000" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Amount in UGX" type="number" min="1000" placeholder="50000" value={amount} onChange={(event) => setAmount(event.target.value)} />
          <Select label="Payment method" value={provider} onChange={(event) => setProvider(event.target.value as typeof provider)}>
            <option value="mtn_momo">MTN MoMo</option>
            <option value="airtel_money">Airtel Money</option>
          </Select>
        </div>
        <Textarea
          label="What are you paying for?"
          placeholder="Consultation, invoice number, lab test, medicine order, or clinic service"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />

        {status ? (
          <div
            className={cn(
              "rounded-lg p-4 text-sm font-medium leading-6",
              status.kind === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
            )}
          >
            <div className="flex items-start gap-3">
              {status.kind === "success" ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" /> : <Smartphone className="mt-0.5 size-5 shrink-0" />}
              <div>
                <p>{status.message}</p>
                {status.reference ? <p className="mt-1 font-bold">Reference: {status.reference}</p> : null}
              </div>
            </div>
          </div>
        ) : null}

        <Button onClick={submitPaymentRequest} disabled={loading} className="h-12 bg-emerald-600 text-base font-bold hover:bg-emerald-700 focus-visible:outline-emerald-600">
          {loading ? <Loader2 className="size-5 animate-spin" /> : <Smartphone className="size-5" />}
          Send payment request
        </Button>
      </div>
    </div>
  );
}
