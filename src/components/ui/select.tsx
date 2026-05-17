import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  label,
  id,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const selectId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={selectId}>
      {label ? <span>{label}</span> : null}
      <select
        id={selectId}
        className={cn(
          "h-11 rounded-lg border border-slate-400 bg-white px-3 text-sm text-slate-950 shadow-sm shadow-slate-300/70 outline-none transition focus:border-sky-600 focus:ring-4 focus:ring-sky-100",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
