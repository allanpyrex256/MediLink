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
  const canAccept = status === "disabled" || status === "past_due";
  const canEndTrial = status === "trialing";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canAccept ? (
        <form action={updateTenantAccessStatus}>
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="status" value="trialing" />
          <AccessSubmitButton
            disabled={disabled}
            icon="accept"
            label="Accept"
            pendingLabel="Accepting"
            variant="primary"
          />
        </form>
      ) : null}
      {canEndTrial ? (
        <form
          action={updateTenantAccessStatus}
          onSubmit={(event) => {
            const confirmed = window.confirm(
              `End the free trial for ${business}? Their admins will be asked to pay their plan before continuing.`,
            );

            if (!confirmed) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="status" value="past_due" />
          <AccessSubmitButton
            disabled={disabled}
            icon="disable"
            label="End trial"
            pendingLabel="Ending"
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
