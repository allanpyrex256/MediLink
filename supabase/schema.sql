-- MediLink multi-tenant schema for Supabase PostgreSQL.
-- Run in the Supabase SQL editor, then enable Auth providers in the dashboard.

create extension if not exists "pgcrypto";

create type public.tenant_kind as enum ('clinic', 'hospital', 'pharmacy');
create type public.user_role as enum ('admin', 'doctor', 'receptionist', 'pharmacist', 'patient');
create type public.tenant_status as enum ('active', 'trialing', 'past_due', 'disabled');
create type public.appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'processing', 'paid', 'failed', 'refunded');
create type public.payment_provider as enum ('flutterwave', 'mtn_momo', 'airtel_money', 'stripe');
create type public.notification_channel as enum ('email', 'whatsapp', 'sms', 'in_app');
create type public.notification_status as enum ('queued', 'sent', 'failed');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'cancelled');

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid generated always as (id) stored,
  tenant_kind public.tenant_kind not null default 'clinic',
  name text not null,
  slug text not null unique,
  legal_name text not null,
  region text not null,
  address text not null,
  phone text not null,
  email text not null,
  status public.tenant_status not null default 'trialing',
  subdomain text unique,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name public.user_role not null,
  description text not null,
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  region text not null,
  manager text not null,
  patients_today int not null default 0,
  revenue_month numeric(12, 2) not null default 0,
  staff_online int not null default 0,
  status text not null default 'active' check (status in ('active', 'attention', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null default 'patient',
  phone text,
  avatar_url text,
  is_platform_admin boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  full_name text not null,
  specialization text not null,
  license_number text not null,
  phone text not null,
  email text not null,
  consultation_fee numeric(12, 2) not null default 0,
  status text not null default 'available' check (status in ('available', 'busy', 'offline')),
  room text not null default 'Unassigned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, license_number)
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  full_name text not null,
  date_of_birth date,
  sex text not null check (sex in ('female', 'male', 'other')),
  phone text not null,
  email text,
  national_id text,
  medical_history jsonb not null default '[]'::jsonb,
  allergies jsonb not null default '[]'::jsonb,
  emergency_contact jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  label text not null,
  status text not null default 'active' check (status in ('active', 'resolved')),
  diagnosed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clinical_prescriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  medication text not null,
  dosage text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  prescribed_by text not null,
  prescribed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lab_results (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  test_name text not null,
  requested_by text not null,
  status text not null default 'requested' check (status in ('requested', 'processing', 'completed', 'cancelled')),
  result_summary text,
  report_url text,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.visit_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_name text not null,
  visit_type text not null,
  notes text not null,
  visited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes int not null default 30 check (slot_minutes between 10 and 240),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, doctor_id, weekday, start_time)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete restrict,
  patient_id uuid not null references public.patients(id) on delete restrict,
  scheduled_at timestamptz not null,
  duration_minutes int not null default 30 check (duration_minutes between 10 and 240),
  status public.appointment_status not null default 'pending',
  reason text not null,
  notes text,
  fee numeric(12, 2) not null default 0,
  payment_status public.payment_status not null default 'pending',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index appointments_no_double_booking
  on public.appointments (tenant_id, doctor_id, scheduled_at)
  where status in ('pending', 'confirmed');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  provider public.payment_provider not null,
  provider_reference text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'UGX',
  status public.payment_status not null default 'pending',
  phone text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, provider, provider_reference)
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete set null,
  invoice_number text not null,
  customer_name text not null,
  amount numeric(12, 2) not null,
  paid_amount numeric(12, 2) not null default 0,
  status text not null default 'issued' check (status in ('draft', 'issued', 'paid', 'overdue', 'void')),
  payer_type text not null default 'cash' check (payer_type in ('cash', 'mobile_money', 'insurance')),
  due_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, invoice_number)
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  sku text not null,
  category text not null,
  stock_on_hand int not null default 0 check (stock_on_hand >= 0),
  reorder_level int not null default 0 check (reorder_level >= 0),
  unit_price numeric(12, 2) not null default 0,
  expiry_date date,
  status text not null default 'in_stock' check (status in ('in_stock', 'low_stock', 'out_of_stock', 'expiring')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, sku)
);

create table public.prescription_orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  patient_name text not null,
  prescriber text not null,
  medicine text not null,
  quantity int not null default 1 check (quantity > 0),
  status text not null default 'received' check (status in ('received', 'dispensing', 'ready', 'collected', 'cancelled')),
  total_amount numeric(12, 2) not null default 0,
  fulfillment_due timestamptz not null default now(),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  channel public.notification_channel not null,
  destination text not null,
  subject text not null,
  body text not null,
  status public.notification_status not null default 'queued',
  provider_message_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  plan text not null check (plan in ('starter', 'growth', 'enterprise')),
  status public.subscription_status not null default 'trialing',
  amount numeric(12, 2) not null default 0,
  currency text not null default 'UGX',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  provider text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on public.users (tenant_id, role);
create index on public.branches (tenant_id, status);
create index on public.doctors (tenant_id, specialization);
create index on public.patients (tenant_id, phone);
create index on public.diagnoses (tenant_id, patient_id, status);
create index on public.clinical_prescriptions (tenant_id, patient_id, status);
create index on public.lab_results (tenant_id, status, requested_at);
create index on public.visit_records (tenant_id, patient_id, visited_at);
create index on public.appointments (tenant_id, scheduled_at);
create index on public.payments (tenant_id, status, created_at);
create index on public.invoices (tenant_id, status, created_at);
create index on public.inventory_items (tenant_id, status);
create index on public.prescription_orders (tenant_id, status, created_at);
create index on public.notifications (tenant_id, status, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tenants_set_updated_at before update on public.tenants
for each row execute function public.set_updated_at();
create trigger branches_set_updated_at before update on public.branches
for each row execute function public.set_updated_at();
create trigger users_set_updated_at before update on public.users
for each row execute function public.set_updated_at();
create trigger doctors_set_updated_at before update on public.doctors
for each row execute function public.set_updated_at();
create trigger patients_set_updated_at before update on public.patients
for each row execute function public.set_updated_at();
create trigger diagnoses_set_updated_at before update on public.diagnoses
for each row execute function public.set_updated_at();
create trigger clinical_prescriptions_set_updated_at before update on public.clinical_prescriptions
for each row execute function public.set_updated_at();
create trigger lab_results_set_updated_at before update on public.lab_results
for each row execute function public.set_updated_at();
create trigger visit_records_set_updated_at before update on public.visit_records
for each row execute function public.set_updated_at();
create trigger schedules_set_updated_at before update on public.schedules
for each row execute function public.set_updated_at();
create trigger appointments_set_updated_at before update on public.appointments
for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices
for each row execute function public.set_updated_at();
create trigger inventory_items_set_updated_at before update on public.inventory_items
for each row execute function public.set_updated_at();
create trigger prescription_orders_set_updated_at before update on public.prescription_orders
for each row execute function public.set_updated_at();
create trigger notifications_set_updated_at before update on public.notifications
for each row execute function public.set_updated_at();
create trigger subscriptions_set_updated_at before update on public.subscriptions
for each row execute function public.set_updated_at();

create or replace function public.current_tenant_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select tenant_id from public.users where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_platform_admin from public.users where id = auth.uid()), false);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  created_tenant_id uuid;
  tenant_name text;
  tenant_slug text;
  tenant_kind public.tenant_kind;
  user_role public.user_role;
begin
  tenant_name := coalesce(new.raw_user_meta_data->>'tenant_name', 'New MediLink Clinic');
  tenant_slug := coalesce(new.raw_user_meta_data->>'tenant_slug', lower(regexp_replace(tenant_name, '[^a-zA-Z0-9]+', '-', 'g')));
  tenant_kind := coalesce((new.raw_user_meta_data->>'tenant_kind')::public.tenant_kind, 'clinic');
  user_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'admin');

  insert into public.tenants (tenant_kind, name, slug, legal_name, region, address, phone, email, status, subdomain, created_by)
  values (
    tenant_kind,
    tenant_name,
    tenant_slug,
    tenant_name,
    coalesce(new.raw_user_meta_data->>'region', 'Uganda'),
    coalesce(new.raw_user_meta_data->>'address', 'Pending setup'),
    coalesce(new.raw_user_meta_data->>'phone', '+256'),
    new.email,
    'trialing',
    tenant_slug,
    new.id
  )
  on conflict (slug) do update set updated_at = now()
  returning id into created_tenant_id;

  insert into public.users (id, tenant_id, email, full_name, role, phone, avatar_url)
  values (
    new.id,
    created_tenant_id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    user_role,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      updated_at = now();

  insert into public.roles (tenant_id, name, description, permissions)
  values
    (created_tenant_id, 'admin', 'Clinic owner and administrator', '{"manage_all": true}'::jsonb),
    (created_tenant_id, 'doctor', 'Clinical provider', '{"manage_own_schedule": true, "view_patients": true}'::jsonb),
    (created_tenant_id, 'receptionist', 'Front desk operations', '{"manage_appointments": true, "manage_patients": true}'::jsonb),
    (created_tenant_id, 'pharmacist', 'Dispensary and inventory operations', '{"manage_inventory": true, "manage_prescriptions": true}'::jsonb),
    (created_tenant_id, 'patient', 'Patient portal access', '{"view_own_records": true}'::jsonb)
  on conflict (tenant_id, name) do nothing;

  insert into public.subscriptions (tenant_id, plan, status, amount, currency)
  values (created_tenant_id, 'starter', 'trialing', 0, 'UGX')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.tenants enable row level security;
alter table public.roles enable row level security;
alter table public.branches enable row level security;
alter table public.users enable row level security;
alter table public.doctors enable row level security;
alter table public.patients enable row level security;
alter table public.diagnoses enable row level security;
alter table public.clinical_prescriptions enable row level security;
alter table public.lab_results enable row level security;
alter table public.visit_records enable row level security;
alter table public.schedules enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;
alter table public.inventory_items enable row level security;
alter table public.prescription_orders enable row level security;
alter table public.notifications enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;

create policy "platform admins can read all tenants"
on public.tenants for select
using (public.is_platform_admin() or id = public.current_tenant_id());

create policy "tenant admins can update their tenant"
on public.tenants for update
using (id = public.current_tenant_id() and public.current_user_role() = 'admin')
with check (id = public.current_tenant_id());

create policy "tenant members read roles"
on public.roles for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "admins manage roles"
on public.roles for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or public.is_platform_admin());

create policy "tenant members can read branches"
on public.branches for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "admins manage branches"
on public.branches for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or public.is_platform_admin());

create policy "tenant users can read tenant users"
on public.users for select
using (tenant_id = public.current_tenant_id() or id = auth.uid() or public.is_platform_admin());

create policy "admins can manage tenant users"
on public.users for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or id = auth.uid() or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or id = auth.uid() or public.is_platform_admin());

create policy "tenant members can read doctors"
on public.doctors for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "admins manage doctors"
on public.doctors for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist')) or public.is_platform_admin());

create policy "tenant members can read patients"
on public.patients for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "staff manage patients"
on public.patients for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist')) or public.is_platform_admin());

create policy "tenant members can read diagnoses"
on public.diagnoses for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "clinical staff manage diagnoses"
on public.diagnoses for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor')) or public.is_platform_admin());

create policy "tenant members can read clinical prescriptions"
on public.clinical_prescriptions for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "clinical staff manage clinical prescriptions"
on public.clinical_prescriptions for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor')) or public.is_platform_admin());

create policy "tenant members can read lab results"
on public.lab_results for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "clinical staff manage lab results"
on public.lab_results for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist')) or public.is_platform_admin());

create policy "tenant members can read visit records"
on public.visit_records for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "clinical staff manage visit records"
on public.visit_records for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor')) or public.is_platform_admin());

create policy "tenant members can read schedules"
on public.schedules for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "staff manage schedules"
on public.schedules for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist')) or public.is_platform_admin());

create policy "tenant members can read appointments"
on public.appointments for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "staff create and update appointments"
on public.appointments for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist', 'patient')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist', 'patient')) or public.is_platform_admin());

create policy "tenant members can read payments"
on public.payments for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "staff manage payments"
on public.payments for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')) or public.is_platform_admin());

create policy "tenant members can read invoices"
on public.invoices for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "staff manage invoices"
on public.invoices for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist', 'pharmacist')) or public.is_platform_admin());

create policy "tenant members can read inventory"
on public.inventory_items for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "pharmacy staff manage inventory"
on public.inventory_items for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'pharmacist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'pharmacist')) or public.is_platform_admin());

create policy "tenant members can read prescription orders"
on public.prescription_orders for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "pharmacy staff manage prescription orders"
on public.prescription_orders for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist', 'pharmacist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist', 'pharmacist')) or public.is_platform_admin());

create policy "tenant members can read notifications"
on public.notifications for select
using (tenant_id = public.current_tenant_id() or public.is_platform_admin());

create policy "staff manage notifications"
on public.notifications for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist')) or public.is_platform_admin());

create policy "admins read subscriptions"
on public.subscriptions for select
using ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or public.is_platform_admin());

create policy "platform admins manage subscriptions"
on public.subscriptions for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "tenant admins read audit logs"
on public.audit_logs for select
using ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or public.is_platform_admin());
