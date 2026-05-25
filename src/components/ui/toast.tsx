"use client";

import { useEffect } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastMessage = {
  id: number;
  kind: "success" | "error";
  title: string;
  message?: string;
};

export function ToastViewport({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(onDismiss, 6000);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast]);

  if (!toast) return null;

  const Icon = toast.kind === "success" ? CheckCircle2 : XCircle;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex w-full max-w-md items-start gap-3 rounded-lg border bg-white p-4 shadow-xl shadow-slate-200/80",
          toast.kind === "success" ? "border-emerald-200" : "border-rose-200",
        )}
      >
        <Icon
          className={cn(
            "mt-0.5 size-5 shrink-0",
            toast.kind === "success" ? "text-emerald-600" : "text-rose-600",
          )}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950">{toast.title}</p>
          {toast.message ? (
            <p className="mt-1 text-sm leading-5 text-slate-600">{toast.message}</p>
          ) : null}
        </div>
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={onDismiss}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
