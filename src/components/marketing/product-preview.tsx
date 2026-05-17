import { CalendarDays, CheckCircle2, Pill, TestTube2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type PreviewKind = "patients" | "hospital" | "inventory" | "labs" | "calendar" | "dashboard";

const previewConfig = {
  patients: {
    accent: "bg-violet-600",
    soft: "bg-violet-50",
    icon: Users,
    rows: ["Sarah Nansubuga", "Joseph Ssemanda", "Allen Kagimu", "Grace Namazzi"],
  },
  hospital: {
    accent: "bg-emerald-500",
    soft: "bg-emerald-50",
    icon: CheckCircle2,
    rows: ["Outpatient", "Emergency", "Radiology", "Pediatrics"],
  },
  inventory: {
    accent: "bg-orange-500",
    soft: "bg-orange-50",
    icon: Pill,
    rows: ["Paracetamol", "Amoxicillin", "ORS Sachets", "Salbutamol"],
  },
  labs: {
    accent: "bg-blue-500",
    soft: "bg-blue-50",
    icon: TestTube2,
    rows: ["Complete Blood Count", "Malaria Test", "Liver Panel", "Urinalysis"],
  },
  calendar: {
    accent: "bg-rose-500",
    soft: "bg-rose-50",
    icon: CalendarDays,
    rows: ["08:30 General", "10:00 Dental", "11:30 Antenatal", "02:00 Review"],
  },
  dashboard: {
    accent: "bg-violet-600",
    soft: "bg-violet-50",
    icon: Users,
    rows: ["Appointments", "Revenue", "Patients", "Stock Alerts"],
  },
} as const;

export function ProductPreview({
  kind = "dashboard",
  className,
  compact = false,
}: {
  kind?: PreviewKind;
  className?: string;
  compact?: boolean;
}) {
  const config = previewConfig[kind];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-300 bg-white shadow-lg shadow-slate-200/80",
        compact ? "h-[132px]" : "h-[176px]",
        className,
      )}
    >
      <div className="flex h-full">
        <div className="w-12 bg-[#070c2d] p-2">
          <div className="mb-4 grid size-6 place-items-center rounded-md bg-violet-600 text-white">
            <Icon className="size-4" aria-hidden="true" />
          </div>
          <div className="grid gap-2">
            {Array.from({ length: compact ? 5 : 7 }).map((_, index) => (
              <span key={index} className="h-1.5 rounded-full bg-white/25" />
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="h-2 w-20 rounded-full bg-slate-200" />
            <span className="size-5 rounded-full bg-amber-200" />
          </div>

          {kind === "hospital" || kind === "dashboard" ? (
            <div className="mb-3 grid grid-cols-3 gap-2">
              {[42, 72, 56].map((height) => (
                <div key={height} className={cn("rounded-md p-2", config.soft)}>
                  <span className="block h-1.5 w-10 rounded-full bg-slate-200" />
                  <span
                    className={cn("mt-2 block w-full rounded-sm", config.accent)}
                    style={{ height: `${height / 4}px` }}
                  />
                  <span className="mt-1 block h-1.5 w-8 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          ) : null}

          {kind === "calendar" ? (
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={index} className="h-7 rounded-md border border-slate-200 bg-sky-50/60 p-1">
                  {index === 7 || index === 12 ? (
                    <span className={cn("block h-3 rounded-sm", config.accent)} />
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-2">
              {config.rows.map((row, index) => (
                <div
                  key={row}
                  className="grid grid-cols-[minmax(0,1fr)_36px_36px] items-center gap-1.5 sm:grid-cols-[minmax(0,1fr)_44px_44px] sm:gap-2"
                >
                  <span className="truncate text-[10px] font-semibold text-slate-700">{row}</span>
                  <span className="h-2 rounded-full bg-slate-100" />
                  <span
                    className={cn(
                      "h-5 rounded-full text-center text-[8px] font-bold leading-5 sm:text-[9px]",
                      index % 2 === 0
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600",
                    )}
                  >
                    {index % 2 === 0 ? "Active" : "Due"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
