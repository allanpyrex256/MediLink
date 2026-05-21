create table if not exists public.daily_sales (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sale_date date not null default current_date,
  item_name text not null,
  category text not null default 'medicine' check (
    category in ('medicine', 'tablet', 'clinic_service', 'consultation', 'lab_test', 'medical_supply', 'other')
  ),
  quantity numeric(12, 2) not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  total_amount numeric(12, 2) generated always as (quantity * unit_price) stored,
  payment_method text not null default 'cash' check (
    payment_method in ('cash', 'mtn_momo', 'airtel_money', 'card', 'insurance', 'other')
  ),
  sold_by uuid references public.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_sales_tenant_date_idx
  on public.daily_sales (tenant_id, sale_date, created_at desc);

alter table public.daily_sales enable row level security;

drop policy if exists "tenant finance staff can read daily sales" on public.daily_sales;
drop policy if exists "tenant finance staff can manage daily sales" on public.daily_sales;

create policy "tenant finance staff can read daily sales"
on public.daily_sales for select
using (
  public.is_platform_admin()
  or (
    tenant_id = public.current_tenant_id()
    and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')
  )
);

create policy "tenant finance staff can manage daily sales"
on public.daily_sales for all
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

drop trigger if exists daily_sales_set_updated_at on public.daily_sales;
create trigger daily_sales_set_updated_at before update on public.daily_sales
for each row execute function public.set_updated_at();
