import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "blue" | "green" | "amber" | "rose" | "slate";

const tones: Record<BadgeTone, string> = {
  blue: "bg-sky-100 text-sky-800 ring-sky-300",
  green: "bg-emerald-100 text-emerald-800 ring-emerald-300",
  amber: "bg-amber-100 text-amber-800 ring-amber-300",
  rose: "bg-rose-100 text-rose-800 ring-rose-300",
  slate: "bg-slate-100 text-slate-800 ring-slate-300",
};

export function Badge({
  tone = "slate",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
