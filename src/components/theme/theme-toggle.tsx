"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;

  window.addEventListener("storage", callback);
  window.addEventListener("medilink-theme", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("medilink-theme", callback);
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return false;

  const stored = localStorage.getItem("medilink-theme");
  if (stored) return stored === "dark";

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, () => false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("medilink-theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("medilink-theme"));
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
