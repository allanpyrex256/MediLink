alter table public.sales_shifts
  add column if not exists shift_type text not null default 'day' check (shift_type in ('day', 'night'));

drop index if exists public.sales_shifts_one_shift_per_seller_day_idx;
drop index if exists public.sales_shifts_tenant_date_status_opened_idx;

create unique index if not exists sales_shifts_one_shift_per_seller_day_type_idx
  on public.sales_shifts (tenant_id, seller_id, shift_date, shift_type)
  where seller_id is not null;

create index if not exists sales_shifts_tenant_date_type_status_opened_idx
  on public.sales_shifts (tenant_id, shift_date, shift_type, status, opened_at desc);
