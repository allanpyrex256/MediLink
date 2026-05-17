"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

type PublicNavKey =
  | "features"
  | "benefits"
  | "how-it-works"
  | "pricing"
  | "contact"
  | "solutions"
  | "screenshots"
  | "portals"
  | "resources"
  | "about";

const navItems: Array<{
  key: PublicNavKey;
  label: string;
  href: string;
}> = [
  { key: "features", label: "Features", href: "/#features" },
  { key: "benefits", label: "Benefits", href: "/#benefits" },
  { key: "how-it-works", label: "How it works", href: "/#how-it-works" },
  { key: "pricing", label: "Pricing", href: "/#pricing" },
  { key: "contact", label: "Contact", href: "/#contact" },
];

export function PublicHeader({ active }: { active?: PublicNavKey }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-300 bg-white/90 shadow-sm shadow-slate-200/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="MediLink home">
          <Logo />
        </Link>

        <nav className="hidden h-full items-center gap-10 text-sm font-bold text-slate-950 lg:flex">
          {navItems.map((item) => {
            const isActive = active === item.key;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "relative inline-flex h-full items-center transition hover:text-violet-600",
                  isActive ? "text-violet-600" : "text-slate-950",
                )}
              >
                {item.label}
                {isActive ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-violet-600" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden h-11 items-center justify-center rounded-lg border border-violet-600 bg-violet-50/80 px-4 text-sm font-bold text-violet-700 shadow-sm shadow-violet-100 transition hover:bg-violet-100 sm:inline-flex sm:h-12 sm:px-8"
          >
            Log in
          </Link>
          <Link
            href="/register?intent=demo&plan=growth"
            className="hidden h-12 items-center justify-center rounded-lg bg-violet-600 px-8 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 sm:inline-flex"
          >
            Request Demo
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="grid size-11 place-items-center rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm shadow-slate-100 transition hover:bg-sky-50 lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-300 bg-white lg:hidden"
          >
            <div className="grid gap-2 px-4 py-4 sm:px-8">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-lg px-4 py-3 text-sm font-bold transition hover:bg-violet-50 hover:text-violet-600",
                    active === item.key ? "bg-violet-50 text-violet-600" : "text-slate-800",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
              >
                Log in
              </Link>
              <Link
                href="/register?intent=demo&plan=growth"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-violet-600 px-4 py-3 text-sm font-bold text-white"
              >
                Request Demo
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
