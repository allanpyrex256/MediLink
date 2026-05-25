import { createHmac, timingSafeEqual } from "node:crypto";
import { appConfig } from "@/lib/config";
import { sendEmail } from "@/lib/notifications/email";
import type { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/types";

const tenantResetRoles: UserRole[] = ["owner", "admin"];
const phoneAuthEmailSuffix = "@phone.medilink.local";
const resetOtpTtlMs = 15 * 60_000;
export const passwordResetRedirectUrl = "https://medi-link-drab.vercel.app/reset-password";

export const passwordResetOtpMessage =
  "If this is an owner or admin account, a MediLink reset OTP has been sent.";

export type PasswordResetAccount = {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  is_platform_admin: boolean;
  created_at?: string | null;
};

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;

const accountColumns =
  "id, tenant_id, email, full_name, role, phone, is_platform_admin, created_at";

export function canReceivePasswordResetOtp(
  account: Pick<PasswordResetAccount, "role" | "is_platform_admin"> | null | undefined,
) {
  return Boolean(
    account?.is_platform_admin || tenantResetRoles.includes(account?.role as UserRole),
  );
}

export function isDeliverablePasswordResetEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  return normalized.includes("@") && !normalized.endsWith(phoneAuthEmailSuffix);
}

export async function getPasswordResetAccountByEmail(
  supabase: SupabaseAdminClient,
  email: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase
    .from("users")
    .select(accountColumns)
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as PasswordResetAccount | null;
}

export async function getTenantPasswordResetAccount(
  supabase: SupabaseAdminClient,
  tenantId: string,
) {
  const { data, error } = await supabase
    .from("users")
    .select(accountColumns)
    .eq("tenant_id", tenantId)
    .in("role", tenantResetRoles)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const accounts = (data ?? []) as PasswordResetAccount[];

  return (
    accounts.find((account) => isDeliverablePasswordResetEmail(account.email)) ??
    accounts[0] ??
    null
  );
}

export async function sendPasswordResetOtp(
  supabase: SupabaseAdminClient,
  email: string,
  redirectTo: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = await getPasswordResetAccountByEmail(supabase, normalizedEmail);

  if (!account || !canReceivePasswordResetOtp(account) || !isDeliverablePasswordResetEmail(account.email)) {
    return;
  }

  await getPasswordResetAuthUser(supabase, account.id);
  const otp = createPasswordResetOtp(account);

  const delivery = await sendEmail({
    to: normalizedEmail,
    subject: "MediLink password reset OTP",
    html: passwordResetEmailHtml({
      otp,
      resetUrl: redirectTo,
    }),
  });

  if ("provider" in delivery && delivery.provider === "demo") {
    throw new Error("MediLink email delivery is not configured.");
  }
}

export async function resetPasswordWithOtp(
  supabase: SupabaseAdminClient,
  email: string,
  otp: string,
  password: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanOtp = otp.replace(/\D/g, "");
  const account = await getPasswordResetAccountByEmail(supabase, normalizedEmail);

  if (!account || !canReceivePasswordResetOtp(account) || !isDeliverablePasswordResetEmail(account.email)) {
    throw new Error("The reset OTP is invalid or expired. Request a new OTP and try again.");
  }

  const authUser = await getPasswordResetAuthUser(supabase, account.id);
  const otpValid = verifyPasswordResetOtp(account, cleanOtp);

  if (!otpValid) {
    throw new Error("The reset OTP is invalid or expired. Request a new OTP and try again.");
  }

  const { error } = await supabase.auth.admin.updateUserById(account.id, {
    password,
    user_metadata: {
      ...(authUser.user_metadata ?? {}),
      password_reset_at: new Date().toISOString(),
    },
  });

  if (error) throw new Error(error.message);
}

async function getPasswordResetAuthUser(
  supabase: SupabaseAdminClient,
  userId: string,
) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !data.user) {
    throw new Error("Password reset account was not found.");
  }

  return data.user;
}

function createPasswordResetOtp(
  account: Pick<PasswordResetAccount, "id" | "email" | "created_at">,
  window = currentOtpWindow(),
) {
  const digest = createHmac("sha256", passwordResetOtpSecret())
    .update(passwordResetOtpPayload(account, window))
    .digest();
  const value = digest.readUInt32BE(0) % 1_000_000;

  return value.toString().padStart(6, "0");
}

function verifyPasswordResetOtp(
  account: Pick<PasswordResetAccount, "id" | "email" | "created_at">,
  otp: string,
) {
  if (!/^\d{6}$/.test(otp)) return false;

  const window = currentOtpWindow();
  const candidates = [
    createPasswordResetOtp(account, window),
    createPasswordResetOtp(account, window - 1),
  ];

  return candidates.some((candidate) => secureEqual(candidate, otp));
}

function currentOtpWindow() {
  return Math.floor(Date.now() / resetOtpTtlMs);
}

function passwordResetOtpPayload(
  account: Pick<PasswordResetAccount, "id" | "email" | "created_at">,
  window: number,
) {
  return [
    "medilink-password-reset",
    account.id,
    account.email.trim().toLowerCase(),
    account.created_at ?? "",
    window,
  ].join(":");
}

function passwordResetOtpSecret() {
  const secret = appConfig.supabaseServiceRoleKey ?? appConfig.email.resendApiKey;

  if (!secret) {
    throw new Error("Password reset signing secret is not configured.");
  }

  return secret;
}

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function passwordResetEmailHtml({
  otp,
  resetUrl,
}: {
  otp: string;
  resetUrl: string;
}) {
  const escapedOtp = escapeHtml(otp);
  const escapedResetUrl = escapeHtml(resetUrl);

  return `
    <div style="margin:0;padding:24px;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
        <tr>
          <td style="padding:28px 28px 12px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0284c7;">MediLink</p>
            <h1 style="margin:0;font-size:22px;line-height:1.3;color:#020617;">Password reset OTP</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 28px 0;">
            <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">
              This message was sent from MediLink. Use this reset code within 15 minutes to create a new admin password.
            </p>
            <p style="margin:0 0 18px;padding:16px;border-radius:10px;background:#e0f2fe;text-align:center;font-size:28px;font-weight:800;letter-spacing:6px;color:#075985;">
              ${escapedOtp}
            </p>
            <p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:#64748b;">
              If you did not request this reset, you can ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 28px 28px;">
            <a href="${escapedResetUrl}" style="display:inline-block;border-radius:8px;background:#0284c7;padding:12px 18px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">
              Open MediLink reset page
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
