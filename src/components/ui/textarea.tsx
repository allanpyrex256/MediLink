import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  label,
  id,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const textareaId = id ?? props.name;

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={textareaId}>
      {label ? <span>{label}</span> : null}
      <textarea
        id={textareaId}
        className={cn(
          "min-h-24 rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm shadow-slate-300/70 outline-none transition placeholder:text-slate-400 focus:border-sky-600 focus:ring-4 focus:ring-sky-100",
          className,
        )}
        {...props}
      />
    </label>
  );
}
