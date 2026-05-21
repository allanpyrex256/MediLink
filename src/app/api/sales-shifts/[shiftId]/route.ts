import { NextRequest, NextResponse } from "next/server";
import { canManageFinance, getAuthenticatedApiProfile } from "@/lib/api-profile";
import { salesShiftCloseSchema } from "@/lib/dashboard-create";
import { hasSupabaseConfig } from "@/lib/config";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import { getLocalDemoWorkspaceState, saveLocalDemoSalesShift, updateLocalDemoSalesShift } from "@/lib/local-demo-store";
import { rateLimit } from "@/lib/security/rate-limit";
import type { DailySale, SalesShift } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shiftId: string }> },
) {
  const { shiftId } = await params;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`sales-shift-close:${ip}`, 25);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many shift close requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = salesShiftCloseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid closing details", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = buildDemoDashboardData(workspaceId);
    const local = await getLocalDemoWorkspaceState(workspaceId);
    const allShifts = [...local.salesShifts, ...demo.salesShifts];
    const allSales = [...local.dailySales, ...demo.dailySales];
    const shift = allShifts.find((item) => item.id === shiftId);
    if (!shift) return NextResponse.json({ error: "Shift not found." }, { status: 404 });

    const shiftSales = allSales.filter((sale) => sale.shift_id === shiftId);
    const calculations = closeCalculations(shift, shiftSales, parsed.data.expensesTotal, parsed.data.closingCashBalance);
    const patch = {
      status: "closed" as const,
      closing_cash_balance: parsed.data.closingCashBalance,
      expenses_total: parsed.data.expensesTotal,
      closing_notes: parsed.data.notes?.trim() || null,
      closed_at: new Date().toISOString(),
      ...calculations,
    };
    const closed = shift.id.startsWith("local-shift-")
      ? await updateLocalDemoSalesShift({
          workspaceId,
          shiftId,
          patch,
        })
      : await saveLocalDemoSalesShift({
          workspaceId,
          shift: {
            ...shift,
            ...patch,
            updated_at: new Date().toISOString(),
          },
        });

    return NextResponse.json({ data: closed, demo: true });
  }

  const { supabase, profile } = await getAuthenticatedApiProfile();

  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageFinance(profile.role)) {
    return NextResponse.json({ error: "Only owners and sellers can close shifts." }, { status: 403 });
  }

  const { data: shift, error: shiftError } = await supabase
    .from("sales_shifts")
    .select("*")
    .eq("id", shiftId)
    .eq("tenant_id", profile.tenant_id)
    .single();

  if (shiftError || !shift) return NextResponse.json({ error: "Shift not found." }, { status: 404 });
  if ((shift as SalesShift).status === "closed") {
    return NextResponse.json({ error: "This shift is already closed." }, { status: 409 });
  }

  const { data: sales } = await supabase
    .from("daily_sales")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .eq("shift_id", shiftId);

  const calculations = closeCalculations(
    shift as SalesShift,
    (sales ?? []) as DailySale[],
    parsed.data.expensesTotal,
    parsed.data.closingCashBalance,
  );

  const { data, error } = await supabase
    .from("sales_shifts")
    .update({
      status: "closed",
      closing_cash_balance: parsed.data.closingCashBalance,
      expenses_total: parsed.data.expensesTotal,
      closing_notes: parsed.data.notes?.trim() || null,
      closed_at: new Date().toISOString(),
      ...calculations,
    })
    .eq("id", shiftId)
    .eq("tenant_id", profile.tenant_id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}

function closeCalculations(
  shift: SalesShift,
  sales: DailySale[],
  expensesTotal: number,
  closingCashBalance: number,
) {
  const cashSales = sales
    .filter((sale) => sale.payment_method === "cash" && sale.status === "sold")
    .reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const expectedCash = Number(shift.opening_cash_balance) + cashSales - Number(expensesTotal);

  return {
    expected_cash: expectedCash,
    cash_difference: Number(closingCashBalance) - expectedCash,
  };
}
