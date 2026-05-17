import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Doctor } from "@/lib/types";
import { formatUgandanCurrency } from "@/lib/utils";

const tone = {
  available: "green",
  busy: "amber",
  offline: "slate",
} as const;

export function DoctorAvailability({ doctors }: { doctors: Doctor[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Doctor availability</CardTitle>
        <CardDescription>Live-ready status, room assignment, and consultation pricing.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{doctor.full_name}</p>
              <p className="truncate text-xs text-slate-600">
                {doctor.specialization} · {doctor.room} · {formatUgandanCurrency(doctor.consultation_fee)}
              </p>
            </div>
            <Badge tone={tone[doctor.status]} className="capitalize">
              {doctor.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
