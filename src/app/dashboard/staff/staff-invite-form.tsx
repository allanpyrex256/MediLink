"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, UserPlus } from "lucide-react";
import { inviteStaffMember, type StaffInviteState } from "@/app/dashboard/staff/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const initialState: StaffInviteState = {
  message: "",
  status: "idle",
};

const roleOptions = [
  {
    value: "seller",
    label: "Seller",
    description: "Can open shifts, record sales, view today sales, and close shifts.",
  },
  {
    value: "pharmacist",
    label: "Pharmacist",
    description: "Can manage inventory, expiry alerts, prescriptions, and dispensing.",
  },
] as const;

export function StaffInviteForm() {
  const [state, formAction] = useActionState(inviteStaffMember, initialState);

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

      <Input label="Staff full name" name="fullName" placeholder="Allan Kato" required />
      <Input label="Phone number" name="phone" type="tel" placeholder="+256 700 000 000" required />
      <PasswordStaffInput />
      <Select label="Role" name="role" defaultValue="seller" required>
        {roleOptions.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </Select>

      <div className="grid gap-2">
        {roleOptions.map((role) => (
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

function PasswordStaffInput() {
  return (
    <Input
      label="Temporary password"
      name="password"
      type="password"
      minLength={8}
      placeholder="At least 8 characters"
      required
    />
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
      Add staff account
    </Button>
  );
}
