import { NextRequest, NextResponse } from "next/server";
import {
  DEMO_ACCOUNT_COOKIE,
  DEMO_WORKSPACE_COOKIE,
  demoAccountOptions,
  demoWorkspaceIdForSlug,
  normalizeDemoWorkspaceId,
} from "@/lib/demo-session";
import { cookieDomainForHost, isLocalDevelopmentHost } from "@/lib/tenant-host";
import type { UserRole } from "@/lib/types";

const demoRoles: UserRole[] = ["admin", "doctor", "dentist", "receptionist", "pharmacist", "patient"];

function safeNextPath(value: string | null) {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function safeDemoRole(value: string | null): UserRole | null {
  return demoRoles.includes(value as UserRole) ? (value as UserRole) : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const { workspaceId } = await params;
  const demoWorkspaceId = demoWorkspaceIdForSlug(workspaceId) ?? normalizeDemoWorkspaceId(workspaceId);
  const requestedAccount = request.nextUrl.searchParams.get("account");
  const requestedRole = safeDemoRole(request.nextUrl.searchParams.get("role"));
  const demoAccount =
    demoAccountOptions.find(
      (account) =>
        account.workspaceId === demoWorkspaceId &&
        requestedAccount &&
        account.email === requestedAccount.toLowerCase().trim(),
    ) ??
    demoAccountOptions.find(
      (account) =>
        account.workspaceId === demoWorkspaceId &&
        account.role === (requestedRole ?? "admin"),
    );
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, request.url));
  const cookieDomain = cookieDomainForHost(request.headers.get("host"));
  const cookieOptions = {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax" as const,
    secure:
      process.env.NODE_ENV === "production" &&
      !isLocalDevelopmentHost(request.headers.get("host")),
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };

  response.cookies.set(DEMO_WORKSPACE_COOKIE, demoWorkspaceId, cookieOptions);
  if (demoAccount) {
    response.cookies.set(DEMO_ACCOUNT_COOKIE, demoAccount.email, cookieOptions);
  }

  return response;
}
