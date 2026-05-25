"use client";

import { Ban, CheckCircle2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { updateTenantAccessStatus } from "@/app/super-admin/actions";
import { Button } from "@/components/ui/button";
import type { TenantStatus } from "@/lib/types";

export function TenantAccessControlButtons({
  tenantId,
  business,
  status,
  disabled = false,
}: {
  tenantId: string;
  business: string;
  status: TenantStatus;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "active" ? (
        <form action={updateTenantAccessStatus}>
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="status" value="active" />
          <AccessSubmitButton
            disabled={disabled}
            icon="accept"
            label="Accept"
            pendingLabel="Accepting"
            variant="primary"
          />
        </form>
      ) : null}
      {status !== "disabled" ? (
        <form
          action={updateTenantAccessStatus}
          onSubmit={(event) => {
            const confirmed = window.confirm(
              `Disable ${business}? Their users will not access the dashboard until the account is accepted again.`,
            );

            if (!confirmed) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="status" value="disabled" />
          <AccessSubmitButton
            disabled={disabled}
            icon="disable"
            label="Disable"
            pendingLabel="Disabling"
            variant="secondary"
          />
        </form>
      ) : null}
    </div>
  );
}

function AccessSubmitButton({
  disabled,
  icon,
  label,
  pendingLabel,
  variant,
}: {
  disabled: boolean;
  icon: "accept" | "disable";
  label: string;
  pendingLabel: string;
  variant: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  const Icon = icon === "accept" ? CheckCircle2 : Ban;

  return (
    <Button type="submit" variant={variant} size="sm" disabled={disabled || pending}>
      <Icon className="size-4" aria-hidden="true" />
      {pending ? pendingLabel : label}
    </Button>
  );
}
