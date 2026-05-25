"use client";

import { useEffect } from "react";
import {
  AUTH_TAB_HEADER,
  AUTH_TAB_QUERY_PARAM,
  getCurrentAuthTabId,
  getOrCreateAuthTabId,
  isProtectedAppHref,
  withAuthTabParam,
} from "@/lib/supabase/session-scope";

declare global {
  interface Window {
    __medilinkAuthFetchPatched?: boolean;
    __medilinkOriginalFetch?: typeof fetch;
  }
}

export function AuthTabScope() {
  useEffect(() => {
    const tabId = getOrCreateAuthTabId();
    if (!tabId) return;

    addAuthTabToCurrentUrl(tabId);
    patchFetch();

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target || anchor.download) return;

      const nextHref = withAuthTabParam(anchor.href, getCurrentAuthTabId());
      if (nextHref !== anchor.getAttribute("href")) {
        anchor.setAttribute("href", nextHref);
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return null;
}

function addAuthTabToCurrentUrl(tabId: string) {
  if (!isProtectedAppHref(window.location.href)) return;

  const current = new URL(window.location.href);
  if (current.searchParams.get(AUTH_TAB_QUERY_PARAM) === tabId) return;

  current.searchParams.set(AUTH_TAB_QUERY_PARAM, tabId);
  window.history.replaceState(window.history.state, "", `${current.pathname}${current.search}${current.hash}`);
}

function patchFetch() {
  if (window.__medilinkAuthFetchPatched) return;

  const originalFetch = window.fetch.bind(window);
  window.__medilinkOriginalFetch = originalFetch;
  window.__medilinkAuthFetchPatched = true;
  window.fetch = (input, init) => {
    const tabId = getCurrentAuthTabId();
    if (!tabId || !isSameOriginRequest(input)) {
      return originalFetch(input, init);
    }

    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.set(AUTH_TAB_HEADER, tabId);

    if (input instanceof Request) {
      return originalFetch(new Request(input, { ...init, headers }));
    }

    return originalFetch(input, { ...init, headers });
  };
}

function isSameOriginRequest(input: Parameters<typeof fetch>[0]) {
  const rawUrl = typeof input === "string" || input instanceof URL ? String(input) : input.url;
  const url = new URL(rawUrl, window.location.origin);

  return url.origin === window.location.origin;
}
