alter table public.inventory_items
  add column if not exists unit_cost numeric(12, 2) not null default 0 check (unit_cost >= 0);

create table if not exists public.sales_shifts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  shift_code text not null,
  seller_id uuid references public.users(id) on delete set null,
  seller_name text not null,
  branch_name text not null default 'Main branch',
  opening_cash_balance numeric(12, 2) not null default 0 check (opening_cash_balance >= 0),
  closing_cash_balance numeric(12, 2) check (closing_cash_balance >= 0),
  expenses_total numeric(12, 2) not null default 0 check (expenses_total >= 0),
  expected_cash numeric(12, 2),
  cash_difference numeric(12, 2),
  device_name text,
  notes text,
  closing_notes text,
  status text not null default 'open' check (status in ('open', 'closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, shift_code)
);

create unique index if not exists sales_shifts_one_open_shift_per_seller_idx
  on public.sales_shifts (tenant_id, seller_id)
  where status = 'open' and seller_id is not null;

create index if not exists sales_shifts_tenant_status_opened_idx
  on public.sales_shifts (tenant_id, status, opened_at desc);

create table if not exists public.shift_expenses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  shift_id uuid not null references public.sales_shifts(id) on delete restrict,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  category text not null default 'other' check (category in ('transport', 'lunch', 'emergency_purchase', 'utilities', 'other')),
  spent_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists shift_expenses_tenant_shift_idx
  on public.shift_expenses (tenant_id, shift_id, created_at desc);

alter table public.daily_sales
  add column if not exists shift_id uuid references public.sales_shifts(id) on delete restrict,
  add column if not exists inventory_item_id uuid references public.inventory_items(id) on delete set null,
  add column if not exists customer_name text,
  add column if not exists unit_cost numeric(12, 2) not null default 0 check (unit_cost >= 0),
  add column if not exists stock_remaining_after numeric(12, 2),
  add column if not exists status text not null default 'sold' check (status in ('sold', 'refunded', 'void'));

alter table public.daily_sales
  add column if not exists profit_amount numeric(12, 2)
  generated always as ((unit_price - unit_cost) * quantity) stored;

create index if not exists daily_sales_tenant_shift_idx
  on public.daily_sales (tenant_id, shift_id, created_at desc);

alter table public.sales_shifts enable row level security;
alter table public.shift_expenses enable row level security;

drop policy if exists "tenant finance staff can read sales shifts" on public.sales_shifts;
drop policy if exists "tenant finance staff can insert sales shifts" on public.sales_shifts;
drop policy if exists "tenant finance staff can close sales shifts" on public.sales_shifts;

create policy "tenant finance staff can read sales shifts"
on public.sales_shifts for select
using (
  public.is_platform_admin()
  or (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')
  )
);

create policy "tenant finance staff can insert sales shifts"
on public.sales_shifts for insert
with check (
  public.is_platform_admin()
  or (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')
  )
);

create policy "tenant finance staff can close sales shifts"
on public.sales_shifts for update
using (
  public.is_platform_admin()
  or (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')
  )
)
with check (
  public.is_platform_admin()
  or (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')
  )
);

drop policy if exists "tenant finance staff can read shift expenses" on public.shift_expenses;
drop policy if exists "tenant finance staff can insert shift expenses" on public.shift_expenses;

create policy "tenant finance staff can read shift expenses"
on public.shift_expenses for select
using (
  public.is_platform_admin()
  or (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')
  )
);

create policy "tenant finance staff can insert shift expenses"
on public.shift_expenses for insert
with check (
  public.is_platform_admin()
  or (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')
  )
);

drop policy if exists "tenant finance staff can manage daily sales" on public.daily_sales;
drop policy if exists "tenant finance staff can insert daily sales" on public.daily_sales;

create policy "tenant finance staff can insert daily sales"
on public.daily_sales for insert
with check (
  public.is_platform_admin()
  or (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')
  )
);

drop trigger if exists sales_shifts_set_updated_at on public.sales_shifts;
create trigger sales_shifts_set_updated_at before update on public.sales_shifts
for each row execute function public.set_updated_at();
