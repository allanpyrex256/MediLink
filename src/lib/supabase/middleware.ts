import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { appConfig, hasSupabaseConfig, isDemoModeAllowed } from "@/lib/config";
import {
  DEMO_ACCOUNT_COOKIE,
  DEMO_WORKSPACE_COOKIE,
  demoAccountForEmail,
  demoWorkspaceIdForSlug,
  isDemoWorkspaceId,
} from "@/lib/demo-session";
import { canAccessDashboardPath, defaultDashboardPath } from "@/lib/rbac";
import {
  AUTH_TAB_HEADER,
  AUTH_TAB_QUERY_PARAM,
  authCookieNameForTab,
  normalizeAuthTabId,
} from "@/lib/supabase/session-scope";
import {
  cookieDomainForHost,
  isLocalDevelopmentHost,
  tenantSlugFromHost,
} from "@/lib/tenant-host";

const protectedPrefixes = ["/dashboard", "/super-admin"];

function requestWithPathHeader(request: NextRequest, authTabId: string | null) {
  const headers = new Headers(request.headers);
  headers.set("x-medilink-pathname", request.nextUrl.pathname);
  if (authTabId) {
    headers.set(AUTH_TAB_HEADER, authTabId);
  } else {
    headers.delete(AUTH_TAB_HEADER);
  }

  return { headers };
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authTabId = authTabFromRequest(request);
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const demoAllowed = isDemoModeAllowed();
  const hostWorkspaceId = demoAllowed
    ? demoWorkspaceIdForSlug(tenantSlugFromHost(request.headers.get("host")))
    : null;
  if (hostWorkspaceId) {
    request.cookies.set(DEMO_WORKSPACE_COOKIE, hostWorkspaceId);
  }
  const effectiveWorkspaceId =
    hostWorkspaceId ??
    (demoAllowed ? request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value : undefined);
  const demoAccount = demoAllowed
    ? demoAccountForEmail(request.cookies.get(DEMO_ACCOUNT_COOKIE)?.value)
    : null;
  const hasDemoSession =
    demoAllowed &&
    (isDemoWorkspaceId(effectiveWorkspaceId) || Boolean(demoAccount));

  if (hasDemoSession || (!hasSupabaseConfig() && demoAllowed)) {
    if (isProtected && !isDemoWorkspaceId(effectiveWorkspaceId)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (
      isProtected &&
      demoAccount &&
      !canAccessDashboardPath(pathname, demoAccount.role, demoAccount.isPlatformAdmin)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = defaultDashboardPath(demoAccount.role, demoAccount.isPlatformAdmin);
      return NextResponse.redirect(url);
    }

    if ((pathname === "/login" || pathname === "/register") && isDemoWorkspaceId(effectiveWorkspaceId)) {
      const url = request.nextUrl.clone();
      url.pathname = defaultDashboardPath(demoAccount?.role, demoAccount?.isPlatformAdmin);
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next({ request: requestWithPathHeader(request, authTabId) });
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

  if (!hasSupabaseConfig()) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request: requestWithPathHeader(request, authTabId) });
  }

  let supabaseResponse = NextResponse.next({ request: requestWithPathHeader(request, authTabId) });

  const supabase = createServerClient(
    appConfig.supabaseUrl as string,
    appConfig.supabaseAnonKey as string,
    {
      cookieOptions: {
        name: authCookieNameForTab(authTabId),
        path: "/",
        sameSite: "lax",
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request: requestWithPathHeader(request, authTabId) });
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
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  const { data: profile } = user
    ? await supabase
        .from("users")
        .select("role, tenant_id, is_platform_admin")
        .eq("id", user.id)
        .single()
    : { data: null };

  if (isProtected && pathname.startsWith("/dashboard") && profile && !profile.is_platform_admin) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("status")
      .eq("id", profile.tenant_id)
      .single();
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, trial_ends_at")
      .eq("tenant_id", profile.tenant_id)
      .order("created_at", { ascending: false })
      .limit(1);
    const accountStatus = tenantAccessStatus(tenant?.status, subscriptions?.[0]);

    if (accountStatus !== "open") {
      const url = request.nextUrl.clone();
      url.pathname = "/account-paused";
      url.searchParams.set("status", accountStatus);
      return NextResponse.redirect(url);
    }
  }

  if (isProtected && profile && !canAccessDashboardPath(pathname, profile.role, profile.is_platform_admin)) {
    const url = request.nextUrl.clone();
    url.pathname = defaultDashboardPath(profile.role, profile.is_platform_admin);
    setAuthTabSearchParam(url, authTabId);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    const url = request.nextUrl.clone();
    url.pathname = defaultDashboardPath(profile?.role, profile?.is_platform_admin);
    setAuthTabSearchParam(url, authTabId);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

function tenantAccessStatus(
  tenantStatus: string | null | undefined,
  subscription?: {
    status?: string | null;
    current_period_end?: string | null;
    trial_ends_at?: string | null;
  } | null,
) {
  if (tenantStatus === "disabled" || subscription?.status === "cancelled") return "disabled";
  if (tenantStatus === "past_due" || subscription?.status === "past_due") return "past_due";
  if (
    subscription?.status === "trialing" &&
    isPastDate(subscription.trial_ends_at ?? subscription.current_period_end)
  ) {
    return "past_due";
  }

  return "open";
}

function isPastDate(value: string | null | undefined) {
  if (!value) return false;

  return new Date(value).getTime() < Date.now();
}

function authTabFromRequest(request: NextRequest) {
  return normalizeAuthTabId(
    request.nextUrl.searchParams.get(AUTH_TAB_QUERY_PARAM) ??
      request.headers.get(AUTH_TAB_HEADER) ??
      authTabFromReferer(request.headers.get("referer")),
  );
}

function authTabFromReferer(referer: string | null) {
  if (!referer) return null;

  try {
    return new URL(referer).searchParams.get(AUTH_TAB_QUERY_PARAM);
  } catch {
    return null;
  }
}

function setAuthTabSearchParam(url: URL, authTabId: string | null) {
  if (authTabId) {
    url.searchParams.set(AUTH_TAB_QUERY_PARAM, authTabId);
  } else {
    url.searchParams.delete(AUTH_TAB_QUERY_PARAM);
  }
}
