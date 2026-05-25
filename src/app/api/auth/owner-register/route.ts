import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseAdminConfig } from "@/lib/config";
import { normalizeUgandanPhone, phoneAuthEmail } from "@/lib/phone";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const trialDays = 7;

const ownerRegisterSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required."),
  ownerName: z.string().trim().min(2, "Owner name is required."),
  phone: z.string().trim().min(7, "Phone number is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  tenantKind: z.enum(["clinic", "pharmacy"]).default("pharmacy"),
  region: z.string().trim().default("Uganda"),
  address: z.string().trim().default("Pending setup"),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`owner-register:${ip}`, 5, 60 * 60_000);

  if (!limited.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please wait and try again." },
      { status: 429 },
    );
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Owner registration needs SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = ownerRegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid owner registration details.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const phone = normalizeUgandanPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }
  const authEmail = phoneAuthEmail(phone);
  const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: authEmail,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.ownerName,
      phone,
      role: "owner",
      tenant_name: parsed.data.businessName,
      tenant_slug: slugify(parsed.data.businessName),
      tenant_kind: parsed.data.tenantKind,
      subscription_plan: "starter",
      trial_days: trialDays,
      trial_ends_at: trialEndsAt,
      payment_method: "mtn_momo",
      billing_phone: phone,
      region: parsed.data.region || "Uganda",
      address: parsed.data.address || "Pending setup",
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      id: data.user?.id,
      phone,
      trialDays,
      trialEndsAt,
      next: "/dashboard",
    },
  }, { status: 201 });
}
