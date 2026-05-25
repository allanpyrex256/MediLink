import { CheckCircle2, Circle } from "lucide-react";
import { passwordChecks, passwordStrength } from "@/lib/password-policy";
import { cn } from "@/lib/utils";

const barTone = {
  slate: "bg-slate-300",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
} as const;

const textTone = {
  slate: "text-slate-500",
  rose: "text-rose-600",
  amber: "text-amber-600",
  emerald: "text-emerald-600",
} as const;

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = passwordStrength(password);
  const checks = passwordChecks(password);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Password strength</p>
        <p className={cn("text-xs font-bold", textTone[strength.tone])}>{strength.label}</p>
      </div>
      <div className="mt-2 grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 rounded-full",
              index < strength.score ? barTone[strength.tone] : "bg-slate-200",
            )}
          />
        ))}
      </div>
      <div className="mt-3 grid gap-1.5">
        {checks.map((check) => {
          const Icon = check.passed ? CheckCircle2 : Circle;

          return (
            <p
              key={check.label}
              className={cn(
                "flex items-center gap-2 text-xs font-medium",
                check.passed ? "text-emerald-700" : "text-slate-500",
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {check.label}
            </p>
          );
        })}
      </div>
    </div>
  );
}
