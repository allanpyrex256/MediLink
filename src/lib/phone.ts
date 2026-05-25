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

export function normalizeUgandanMobilePhone(value: string) {
  const normalized = normalizeUgandanPhone(value);

  if (!isValidUgandanMobilePhone(normalized) || isLikelyPlaceholderPhone(normalized)) {
    return "";
  }

  return normalized;
}

export function isValidUgandanMobilePhone(value: string) {
  const normalized = normalizeUgandanPhone(value);
  const digits = normalized.replace(/\D/g, "");
  const local = digits.startsWith("256") ? digits.slice(3) : digits;

  return /^7\d{8}$/.test(local);
}

export function isLikelyPlaceholderPhone(value: string) {
  const normalized = normalizeUgandanPhone(value);
  const digits = normalized.replace(/\D/g, "");
  const local = digits.startsWith("256") ? digits.slice(3) : digits;

  if (!local) return true;
  if (/^(\d)\1{8}$/.test(local)) return true;
  if (/0{5,}/.test(local)) return true;
  if (["123456789", "987654321", "700000001", "700000000"].includes(local)) return true;

  return false;
}

export function ugandanMobilePhoneError(value: string) {
  if (!value.trim()) return "Enter the customer's WhatsApp phone number.";
  if (!isValidUgandanMobilePhone(value)) {
    return "Enter a valid Uganda mobile WhatsApp number, for example +256 700 123 456.";
  }
  if (isLikelyPlaceholderPhone(value)) {
    return "Enter the customer's real WhatsApp number. Placeholder numbers like +256700000001 are not accepted.";
  }

  return "";
}

export function whatsappChatUrl(phone: string, text?: string) {
  const normalized = normalizeUgandanPhone(phone);
  const digits = normalized.replace(/\D/g, "");
  const baseUrl = `https://wa.me/${digits}`;

  return text ? `${baseUrl}?text=${encodeURIComponent(text)}` : baseUrl;
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
