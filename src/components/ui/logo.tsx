import { Plus } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-200">
        <Plus className="size-7 stroke-[4]" aria-hidden="true" />
      </div>
      {!compact ? (
        <div className="leading-tight">
          <p className="text-2xl font-bold tracking-normal text-violet-600">MediLink</p>
          <p className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
            Healthcare Management System
          </p>
        </div>
      ) : null}
    </div>
  );
}
