import { Suspense } from "react";
import { PasswordResetForm } from "@/components/auth/password-reset-form";

export const metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <PasswordResetForm />
    </Suspense>
  );
}
