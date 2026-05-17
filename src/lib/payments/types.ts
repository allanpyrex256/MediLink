import type { PaymentProvider, PaymentStatus } from "@/lib/types";

export interface PaymentIntentRequest {
  tenantId: string;
  appointmentId: string;
  patientId: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  phone: string;
  email: string;
  patientName: string;
  network?: "mtn" | "airtel";
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentIntentResponse {
  provider: PaymentProvider;
  reference: string;
  status: PaymentStatus;
  checkoutUrl?: string;
  instructions?: string;
  raw?: unknown;
}

export interface PaymentAdapter {
  provider: PaymentProvider;
  createIntent(input: PaymentIntentRequest): Promise<PaymentIntentResponse>;
  verify(reference: string): Promise<PaymentIntentResponse>;
}

export class PaymentConfigurationError extends Error {
  constructor(provider: PaymentProvider, missing: string[]) {
    super(
      `${provider} is missing required configuration: ${missing.join(", ")}`,
    );
    this.name = "PaymentConfigurationError";
  }
}

export function medilinkReference(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
