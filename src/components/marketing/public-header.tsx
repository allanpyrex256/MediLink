"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  Headphones,
  Menu,
  Pill,
  Sparkles,
  Stethoscope,
  TestTube2,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

type PublicNavKey =
  | "features"
  | "solutions"
  | "screenshots"
  | "portals"
  | "pricing"
  | "resources"
  | "contact"
  | "about";

const navItems: Array<{
  key: PublicNavKey;
  label: string;
  href: string;
  dropdown?: boolean;
}> = [
  { key: "features", label: "Features", href: "/#features" },
  { key: "solutions", label: "Solutions", href: "/solutions", dropdown: true },
  { key: "screenshots", label: "Screenshots", href: "/#screenshots" },
  { key: "portals", label: "Login Portals", href: "/#login-portals" },
  { key: "resources", label: "Resources", href: "/resources", dropdown: true },
  { key: "contact", label: "Contact", href: "/#contact" },
];

const dropdownItems = {
  solutions: [
    { label: "Clinics", href: "/solutions#clinics", icon: Stethoscope },
    { label: "Hospitals", href: "/solutions#hospitals", icon: Building2 },
    { label: "Pharmacies", href: "/solutions#pharmacies", icon: Pill },
    { label: "Laboratories", href: "/solutions#laboratories", icon: TestTube2 },
  ],
  resources: [
    { label: "Getting Started", href: "/resources#getting-started", icon: Sparkles },
    { label: "Product Guides", href: "/resources#guides", icon: BookOpen },
    { label: "Video Tutorials", href: "/resources#videos", icon: CalendarDays },
    { label: "Contact Support", href: "/resources#support", icon: Headphones },
  ],
} as const;

export function PublicHeader({ active }: { active?: PublicNavKey }) {
  const [openDropdown, setOpenDropdown] = useState<"solutions" | "resources" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-300 bg-white/90 shadow-sm shadow-slate-200/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="MediLink home">
          <Logo />
        </Link>

        <nav className="hidden h-full items-center gap-11 text-sm font-bold text-slate-950 lg:flex">
          {navItems.map((item) => {
            const isActive = active === item.key;
            const hasDropdown = item.key === "solutions" || item.key === "resources";
            const dropdownKey = hasDropdown ? (item.key as "solutions" | "resources") : null;
            return (
              <div key={item.key} className="relative flex h-full items-center">
                {hasDropdown ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown((current) => (current === dropdownKey ? null : dropdownKey))
                    }
                    className={cn(
                      "relative inline-flex h-full items-center gap-1.5 transition hover:text-violet-600",
                      isActive || openDropdown === dropdownKey ? "text-violet-600" : "text-slate-950",
                    )}
                    aria-expanded={openDropdown === dropdownKey}
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        openDropdown === dropdownKey ? "rotate-180" : "",
                      )}
                      aria-hidden="true"
                    />
                    {isActive ? (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-violet-600" />
                    ) : null}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "relative inline-flex h-full items-center gap-1.5 transition hover:text-violet-600",
                      isActive ? "text-violet-600" : "text-slate-950",
                    )}
                  >
                    {item.label}
                    {isActive ? (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-violet-600" />
                    ) : null}
                  </Link>
                )}

                <AnimatePresence>
                  {dropdownKey && openDropdown === dropdownKey ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-1/2 top-[66px] w-72 -translate-x-1/2 rounded-lg border border-slate-300 bg-white p-2 shadow-2xl shadow-violet-100"
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className="mb-1 block rounded-lg bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-100"
                      >
                        View all {item.label}
                      </Link>
                      {dropdownItems[dropdownKey].map((dropdownItem) => {
                        const Icon = dropdownItem.icon;
                        return (
                          <Link
                            key={dropdownItem.href}
                            href={dropdownItem.href}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-violet-600"
                          >
                            <Icon className="size-4 text-violet-600" aria-hidden="true" />
                            {dropdownItem.label}
                          </Link>
                        );
                      })}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
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
            href="/demo-flow"
            className="hidden h-12 items-center justify-center rounded-lg bg-violet-600 px-8 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 sm:inline-flex"
          >
            Book a Demo
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
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
