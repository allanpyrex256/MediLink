import { NextRequest, NextResponse } from "next/server";
import {
  DEMO_ACCOUNT_COOKIE,
  DEMO_WORKSPACE_COOKIE,
  demoAccountOptions,
  demoWorkspaceIdForSlug,
  normalizeDemoWorkspaceId,
} from "@/lib/demo-session";
import { isDemoModeAllowed } from "@/lib/config";
import { cookieDomainForHost, isLocalDevelopmentHost } from "@/lib/tenant-host";
import type { UserRole } from "@/lib/types";

const demoRoles: UserRole[] = ["owner", "seller", "pharmacist", "admin", "receptionist"];

function safeNextPath(value: string | null) {
  if (!value) return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function safeDemoRole(value: string | null): UserRole | null {
  return demoRoles.includes(value as UserRole) ? (value as UserRole) : null;
}

function originFromRequest(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProto ? `${forwardedProto}:` : request.nextUrl.protocol;

  return host ? `${protocol}//${host}` : request.nextUrl.origin;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  if (!isDemoModeAllowed()) {
    return NextResponse.redirect(new URL("/login", originFromRequest(request)));
  }

  const { workspaceId } = await params;
  const demoWorkspaceId = demoWorkspaceIdForSlug(workspaceId) ?? normalizeDemoWorkspaceId(workspaceId);
  const requestedAccount = request.nextUrl.searchParams.get("account");
  const requestedAccountEmail = requestedAccount?.toLowerCase().trim();
  const requestedAccountPhone = requestedAccount?.replace(/\s/g, "");
  const requestedRole = safeDemoRole(request.nextUrl.searchParams.get("role"));
  const demoAccount =
    demoAccountOptions.find(
      (account) =>
        account.workspaceId === demoWorkspaceId &&
        Boolean(requestedAccount) &&
        (account.email === requestedAccountEmail ||
          account.phone.replace(/\s/g, "") === requestedAccountPhone),
    ) ??
    demoAccountOptions.find(
      (account) =>
        account.workspaceId === demoWorkspaceId &&
        account.role === (requestedRole ?? "owner"),
    );
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const response = NextResponse.redirect(new URL(next, originFromRequest(request)));
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
