import { NextRequest, NextResponse } from "next/server";
import {
  DEMO_ACCOUNT_COOKIE,
  DEMO_WORKSPACE_COOKIE,
  demoAccountForEmail,
  demoAccountForPhone,
  normalizeDemoWorkspaceId,
} from "@/lib/demo-session";
import { isDemoModeAllowed } from "@/lib/config";
import { cookieDomainForHost, isLocalDevelopmentHost } from "@/lib/tenant-host";

function safeNextPath(value: unknown) {
  if (typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function POST(request: NextRequest) {
  if (!isDemoModeAllowed()) {
    return NextResponse.json({ error: "Demo mode is disabled." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const account = demoAccountForPhone(body.accountPhone) ?? demoAccountForEmail(body.accountEmail);
  const workspaceId = account?.workspaceId ?? normalizeDemoWorkspaceId(body.workspaceId);
  const next = safeNextPath(body.next);
  const response = NextResponse.json({ ok: true, next, workspaceId });
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

  response.cookies.set(DEMO_WORKSPACE_COOKIE, workspaceId, cookieOptions);
  if (account) {
    response.cookies.set(DEMO_ACCOUNT_COOKIE, account.email, cookieOptions);
  }

  return response;
}
