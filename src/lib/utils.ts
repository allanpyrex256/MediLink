import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUgandanCurrency(amount: number, currency = "UGX") {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "UGX" ? 0 : 2,
  }).format(amount);
}

export function formatUgx(amount: number) {
  return `UGX ${new Intl.NumberFormat("en-UG", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-UG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function absoluteUrl(path = "") {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(path, baseUrl).toString();
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}
