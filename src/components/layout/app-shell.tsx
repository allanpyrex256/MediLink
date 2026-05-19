"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { CSSProperties, ElementType } from "react";
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
  LineChart,
  LogOut,
  Menu,
  Package,
  Pill,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Stethoscope,
  Truck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { createSupabaseBrowserClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { tenantBranding } from "@/lib/tenant-branding";
import type { AppUser, Tenant, UserRole } from "@/lib/types";
import { cn, initials } from "@/lib/utils";

type NavigationItem = {
  href: string;
  label: string;
  icon: ElementType;
  roles?: UserRole[];
};

const hospitalNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/patients", label: "Patients", icon: Users, roles: ["admin", "doctor", "receptionist"] },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays, roles: ["admin", "doctor", "receptionist", "patient"] },
  { href: "/dashboard/admissions", label: "Admissions", icon: ClipboardList, roles: ["admin", "doctor", "receptionist"] },
  { href: "/dashboard/labs", label: "Laboratory", icon: FlaskConical, roles: ["admin", "doctor", "receptionist"] },
  { href: "/dashboard/pharmacy", label: "Pharmacy", icon: Pill, roles: ["admin", "doctor", "receptionist", "pharmacist"] },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard, roles: ["admin", "receptionist", "pharmacist"] },
  { href: "/dashboard/staff", label: "Staff", icon: ShieldCheck, roles: ["admin"] },
  { href: "/dashboard/branches", label: "Branches", icon: Building2, roles: ["admin"] },
  { href: "/dashboard/reports", label: "Reports", icon: ClipboardList, roles: ["admin", "doctor"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

const clinicNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/patients", label: "Patients", icon: Users, roles: ["admin", "doctor", "receptionist"] },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays, roles: ["admin", "doctor", "receptionist", "patient"] },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard, roles: ["admin", "receptionist"] },
  { href: "/dashboard/pharmacy", label: "Pharmacy", icon: Pill, roles: ["admin", "doctor", "receptionist", "pharmacist"] },
  { href: "/dashboard/staff", label: "Staff", icon: ShieldCheck, roles: ["admin"] },
  { href: "/dashboard/reports", label: "Reports", icon: ClipboardList, roles: ["admin", "doctor"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

const dentistryNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/patients", label: "Dental Patients", icon: Users, roles: ["admin", "dentist", "receptionist"] },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays, roles: ["admin", "dentist", "receptionist", "patient"] },
  { href: "/dashboard/emr", label: "Treatment Notes", icon: Stethoscope, roles: ["admin", "dentist"] },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard, roles: ["admin", "receptionist"] },
  { href: "/dashboard/staff", label: "Staff", icon: ShieldCheck, roles: ["admin"] },
  { href: "/dashboard/reports", label: "Reports", icon: ClipboardList, roles: ["admin", "dentist"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["admin"] },
];

const pharmacyNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/payments", label: "Sales", icon: ShoppingCart, roles: ["admin", "pharmacist"] },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package, roles: ["admin", "pharmacist"] },
  { href: "/dashboard/prescriptions", label: "Prescriptions", icon: ReceiptText, roles: ["admin", "pharmacist"] },
  { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck, roles: ["admin", "pharmacist"] },
  { href: "/dashboard/expiry-alerts", label: "Expiry Alerts", icon: Pill, roles: ["admin", "pharmacist"] },
  { href: "/dashboard/staff", label: "Staff", icon: ShieldCheck, roles: ["admin"] },
  { href: "/dashboard/reports", label: "Reports", icon: ClipboardList, roles: ["admin", "pharmacist"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["admin", "pharmacist"] },
];

const platformNavigation: NavigationItem[] = [
  { href: "/super-admin", label: "Dashboard", icon: Home },
  { href: "/super-admin/hospitals", label: "Hospitals", icon: Building2 },
  { href: "/super-admin/clinics", label: "Clinics", icon: Users },
  { href: "/super-admin/dentistry", label: "Dentistry", icon: Stethoscope },
  { href: "/super-admin/pharmacies", label: "Pharmacies", icon: Pill },
  { href: "/super-admin/subscriptions", label: "Subscriptions", icon: ReceiptText },
  { href: "/super-admin/revenue", label: "Revenue", icon: LineChart },
  { href: "/super-admin/payments", label: "Payments", icon: CreditCard },
  { href: "/super-admin/support", label: "Support Tickets", icon: Users },
  { href: "/super-admin/plans", label: "Plans", icon: ReceiptText },
  { href: "/super-admin/analytics", label: "Analytics", icon: Activity },
  { href: "/super-admin/settings", label: "Settings", icon: Settings },
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
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const brand = tenantBranding(tenant);
  const shellColor = user.is_platform_admin ? "#7c3aed" : brand.primaryColor;
  const roleLabel = user.is_platform_admin
    ? "SaaS Owner"
    : user.role === "admin"
      ? "Administrator"
      : user.role === "dentist"
        ? "Dentist"
      : user.role;
  const businessNavigation =
    tenant.tenant_kind === "hospital"
      ? hospitalNavigation
      : tenant.tenant_kind === "pharmacy"
        ? pharmacyNavigation
        : tenant.tenant_kind === "dentistry"
          ? dentistryNavigation
        : clinicNavigation;
  const roleNavigation = businessNavigation.filter((item) => !item.roles || item.roles.includes(user.role));
  const navigation = user.is_platform_admin ? platformNavigation : roleNavigation;
  const quickActions = user.is_platform_admin
    ? [
        { href: "/super-admin/hospitals", label: "Manage hospitals", icon: Building2 },
        { href: "/super-admin/clinics", label: "Manage clinics", icon: Users },
        { href: "/super-admin/dentistry", label: "Manage dentistry", icon: Stethoscope },
        { href: "/super-admin/pharmacies", label: "Manage pharmacies", icon: Pill },
        { href: "/super-admin/revenue", label: "Review revenue", icon: LineChart },
        { href: "/super-admin/support", label: "Open tickets", icon: Users },
      ]
    : tenant.tenant_kind === "pharmacy"
      ? [
          { href: "/dashboard/payments", label: "New sale", icon: ShoppingCart },
          { href: "/dashboard/inventory?action=add-item", label: "Add medicine", icon: Package },
          { href: "/dashboard/expiry-alerts", label: "Expiry alerts", icon: Pill },
          { href: "/dashboard/suppliers", label: "Suppliers", icon: Truck },
        ]
      : tenant.tenant_kind === "hospital"
        ? [
            { href: "/dashboard/admissions", label: "New admission", icon: ClipboardList },
            { href: "/dashboard/labs", label: "Lab request", icon: FlaskConical },
            { href: "/dashboard/billing?action=new-invoice", label: "Create invoice", icon: CreditCard },
            { href: "/dashboard/pharmacy", label: "Pharmacy sales", icon: Pill },
          ]
      : tenant.tenant_kind === "dentistry"
        ? [
            { href: "/dashboard/appointments", label: "New dental visit", icon: CalendarDays },
            { href: "/dashboard/patients?action=add-patient", label: "Register patient", icon: Users },
            { href: "/dashboard/emr", label: "Treatment notes", icon: Stethoscope },
            { href: "/dashboard/billing?action=new-invoice", label: "Create invoice", icon: CreditCard },
          ]
      : [
          { href: "/dashboard/appointments", label: "New appointment", icon: CalendarDays },
          { href: "/dashboard/patients?action=add-patient", label: "Register patient", icon: Users },
          { href: "/dashboard/billing?action=new-invoice", label: "Create invoice", icon: CreditCard },
          { href: "/dashboard/pharmacy", label: "View pharmacy", icon: Pill },
        ];
  const footerLink = user.is_platform_admin
    ? { href: "/super-admin/analytics", label: "Platform Analytics" }
    : tenant.tenant_kind === "pharmacy"
      ? { href: "/dashboard/inventory", label: "Stock Control" }
      : tenant.tenant_kind === "hospital"
        ? { href: "/dashboard/branches", label: "Staff & Branches" }
        : tenant.tenant_kind === "dentistry"
          ? { href: "/dashboard/reports", label: "Dental Reports" }
        : { href: "/dashboard/reports", label: "Clinic Reports" };

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
    <div
      className="min-h-screen bg-[linear-gradient(135deg,#eef6ff_0%,#f8fbff_48%,#ecfdf5_100%)] text-[#07082f]"
      style={
        {
          "--tenant-primary": shellColor,
          "--tenant-accent": brand.accentColor,
        } as CSSProperties
      }
    >
      <aside
        id="desktop-navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-[300px] border-r border-slate-300 bg-white/95 shadow-xl shadow-slate-200/60 transition-transform duration-200 lg:flex lg:flex-col",
          desktopSidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full",
        )}
      >
        <SidebarContent
          pathname={pathname}
          tenant={tenant}
          brand={brand}
          navigation={navigation}
          onSignOut={signOut}
          platformMode={user.is_platform_admin}
          footerLink={footerLink}
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
              id="mobile-navigation"
              className="flex h-full w-[min(21rem,88vw)] flex-col bg-white shadow-2xl shadow-slate-900/20"
              initial={{ x: -360 }}
              animate={{ x: 0 }}
              exit={{ x: -360 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div className="flex h-[86px] items-center justify-between border-b border-slate-300 bg-sky-50/50 px-5">
                <Logo
                  label={user.is_platform_admin ? "MediLink" : brand.name}
                  tagline={user.is_platform_admin ? "Platform Control" : brand.tagline}
                  imageUrl={user.is_platform_admin ? null : brand.logoUrl}
                  initials={user.is_platform_admin ? "ML" : brand.initials}
                  color={user.is_platform_admin ? "#7c3aed" : brand.primaryColor}
                />
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
                  brand={brand}
                  navigation={navigation}
                  onNavigate={() => setMobileOpen(false)}
                  onSignOut={signOut}
                  platformMode={user.is_platform_admin}
                  footerLink={footerLink}
                  compact
                />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          "transition-[padding] duration-200",
          desktopSidebarOpen ? "lg:pl-[300px]" : "lg:pl-0",
        )}
      >
        <header className="sticky top-0 z-20 h-[86px] border-b border-slate-300 bg-white/90 shadow-sm shadow-slate-200/80 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between gap-4 px-5 sm:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-11 place-items-center rounded-lg text-slate-950 transition hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
              aria-controls="mobile-navigation"
              aria-expanded={mobileOpen}
            >
              <Menu className="size-6" />
            </button>
            <button
              type="button"
              onClick={() => setDesktopSidebarOpen((value) => !value)}
              className="hidden size-11 place-items-center rounded-lg text-slate-950 transition hover:bg-slate-100 lg:grid"
              aria-label={desktopSidebarOpen ? "Collapse navigation" : "Open navigation"}
              aria-controls="desktop-navigation"
              aria-expanded={desktopSidebarOpen}
            >
              <Menu className="size-6" />
            </button>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setQuickActionsOpen((value) => !value)}
                  className="inline-flex h-12 items-center gap-3 rounded-lg border border-violet-300 bg-violet-50/80 px-5 text-sm font-semibold text-violet-700 shadow-sm shadow-violet-100 transition hover:bg-violet-100"
                  style={{
                    borderColor: `${shellColor}44`,
                    backgroundColor: `${shellColor}12`,
                    color: shellColor,
                  }}
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
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Icon className="size-4" style={{ color: shellColor }} aria-hidden="true" />
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
  brand,
  navigation,
  onNavigate,
  onSignOut,
  compact = false,
  platformMode = false,
  footerLink,
}: {
  pathname: string;
  tenant: Tenant;
  brand: ReturnType<typeof tenantBranding>;
  navigation: NavigationItem[];
  onNavigate?: () => void;
  onSignOut: () => void;
  compact?: boolean;
  platformMode?: boolean;
  footerLink: { href: string; label: string };
}) {
  return (
    <>
      {!compact ? (
        <div className="flex h-[86px] items-center border-b border-slate-300 bg-sky-50/50 px-7">
          <Logo
            label={platformMode ? "MediLink" : brand.name}
            tagline={platformMode ? "Platform Control" : brand.tagline}
            imageUrl={platformMode ? null : brand.logoUrl}
            initials={platformMode ? "ML" : brand.initials}
            color={platformMode ? "#7c3aed" : brand.primaryColor}
          />
        </div>
      ) : null}
      <nav className="grid gap-3 px-4 py-8">
        {navigation.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            pathname={pathname}
            brandColor={platformMode ? "#7c3aed" : brand.primaryColor}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      <div className="mt-auto p-4">
        <div className="overflow-hidden rounded-lg border border-violet-200 bg-gradient-to-br from-white to-violet-50/70 shadow-md shadow-violet-100">
          <div className="p-4">
            <p className="text-sm font-bold text-slate-950">
              {platformMode ? "MediLink Platform" : tenant.name}
            </p>
            {!platformMode ? (
              <p className="mt-1 text-xs font-semibold text-slate-500">{brand.email}</p>
            ) : null}
            <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="size-2 rounded-full bg-emerald-500" />
              {platformMode ? "Owner view" : "Active"}
            </p>
          </div>
          <Link
            href={footerLink.href}
            onClick={onNavigate}
            className="flex h-12 w-full items-center justify-between border-t border-violet-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-violet-50"
          >
            {footerLink.label}
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
  brandColor,
  onNavigate,
}: {
  item: NavigationItem;
  pathname: string;
  brandColor: string;
  onNavigate?: () => void;
}) {
  const isSectionRoot = item.href === "/dashboard" || item.href === "/super-admin";
  const active = isSectionRoot
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex h-12 items-center gap-4 rounded-lg px-4 text-[15px] font-semibold transition",
        active
          ? "text-white shadow-lg shadow-slate-200"
          : "border border-transparent text-slate-700 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700",
      )}
      style={
        active
          ? {
              backgroundColor: brandColor,
            }
          : undefined
      }
    >
      <Icon className="size-5" />
      {item.label}
    </Link>
  );
}
