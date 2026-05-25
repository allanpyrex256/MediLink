export const AUTH_TAB_HEADER = "x-medilink-auth-tab";
export const AUTH_TAB_QUERY_PARAM = "ml_auth_tab";

const authTabSessionKey = "medilink-auth-tab";
const authCookiePrefix = "medilink-auth";
const unauthenticatedCookieName = `${authCookiePrefix}-none`;

export function authCookieNameForTab(tabId: string | null | undefined) {
  return isValidAuthTabId(tabId) ? `${authCookiePrefix}-${tabId}` : unauthenticatedCookieName;
}

export function getCurrentAuthTabId() {
  if (typeof window === "undefined") return null;

  return normalizeAuthTabId(window.sessionStorage.getItem(authTabSessionKey));
}

export function getOrCreateAuthTabId() {
  if (typeof window === "undefined") return null;

  const current = getCurrentAuthTabId();
  if (current) return current;

  const next = createAuthTabId();
  window.sessionStorage.setItem(authTabSessionKey, next);
  return next;
}

export function withAuthTabParam(href: string, tabId = getCurrentAuthTabId()) {
  if (!tabId || !isProtectedAppHref(href)) return href;

  const url = new URL(href, window.location.origin);
  url.searchParams.set(AUTH_TAB_QUERY_PARAM, tabId);

  return `${url.pathname}${url.search}${url.hash}`;
}

export function normalizeAuthTabId(value: string | null | undefined) {
  return isValidAuthTabId(value) ? value : null;
}

export function isValidAuthTabId(value: string | null | undefined): value is string {
  return Boolean(value && /^[A-Za-z0-9-]{8,80}$/.test(value));
}

export function isProtectedAppHref(href: string) {
  try {
    const url = new URL(href, typeof window === "undefined" ? "http://localhost" : window.location.origin);
    const sameOrigin = typeof window === "undefined" || url.origin === window.location.origin;

    return sameOrigin && (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/super-admin"));
  } catch {
    return false;
  }
}

function createAuthTabId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
