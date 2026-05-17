import { Plus } from "lucide-react";

export function Logo({
  compact = false,
  label = "MediLink",
  tagline = "Healthcare Management System",
  imageUrl,
  initials = "ML",
  color = "#7c3aed",
}: {
  compact?: boolean;
  label?: string;
  tagline?: string;
  imageUrl?: string | null;
  initials?: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid size-10 place-items-center overflow-hidden rounded-lg text-white shadow-sm shadow-slate-200"
        style={{ backgroundColor: color }}
      >
        {imageUrl ? (
          <span
            aria-hidden="true"
            className="size-full bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
        ) : label === "MediLink" ? (
          <Plus className="size-7 stroke-[4]" aria-hidden="true" />
        ) : (
          <span className="text-sm font-black tracking-normal">{initials}</span>
        )}
      </div>
      {!compact ? (
        <div className="leading-tight">
          <p className="max-w-[190px] truncate text-2xl font-bold tracking-normal" style={{ color }}>
            {label}
          </p>
          <p className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
            {tagline}
          </p>
        </div>
      ) : null}
    </div>
  );
}
