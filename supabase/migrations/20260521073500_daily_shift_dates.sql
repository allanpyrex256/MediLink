alter table public.sales_shifts
  add column if not exists shift_date date;

update public.sales_shifts
set shift_date = (opened_at at time zone 'Africa/Kampala')::date
where shift_date is null;

alter table public.sales_shifts
  alter column shift_date set default current_date,
  alter column shift_date set not null;

drop index if exists public.sales_shifts_one_open_shift_per_seller_idx;
drop index if exists public.sales_shifts_tenant_status_opened_idx;

create unique index if not exists sales_shifts_one_shift_per_seller_day_idx
  on public.sales_shifts (tenant_id, seller_id, shift_date)
  where seller_id is not null;

create index if not exists sales_shifts_tenant_date_status_opened_idx
  on public.sales_shifts (tenant_id, shift_date, status, opened_at desc);
