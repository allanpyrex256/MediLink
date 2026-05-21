import { NextRequest, NextResponse } from "next/server";
import { canManageFinance, getAuthenticatedApiProfile } from "@/lib/api-profile";
import { hasSupabaseConfig } from "@/lib/config";
import {
  buildDailySaleInsert,
  buildLocalDemoDailySale,
  dailySaleCreateSchema,
  inventoryStatus,
} from "@/lib/dashboard-create";
import { buildDemoDashboardData } from "@/lib/demo-data";
import { DEMO_WORKSPACE_COOKIE, normalizeDemoWorkspaceId } from "@/lib/demo-session";
import {
  getLocalDemoWorkspaceState,
  saveLocalDemoDailySale,
  saveLocalDemoInventoryItem,
} from "@/lib/local-demo-store";
import { rateLimit } from "@/lib/security/rate-limit";
import type { DailySaleCategory, InventoryItem, SalesShift } from "@/lib/types";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limited = rateLimit(`daily-sales:${ip}`, 60);

  if (!limited.allowed) {
    return NextResponse.json({ error: "Too many sales requests. Please try again shortly." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = dailySaleCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid sale details", details: parsed.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    const workspaceId = normalizeDemoWorkspaceId(request.cookies.get(DEMO_WORKSPACE_COOKIE)?.value);
    const demo = buildDemoDashboardData(workspaceId);
    const local = await getLocalDemoWorkspaceState(workspaceId);
    const shifts = mergeById(demo.salesShifts, local.salesShifts);
    const inventory = mergeById(demo.inventory, local.inventory);
    const shift = shifts.find(
      (item) => item.id === parsed.data.shiftId && item.status === "open",
    );

    if (!shift) {
      return NextResponse.json({ error: "Open a shift before recording sales." }, { status: 409 });
    }

    let stockRemaining: number | null = null;
    const shiftDate = getShiftDate(shift);
    let saleInput = {
      ...parsed.data,
      saleDate: shiftDate,
    };
    const inventoryItem = findInventoryMatch(inventory, parsed.data.itemName, parsed.data.inventoryItemId);

    if (parsed.data.inventoryItemId && !inventoryItem) {
      return NextResponse.json({ error: "Inventory item not found." }, { status: 404 });
    }

    if (inventoryItem) {
      if (Number(inventoryItem.stock_on_hand) < parsed.data.quantity) {
        return NextResponse.json({ error: "Not enough stock remaining for this sale." }, { status: 409 });
      }

      stockRemaining = Number(inventoryItem.stock_on_hand) - parsed.data.quantity;
      saleInput = {
        ...saleInput,
        inventoryItemId: inventoryItem.id,
        itemName: inventoryItem.name,
        category: categoryFromInventory(inventoryItem.category),
        unitCost: Number(inventoryItem.unit_cost ?? parsed.data.unitCost ?? 0),
      };

      await saveLocalDemoInventoryItem({
        workspaceId,
        item: {
          ...inventoryItem,
          stock_on_hand: Math.max(0, Math.floor(stockRemaining)),
          status: inventoryStatus(Math.max(0, Math.floor(stockRemaining)), inventoryItem.reorder_level, inventoryItem.expiry_date),
        },
      });
    }

    const localSale = buildLocalDemoDailySale(saleInput, demo.tenant.id, demo.user.id);
    const sale = await saveLocalDemoDailySale({
      workspaceId,
      sale: {
        ...localSale,
        unit_cost: saleInput.unitCost,
        stock_remaining_after: stockRemaining,
      },
    });

    return NextResponse.json({ data: sale, demo: true }, { status: 201 });
  }

  const { supabase, profile } = await getAuthenticatedApiProfile();

  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageFinance(profile.role)) {
    return NextResponse.json({ error: "Only owners and sellers can record sales." }, { status: 403 });
  }

  const { data: shift } = await supabase
    .from("sales_shifts")
    .select("*")
    .eq("id", parsed.data.shiftId)
    .eq("tenant_id", profile.tenant_id)
    .eq("status", "open")
    .single();

  if (!shift) {
    return NextResponse.json({ error: "Open a shift before recording sales." }, { status: 409 });
  }

  let stockRemaining: number | null = null;
  const shiftDate = getShiftDate(shift as SalesShift);
  let saleInput = {
    ...parsed.data,
    saleDate: shiftDate,
  };
  const { data: inventoryRows } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("tenant_id", profile.tenant_id);
  const inventoryItem = findInventoryMatch((inventoryRows ?? []) as InventoryItem[], parsed.data.itemName, parsed.data.inventoryItemId);

  if (parsed.data.inventoryItemId && !inventoryItem) {
    return NextResponse.json({ error: "Inventory item not found." }, { status: 404 });
  }

  if (inventoryItem) {
    if (Number(inventoryItem.stock_on_hand) < parsed.data.quantity) {
      return NextResponse.json({ error: "Not enough stock remaining for this sale." }, { status: 409 });
    }

    stockRemaining = Number(inventoryItem.stock_on_hand) - parsed.data.quantity;
    saleInput = {
      ...saleInput,
      inventoryItemId: inventoryItem.id,
      itemName: inventoryItem.name,
      category: categoryFromInventory(inventoryItem.category),
      unitCost: Number(inventoryItem.unit_cost ?? parsed.data.unitCost ?? 0),
    };
  }

  const { data, error } = await supabase
    .from("daily_sales")
    .insert({
      ...buildDailySaleInsert(saleInput, profile.tenant_id, profile.id),
      stock_remaining_after: stockRemaining,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (saleInput.inventoryItemId && stockRemaining !== null) {
    const { data: currentItem } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("id", saleInput.inventoryItemId)
      .eq("tenant_id", profile.tenant_id)
      .single();

    if (currentItem) {
      const item = currentItem as InventoryItem;
      await supabase
        .from("inventory_items")
        .update({
          stock_on_hand: Math.max(0, Math.floor(stockRemaining)),
          status: inventoryStatus(Math.max(0, Math.floor(stockRemaining)), item.reorder_level, item.expiry_date),
        })
        .eq("id", saleInput.inventoryItemId)
        .eq("tenant_id", profile.tenant_id);
    }
  }

  return NextResponse.json({ data }, { status: 201 });
}

function categoryFromInventory(category: string): DailySaleCategory {
  const normalized = category.toLowerCase();
  if (normalized.includes("tablet")) return "tablet";
  if (normalized.includes("lab")) return "lab_test";
  if (normalized.includes("supply")) return "medical_supply";
  return "medicine";
}

function mergeById<T extends { id: string }>(base: T[], overrides: T[]) {
  const rows = new Map(base.map((item) => [item.id, item]));
  for (const item of overrides) rows.set(item.id, item);
  return Array.from(rows.values());
}

function getShiftDate(shift: { shift_date?: string; opened_at: string }) {
  return shift.shift_date ?? shift.opened_at.slice(0, 10);
}

function findInventoryMatch(
  items: InventoryItem[],
  itemName: string,
  inventoryItemId?: string | null,
) {
  if (inventoryItemId) {
    return items.find((item) => item.id === inventoryItemId) ?? null;
  }

  const typedName = normalizeItemName(itemName);
  if (!typedName) return null;

  return (
    items.find((item) => normalizeItemName(item.name) === typedName) ??
    items.find((item) => {
      const stockName = normalizeItemName(item.name);
      return stockName.includes(typedName) || typedName.includes(stockName);
    }) ??
    null
  );
}

function normalizeItemName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
