"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { PrescriptionOrder } from "@/lib/types";

export function PrescriptionOrderActions({ order }: { order: PrescriptionOrder }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const canNotify =
    Boolean(order.customer_phone) &&
    !order.ready_notification_sent_at &&
    order.status !== "collected" &&
    order.status !== "cancelled";

  async function markReadyAndNotify() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/prescription-orders/${encodeURIComponent(order.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_ready" }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to notify the customer.");
      }

      setMessage(payload.notification?.message ?? "Customer notified.");
      router.refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to notify the customer.");
    } finally {
      setLoading(false);
    }
  }

  if (order.ready_notification_sent_at) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        WhatsApp sent
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Button
        size="sm"
        variant={canNotify ? "primary" : "secondary"}
        onClick={markReadyAndNotify}
        disabled={!canNotify || loading}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {order.status === "ready" ? "Notify customer" : "Ready & notify"}
      </Button>
      {!order.customer_phone ? (
        <p className="text-xs font-semibold leading-5 text-amber-700">Add customer phone first.</p>
      ) : null}
      {message ? <p className="max-w-48 text-xs font-semibold leading-5 text-slate-600">{message}</p> : null}
    </div>
  );
}
