import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetric } from "@/lib/types";
import { cn } from "@/lib/utils";

const toneStyles = {
  blue: "bg-sky-50 text-sky-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
};

export function StatCard({
  metric,
  icon: Icon,
}: {
  metric: DashboardMetric;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            {metric.value}
          </p>
          <p className="mt-2 text-sm text-slate-600">{metric.change}</p>
        </div>
        <div className={cn("grid size-11 shrink-0 place-items-center rounded-lg", toneStyles[metric.tone])}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}
