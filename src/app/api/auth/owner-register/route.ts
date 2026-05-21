import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseAdminConfig } from "@/lib/config";
import { normalizeUgandanPhone } from "@/lib/phone";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

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

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    phone,
    password: parsed.data.password,
    phone_confirm: true,
    user_metadata: {
      full_name: parsed.data.ownerName,
      phone,
      role: "owner",
      tenant_name: parsed.data.businessName,
      tenant_slug: slugify(parsed.data.businessName),
      tenant_kind: parsed.data.tenantKind,
      subscription_plan: "starter",
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
      next: "/dashboard",
    },
  }, { status: 201 });
}
