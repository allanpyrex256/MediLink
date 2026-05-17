import { NextRequest, NextResponse } from "next/server";
import { canManageFinance, getAuthenticatedApiProfile } from "@/lib/api-profile";
import { hasSupabaseConfig } from "@/lib/config";
import {
  buildInvoiceInsert,
  buildLocalDemoInvoice,
  invoiceCreateSchema,
} from "@/lib/dashboard-create";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import { saveLocalDemoInvoice } from "@/lib/local-demo-store";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`invoices:${ip}`, 35);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many invoice requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = invoiceCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid invoice details", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = buildDemoDashboardData(workspaceId);
    const invoice = await saveLocalDemoInvoice({
      workspaceId,
      invoice: buildLocalDemoInvoice(parsed.data, demo.tenant.id),
    });

    return NextResponse.json({ data: invoice, demo: true }, { status: 201 });
  }

  const { supabase, profile } = await getAuthenticatedApiProfile();

  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageFinance(profile.role)) {
    return NextResponse.json({ error: "Only billing staff can create invoices." }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("invoices")
    .insert(buildInvoiceInsert(parsed.data, profile.tenant_id))
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data }, { status: 201 });
}
