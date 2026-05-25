import { NextRequest, NextResponse } from "next/server";
import { hasSupabaseConfig, isDemoModeAllowed } from "@/lib/config";
import { getDemoTenantForHost, tenantSlugFromHost } from "@/lib/tenant";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const host = request.headers.get("host");
  const slug = tenantSlugFromHost(host);

  if (!hasSupabaseConfig()) {
    if (!isDemoModeAllowed()) {
      return NextResponse.json(
        { error: "Tenant resolution needs Supabase configuration." },
        { status: 503 },
      );
    }

    return NextResponse.json({ data: getDemoTenantForHost(host), demo: true });
  }

  if (!slug) {
    return NextResponse.json({ data: null });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("subdomain", slug)
    .eq("status", "active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ data });
}
