import type { AppUser, UserRole } from "@/lib/types";

export type DashboardRole = "owner" | "seller" | "pharmacist";

const sellerPaths = ["/dashboard", "/dashboard/sales", "/dashboard/open-shift", "/dashboard/close-shift"];
const pharmacistPaths = [
  "/dashboard",
  "/dashboard/inventory",
  "/dashboard/expiry-alerts",
  "/dashboard/prescriptions",
  "/dashboard/pharmacy",
];
const sharedDashboardPaths = ["/dashboard/notifications"];

export function dashboardRole(role: UserRole | string | null | undefined): DashboardRole {
  if (role === "owner" || role === "admin") return "owner";
  if (role === "seller" || role === "receptionist") return "seller";
  if (role === "pharmacist") return "pharmacist";

  return "seller";
}

export function dashboardRoleForUser(user: Pick<AppUser, "role">): DashboardRole {
  return dashboardRole(user.role);
}

export function dashboardRoleLabel(role: UserRole | string | null | undefined) {
  const normalized = dashboardRole(role);

  if (normalized === "owner") return "Owner";
  if (normalized === "seller") return "Seller";
  return "Pharmacist";
}

export function defaultDashboardPath(role: UserRole | string | null | undefined, isPlatformAdmin = false) {
  if (isPlatformAdmin) return "/super-admin";

  const normalized = dashboardRole(role);
  if (normalized === "seller") return "/dashboard/sales";
  if (normalized === "pharmacist") return "/dashboard/inventory";

  return "/dashboard";
}

export function canAccessDashboardPath(
  pathname: string,
  role: UserRole | string | null | undefined,
  isPlatformAdmin = false,
) {
  if (!pathname.startsWith("/dashboard")) return true;
  if (isPlatformAdmin) return true;

  const normalized = dashboardRole(role);

  if (normalized === "owner") return true;
  if (matchesAny(pathname, sharedDashboardPaths)) return true;
  if (normalized === "seller") return matchesAny(pathname, sellerPaths);
  if (normalized === "pharmacist") return matchesAny(pathname, pharmacistPaths);

  return false;
}

export function canManageStaff(role: UserRole | string | null | undefined, isPlatformAdmin = false) {
  return isPlatformAdmin || dashboardRole(role) === "owner";
}

export function canSell(role: UserRole | string | null | undefined, isPlatformAdmin = false) {
  const normalized = dashboardRole(role);
  return isPlatformAdmin || normalized === "owner" || normalized === "seller";
}

export function canManageInventory(role: UserRole | string | null | undefined, isPlatformAdmin = false) {
  const normalized = dashboardRole(role);
  return isPlatformAdmin || normalized === "owner" || normalized === "pharmacist";
}

function matchesAny(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || (prefix !== "/dashboard" && pathname.startsWith(`${prefix}/`)),
  );
}
