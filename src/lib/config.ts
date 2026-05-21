export const appConfig = {
  name: "MediLink",
  tagline: "Hospital management for Uganda and East Africa",
  defaultCurrency: "UGX",
  defaultCountry: "UG",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@medilink.ug",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  flutterwave: {
    clientId: process.env.FLUTTERWAVE_CLIENT_ID,
    clientSecret:
      process.env.FLUTTERWAVE_CLIENT_SECRET ??
      process.env.FLUTTERWAVE_SECRET_KEY,
    encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY,
    webhookHash: process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH,
    apiBaseUrl:
      process.env.FLUTTERWAVE_API_BASE_URL ??
      "https://developersandbox-api.flutterwave.com",
    authUrl:
      process.env.FLUTTERWAVE_AUTH_URL ??
      "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token",
  },
  mtn: {
    subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY,
    apiUser: process.env.MTN_MOMO_API_USER,
    apiKey: process.env.MTN_MOMO_API_KEY,
    targetEnvironment: process.env.MTN_MOMO_TARGET_ENVIRONMENT ?? "sandbox",
    baseUrl:
      process.env.MTN_MOMO_BASE_URL ??
      "https://sandbox.momodeveloper.mtn.com",
  },
  airtel: {
    clientId: process.env.AIRTEL_MONEY_CLIENT_ID,
    clientSecret: process.env.AIRTEL_MONEY_CLIENT_SECRET,
    publicKey: process.env.AIRTEL_MONEY_PUBLIC_KEY,
    country: process.env.AIRTEL_MONEY_COUNTRY ?? "UG",
    currency: process.env.AIRTEL_MONEY_CURRENCY ?? "UGX",
    baseUrl:
      process.env.AIRTEL_MONEY_BASE_URL ??
      "https://openapiuat.airtel.africa",
    collectionPath:
      process.env.AIRTEL_MONEY_COLLECTION_PATH ?? "/merchant/v1/payments/",
    statusPath:
      process.env.AIRTEL_MONEY_STATUS_PATH ?? "/standard/v1/payments",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  whatsapp: {
    token: process.env.WHATSAPP_CLOUD_API_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION ?? "v25.0",
  },
  email: {
    resendApiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM ?? "MediLink <notifications@medilink.ug>",
  },
};

export function hasSupabaseConfig() {
  return Boolean(appConfig.supabaseUrl && appConfig.supabaseAnonKey);
}

export function hasSupabaseAdminConfig() {
  return Boolean(
    appConfig.supabaseUrl &&
      appConfig.supabaseAnonKey &&
      appConfig.supabaseServiceRoleKey,
  );
}

export function isDemoMode() {
  return !hasSupabaseConfig();
}

export function isLocalDemoPaymentAllowed() {
  return (
    process.env.ALLOW_DEMO_PAYMENTS === "true" ||
    (process.env.ALLOW_DEMO_PAYMENTS !== "false" &&
      process.env.NODE_ENV !== "production")
  );
}
