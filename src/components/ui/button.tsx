import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-sky-600 text-white shadow-md shadow-sky-300/70 hover:bg-sky-700 focus-visible:outline-sky-600",
  secondary:
    "border border-slate-400 bg-white text-slate-800 shadow-sm shadow-slate-300/70 hover:border-violet-400 hover:bg-violet-50 focus-visible:outline-sky-600",
  ghost:
    "border border-transparent text-slate-700 hover:border-slate-300 hover:bg-sky-50 hover:text-slate-950 focus-visible:outline-sky-600",
  danger:
    "bg-rose-600 text-white shadow-md shadow-rose-300/70 hover:bg-rose-700 focus-visible:outline-rose-600",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-0",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
