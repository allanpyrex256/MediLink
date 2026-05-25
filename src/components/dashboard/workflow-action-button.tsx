"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkflowActionButton({
  children,
  description,
  title,
  variant = "primary",
}: {
  children: ReactNode;
  description: string;
  title: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {children}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-lg border border-slate-300 bg-white shadow-2xl shadow-slate-950/20"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-300 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-normal text-sky-700">Workflow action</p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">{title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                aria-label="Close workflow dialog"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                <span>{description}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                This button is now connected to a visible workflow. The next product step is to store this workflow alongside patients, stock, doctors, branches, and invoices.
              </p>
              <div className="mt-5 flex justify-end">
                <Button onClick={() => setOpen(false)}>Done</Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
