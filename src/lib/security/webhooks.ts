import { NextRequest, NextResponse } from "next/server";
import { isProduction } from "@/lib/config";

type WebhookSecretOptions = {
  provider: string;
  secret: string | undefined;
  headers?: string[];
  queryParams?: string[];
};

export function requireWebhookSecret(
  request: NextRequest,
  {
    provider,
    secret,
    headers = ["x-medilink-webhook-secret"],
    queryParams = ["secret", "token"],
  }: WebhookSecretOptions,
) {
  if (!secret) {
    if (isProduction()) {
      return NextResponse.json(
        { error: `${provider} webhook secret is not configured.` },
        { status: 503 },
      );
    }

    return null;
  }

  const candidate =
    headers.map((header) => request.headers.get(header)).find(Boolean) ??
    queryParams
      .map((param) => request.nextUrl.searchParams.get(param))
      .find(Boolean);

  if (!candidate || !constantTimeEqual(candidate, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  return null;
}

function constantTimeEqual(left: string, right: string) {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);

  if (leftBytes.length !== rightBytes.length) return false;

  let mismatch = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    mismatch |= leftBytes[index] ^ rightBytes[index];
  }

  return mismatch === 0;
}
