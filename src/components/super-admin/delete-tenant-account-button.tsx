"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { deleteTenantAccount } from "@/app/super-admin/actions";
import { Button } from "@/components/ui/button";

export function DeleteTenantAccountButton({
  tenantId,
  business,
  disabled = false,
}: {
  tenantId: string;
  business: string;
  disabled?: boolean;
}) {
  return (
    <form
      action={deleteTenantAccount}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete ${business}? This removes the tenant workspace, users, and related records.`,
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="tenantId" value={tenantId} />
      <DeleteSubmitButton disabled={disabled} />
    </form>
  );
}

function DeleteSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="danger" size="sm" disabled={disabled || pending}>
      <Trash2 className="size-4" aria-hidden="true" />
      {pending ? "Deleting" : "Delete"}
    </Button>
  );
}
