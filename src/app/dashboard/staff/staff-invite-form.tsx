"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Send } from "lucide-react";
import { inviteStaffMember, type StaffInviteState } from "@/app/dashboard/staff/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { TenantKind, UserRole } from "@/lib/types";

type StaffRole = Exclude<UserRole, "patient">;

const initialState: StaffInviteState = {
  message: "",
  status: "idle",
};

const roleOptions: Array<{
  description: string;
  label: string;
  tenantKinds: TenantKind[];
  value: StaffRole;
}> = [
  {
    value: "admin",
    label: "Owner / Admin",
    description: "Full access to settings, staff, reports, billing, and operations.",
    tenantKinds: ["clinic", "hospital", "pharmacy", "dentistry"],
  },
  {
    value: "doctor",
    label: "Doctor",
    description: "Clinical records, appointments, prescriptions, and lab workflows.",
    tenantKinds: ["clinic", "hospital"],
  },
  {
    value: "dentist",
    label: "Dentist",
    description: "Dental records, appointments, treatment notes, and procedure follow-up.",
    tenantKinds: ["dentistry"],
  },
  {
    value: "receptionist",
    label: "Receptionist",
    description: "Front desk access for patients, appointments, invoices, and reminders.",
    tenantKinds: ["clinic", "hospital", "dentistry"],
  },
  {
    value: "pharmacist",
    label: "Pharmacist",
    description: "Inventory, prescriptions, dispensing, and pharmacy payments.",
    tenantKinds: ["clinic", "hospital", "pharmacy"],
  },
];

export function StaffInviteForm({ tenantKind }: { tenantKind: TenantKind }) {
  const [state, formAction] = useActionState(inviteStaffMember, initialState);
  const availableRoles = roleOptions.filter((role) => role.tenantKinds.includes(tenantKind));

  return (
    <form action={formAction} className="grid gap-4">
      {state.message ? (
        <div
          className={
            state.status === "success"
              ? "rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"
              : "rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800"
          }
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Full name" name="fullName" placeholder="Dr. Sarah Namusoke" required />
        <Input label="Email" name="email" type="email" placeholder="dentist@facility.ug" required />
        <Input label="Phone" name="phone" placeholder="+256 700 000 000" />
        <Select label="Role" name="role" defaultValue={availableRoles[0]?.value ?? "admin"} required>
          {availableRoles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-2">
        {availableRoles.map((role) => (
          <div key={role.value} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-950">{role.label}</p>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-600">{role.description}</p>
          </div>
        ))}
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      {pending ? "Sending invite..." : "Invite staff member"}
    </Button>
  );
}
