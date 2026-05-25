"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { KeyRound, Loader2 } from "lucide-react";
import {
  sendTenantAdminPasswordResetOtp,
  type TenantAdminPasswordResetState,
} from "@/app/super-admin/actions";
import { Button } from "@/components/ui/button";

const initialState: TenantAdminPasswordResetState = {
  message: "",
  status: "idle",
};

export function TenantAdminPasswordResetButton({
  tenantId,
  business,
  disabled = false,
}: {
  tenantId: string;
  business: string;
  disabled?: boolean;
}) {
  const [state, formAction] = useActionState(
    sendTenantAdminPasswordResetOtp,
    initialState,
  );

  return (
    <div className="max-w-56">
      <form
        action={formAction}
        onSubmit={(event) => {
          const confirmed = window.confirm(
            `Send a MediLink password reset OTP to the owner/admin for ${business}?`,
          );

          if (!confirmed) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="tenantId" value={tenantId} />
        <ResetSubmitButton disabled={disabled} />
      </form>
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "mt-1 text-xs font-semibold leading-5 text-emerald-700"
              : "mt-1 text-xs font-semibold leading-5 text-rose-700"
          }
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}

function ResetSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="secondary" size="sm" disabled={disabled || pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <KeyRound className="size-4" aria-hidden="true" />
      )}
      {pending ? "Sending" : "Send OTP"}
    </Button>
  );
}
