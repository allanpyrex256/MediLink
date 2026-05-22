export function normalizeUgandanPhone(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (!digits) return "";
  if (digits.startsWith("256")) return `+${digits}`;
  if (digits.startsWith("0")) return `+256${digits.slice(1)}`;
  if (digits.length === 9) return `+256${digits}`;
  if (trimmed.startsWith("+")) return `+${digits}`;

  return `+${digits}`;
}

export function phoneLoginIdentifier(value: string) {
  const normalized = normalizeUgandanPhone(value);

  return normalized || value.trim();
}

export function phoneAuthEmail(value: string) {
  const normalized = normalizeUgandanPhone(value);
  const digits = normalized.replace(/\D/g, "");

  return digits ? `${digits}@phone.medilink.local` : "";
}
