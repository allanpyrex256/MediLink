import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { appConfig, hasSupabaseConfig } from "@/lib/config";
import {
  DEMO_WORKSPACE_COOKIE,
  demoWorkspaceIdForSlug,
  isDemoWorkspaceId,
} from "@/lib/demo-session";
import {
  cookieDomainForHost,
  isLocalDevelopmentHost,
  tenantSlugFromHost,
} from "@/lib/tenant-host";

const protectedPrefixes = ["/dashboard", "/super-admin"];

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!hasSupabaseConfig()) {
    const hostWorkspaceId = demoWorkspaceIdForSlug(
      tenantSlugFromHost(request.headers.get("host")),
    );
    if (hostWorkspaceId) {
      request.cookies.set(DEMO_WORKSPACE_COOKIE, hostWorkspaceId);
    }
    const effectiveWorkspaceId =
      hostWorkspaceId ?? request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value;

    if (isProtected && !isDemoWorkspaceId(effectiveWorkspaceId)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if ((pathname === "/login" || pathname === "/register") && isDemoWorkspaceId(effectiveWorkspaceId)) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next({ request });
    if (hostWorkspaceId) {
      const cookieDomain = cookieDomainForHost(request.headers.get("host"));
      response.cookies.set(DEMO_WORKSPACE_COOKIE, hostWorkspaceId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
        secure:
          process.env.NODE_ENV === "production" &&
          !isLocalDevelopmentHost(request.headers.get("host")),
        ...(cookieDomain ? { domain: cookieDomain } : {}),
      });
    }

    return response;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    appConfig.supabaseUrl as string,
    appConfig.supabaseAnonKey as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
