"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ElementType } from "react";
import { useState } from "react";
import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  CreditCard,
  FlaskConical,
  Home,
  LogOut,
  Menu,
  Pill,
  ReceiptText,
  Settings,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";
import type { AppUser, Tenant, UserRole } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

const baseNavigation: Array<{
  href: string;
  label: string;
  icon: ElementType;
  roles?: UserRole[];
}> = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/patients", label: "Patients", icon: Users, roles: ["admin", "doctor", "receptionist"] },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays, roles: ["admin", "doctor", "receptionist", "patient"] },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard, roles: ["admin", "receptionist", "pharmacist"] },
  { href: "/dashboard/pharmacy", label: "Pharmacy", icon: Pill, roles: ["admin", "doctor", "receptionist", "pharmacist"] },
  { href: "/dashboard/labs", label: "Laboratory", icon: FlaskConical, roles: ["admin", "doctor", "receptionist"] },
  { href: "/dashboard/branches", label: "Staff", icon: Users, roles: ["admin"] },
  { href: "/dashboard/reports", label: "Reports", icon: ClipboardList, roles: ["admin", "doctor"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

const platformNavigation: Array<{
  href: string;
  label: string;
  icon: ElementType;
}> = [
  { href: "/super-admin", label: "Business Dashboard", icon: Home },
  { href: "/super-admin/hospitals", label: "Hospitals", icon: Building2 },
  { href: "/super-admin/pharmacies", label: "Pharmacies", icon: Pill },
  { href: "/super-admin/billing", label: "Billing", icon: CreditCard },
  { href: "/super-admin/plans", label: "Subscription Plans", icon: ReceiptText },
  { href: "/super-admin/activity", label: "Tenant Activity", icon: Activity },
  { href: "/super-admin/support", label: "Support Tickets", icon: Users },
];

export function AppShell({
  tenant,
  user,
  children,
}: {
  tenant: Tenant;
  user: AppUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const roleLabel = user.is_platform_admin
    ? "SaaS Owner"
    : user.role === "admin"
      ? "Administrator"
      : user.role;
  const roleNavigation = baseNavigation.filter(
    (item) => !item.roles || item.roles.includes(user.role),
  );
  const navigation = user.is_platform_admin ? platformNavigation : roleNavigation;
  const quickActions = user.is_platform_admin
    ? [
        { href: "/super-admin/hospitals", label: "Manage hospitals", icon: Building2 },
        { href: "/super-admin/pharmacies", label: "Manage pharmacies", icon: Pill },
        { href: "/super-admin/billing", label: "Review billing", icon: CreditCard },
        { href: "/super-admin/support", label: "Open tickets", icon: Users },
      ]
    : [
        { href: "/dashboard/appointments", label: "New appointment", icon: CalendarDays },
        { href: "/dashboard/patients", label: "Register patient", icon: Users },
        { href: "/dashboard/billing", label: "Create invoice", icon: CreditCard },
        { href: "/dashboard/pharmacy", label: "View pharmacy", icon: Pill },
      ];

  async function signOut() {
    if (hasSupabaseConfig()) {
      await createSupabaseBrowserClient().auth.signOut();
    } else {
      await fetch("/api/demo-logout", { method: "POST" });
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#eef6ff_0%,#f8fbff_48%,#ecfdf5_100%)] text-[#07082f]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[300px] border-r border-slate-300 bg-white/95 shadow-xl shadow-slate-200/60 lg:flex lg:flex-col">
        <SidebarContent
          pathname={pathname}
          tenant={tenant}
          navigation={navigation}
          onSignOut={signOut}
          platformMode={user.is_platform_admin}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.aside
              className="flex h-full w-[min(21rem,88vw)] flex-col bg-white shadow-2xl shadow-slate-900/20"
              initial={{ x: -360 }}
              animate={{ x: 0 }}
              exit={{ x: -360 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div className="flex h-[86px] items-center justify-between border-b border-slate-300 bg-sky-50/50 px-5">
                <Logo />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="size-5" />
                </Button>
              </div>
                <SidebarContent
                  pathname={pathname}
                  tenant={tenant}
                  navigation={navigation}
                  onNavigate={() => setMobileOpen(false)}
                  onSignOut={signOut}
                  platformMode={user.is_platform_admin}
                  compact
                />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-[300px]">
        <header className="sticky top-0 z-20 h-[86px] border-b border-slate-300 bg-white/90 shadow-sm shadow-slate-200/80 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between gap-4 px-5 sm:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-11 place-items-center rounded-lg text-slate-950 transition hover:bg-slate-100"
              aria-label="Open navigation"
            >
              <Menu className="size-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setQuickActionsOpen((value) => !value)}
                  className="inline-flex h-12 items-center gap-3 rounded-lg border border-violet-300 bg-violet-50/80 px-5 text-sm font-semibold text-violet-700 shadow-sm shadow-violet-100 transition hover:bg-violet-100"
                  aria-expanded={quickActionsOpen}
                >
                  <Zap className="size-4" />
                  Quick Actions
                  <ChevronDown className={cn("size-4 transition-transform", quickActionsOpen ? "rotate-180" : "")} />
                </button>
                <AnimatePresence>
                  {quickActionsOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-2 w-64 rounded-lg border border-slate-300 bg-white p-2 shadow-2xl shadow-slate-200"
                    >
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <Link
                            key={action.href}
                            href={action.href}
                            onClick={() => setQuickActionsOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-600"
                          >
                            <Icon className="size-4 text-violet-600" aria-hidden="true" />
                            {action.label}
                          </Link>
                        );
                      })}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              <button
                type="button"
                  className="relative grid size-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm shadow-slate-100 transition hover:border-sky-300 hover:bg-sky-50"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
                <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-violet-600 text-[11px] font-bold text-white">
                  3
                </span>
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((value) => !value)}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 transition hover:border-slate-200 hover:bg-sky-50"
                >
                  <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-amber-200 to-sky-200 text-sm font-bold text-slate-900 ring-2 ring-white">
                    {initials(user.full_name)}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-bold text-slate-950">{user.full_name}</p>
                    <p className="text-xs font-medium text-slate-600 capitalize">{roleLabel}</p>
                  </div>
                  <ChevronDown className="hidden size-4 text-slate-600 sm:block" />
                </button>
                {userMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-300 bg-white p-2 shadow-xl shadow-slate-200">
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="px-5 py-7 sm:px-8">
          <div key={pathname}>{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  tenant,
  navigation,
  onNavigate,
  onSignOut,
  compact = false,
  platformMode = false,
}: {
  pathname: string;
  tenant: Tenant;
  navigation: Array<{ href: string; label: string; icon: ElementType }>;
  onNavigate?: () => void;
  onSignOut: () => void;
  compact?: boolean;
  platformMode?: boolean;
}) {
  return (
    <>
      {!compact ? (
        <div className="flex h-[86px] items-center border-b border-slate-300 bg-sky-50/50 px-7">
          <Logo />
        </div>
      ) : null}
      <nav className="grid gap-3 px-4 py-8">
        {navigation.map((item) => (
          <NavItem key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="mt-auto p-4">
        <div className="overflow-hidden rounded-lg border border-violet-200 bg-gradient-to-br from-white to-violet-50/70 shadow-md shadow-violet-100">
          <div className="p-4">
            <p className="text-sm font-bold text-slate-950">
              {platformMode ? "MediLink Platform" : tenant.name}
            </p>
            <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500" />
              {platformMode ? "Owner view" : "Active"}
            </p>
          </div>
          <Link
            href={platformMode ? "/super-admin/hospitals" : "/dashboard/branches"}
            onClick={onNavigate}
            className="flex h-12 w-full items-center justify-between border-t border-violet-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-violet-50"
          >
            {platformMode ? "All Tenants" : "All Branches"}
            <ChevronDown className="size-4" />
          </Link>
          <button
            type="button"
            onClick={onSignOut}
            className="flex h-11 w-full items-center gap-2 border-t border-violet-100 px-4 text-sm font-semibold text-slate-600 transition hover:bg-white/70 hover:text-slate-900"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

function NavItem({
  item,
  pathname,
  onNavigate,
}: {
  item: { href: string; label: string; icon: ElementType };
  pathname: string;
  onNavigate?: () => void;
}) {
  const active =
    item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex h-12 items-center gap-4 rounded-lg px-4 text-[15px] font-semibold transition",
        active
          ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
          : "border border-transparent text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700",
      )}
    >
      <Icon className="size-5" />
      {item.label}
    </Link>
  );
}
