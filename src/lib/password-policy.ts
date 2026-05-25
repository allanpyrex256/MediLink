export type PasswordCheck = {
  label: string;
  passed: boolean;
};

export function passwordChecks(password: string): PasswordCheck[] {
  return [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "Upper and lower case letters", passed: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: "At least one number", passed: /\d/.test(password) },
    { label: "At least one symbol", passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function passwordStrength(password: string) {
  const score = passwordChecks(password).filter((check) => check.passed).length;

  if (!password) return { label: "Not started", score, tone: "slate" as const };
  if (score <= 1) return { label: "Weak", score, tone: "rose" as const };
  if (score <= 3) return { label: "Good", score, tone: "amber" as const };
  return { label: "Strong", score, tone: "emerald" as const };
}

export function validatePassword(password: string) {
  const missing = passwordChecks(password).filter((check) => !check.passed);

  if (!missing.length) return null;

  return `Password needs ${missing.map((check) => check.label.toLowerCase()).join(", ")}.`;
}
