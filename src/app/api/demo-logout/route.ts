import { NextRequest, NextResponse } from "next/server";
import { DEMO_ACCOUNT_COOKIE, DEMO_WORKSPACE_COOKIE } from "@/lib/demo-session";
import { cookieDomainForHost } from "@/lib/tenant-host";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  const cookieDomain = cookieDomainForHost(request.headers.get("host"));
  const cookieOptions = {
    maxAge: 0,
    path: "/",
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  };

  response.cookies.set(DEMO_WORKSPACE_COOKIE, "", cookieOptions);
  response.cookies.set(DEMO_ACCOUNT_COOKIE, "", cookieOptions);

  return response;
}
