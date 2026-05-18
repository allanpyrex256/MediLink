-- Adds owner-managed staff accounts under the same tenant and tightens role access.

create table if not exists public.staff_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null check (role <> 'patient'),
  phone text,
  status text not null default 'pending' check (status in ('pending', 'sent', 'accepted', 'expired')),
  invited_by uuid references public.users(id) on delete set null,
  sent_at timestamptz,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create index if not exists staff_invitations_tenant_status_created_idx
on public.staff_invitations (tenant_id, status, created_at);

drop trigger if exists staff_invitations_set_updated_at on public.staff_invitations;
create trigger staff_invitations_set_updated_at before update on public.staff_invitations
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  created_tenant_id uuid;
  staff_invitation public.staff_invitations%rowtype;
  staff_invitation_id uuid;
  tenant_name text;
  tenant_slug text;
  tenant_kind public.tenant_kind;
  user_role public.user_role;
  subscription_plan text;
  subscription_amount numeric(12, 2);
  payment_method text;
  billing_phone text;
begin
  staff_invitation_id := nullif(new.raw_user_meta_data->>'staff_invitation_id', '')::uuid;

  if staff_invitation_id is not null then
    select *
    into staff_invitation
    from public.staff_invitations
    where id = staff_invitation_id
      and lower(email) = lower(new.email)
      and status in ('pending', 'sent')
      and expires_at > now();

    if staff_invitation.id is null then
      raise exception 'Invalid or expired MediLink staff invitation';
    end if;

    insert into public.users (id, tenant_id, email, full_name, role, phone, avatar_url)
    values (
      new.id,
      staff_invitation.tenant_id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', staff_invitation.full_name, new.email),
      staff_invitation.role,
      coalesce(new.raw_user_meta_data->>'phone', staff_invitation.phone),
      new.raw_user_meta_data->>'avatar_url'
    )
    on conflict (id) do update
    set tenant_id = excluded.tenant_id,
        email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role,
        phone = excluded.phone,
        avatar_url = excluded.avatar_url,
        updated_at = now();

    update public.staff_invitations
    set status = 'sent',
        sent_at = coalesce(sent_at, now()),
        updated_at = now()
    where id = staff_invitation.id;

    return new;
  end if;

  tenant_name := coalesce(new.raw_user_meta_data->>'tenant_name', 'New MediLink Clinic');
  tenant_slug := coalesce(new.raw_user_meta_data->>'tenant_slug', lower(regexp_replace(tenant_name, '[^a-zA-Z0-9]+', '-', 'g')));
  tenant_kind := coalesce((new.raw_user_meta_data->>'tenant_kind')::public.tenant_kind, 'clinic');
  user_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'admin');
  subscription_plan := coalesce(new.raw_user_meta_data->>'subscription_plan', 'starter');
  payment_method := coalesce(new.raw_user_meta_data->>'payment_method', 'mtn_momo');
  billing_phone := coalesce(new.raw_user_meta_data->>'billing_phone', new.raw_user_meta_data->>'phone', '+256');

  if subscription_plan not in ('starter', 'growth', 'enterprise') then
    subscription_plan := 'starter';
  end if;

  subscription_amount := case subscription_plan
    when 'starter' then 50000
    when 'growth' then 150000
    when 'enterprise' then 450000
    else 50000
  end;

  insert into public.tenants (tenant_kind, name, slug, legal_name, region, address, phone, email, status, subdomain, created_by)
  values (
    tenant_kind,
    tenant_name,
    tenant_slug,
    tenant_name,
    coalesce(new.raw_user_meta_data->>'region', 'Uganda'),
    coalesce(new.raw_user_meta_data->>'address', 'Pending setup'),
    billing_phone,
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
    billing_phone,
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

  insert into public.subscriptions (tenant_id, plan, status, amount, currency, provider)
  values (created_tenant_id, subscription_plan, 'trialing', subscription_amount, 'UGX', payment_method)
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.staff_invitations enable row level security;

drop policy if exists "tenant users can read tenant users" on public.users;
drop policy if exists "admins can manage tenant users" on public.users;
drop policy if exists "tenant admins read staff invitations" on public.staff_invitations;
drop policy if exists "tenant admins manage staff invitations" on public.staff_invitations;
drop policy if exists "tenant members can read patients" on public.patients;
drop policy if exists "tenant members can read diagnoses" on public.diagnoses;
drop policy if exists "tenant members can read clinical prescriptions" on public.clinical_prescriptions;
drop policy if exists "tenant members can read lab results" on public.lab_results;
drop policy if exists "tenant members can read visit records" on public.visit_records;
drop policy if exists "tenant members can read appointments" on public.appointments;
drop policy if exists "staff create and update appointments" on public.appointments;
drop policy if exists "tenant members can read payments" on public.payments;
drop policy if exists "tenant members can read invoices" on public.invoices;
drop policy if exists "tenant members can read inventory" on public.inventory_items;
drop policy if exists "tenant members can read notifications" on public.notifications;

create policy "tenant users can read tenant users"
on public.users for select
using (
  id = auth.uid()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin')
  or public.is_platform_admin()
);

create policy "admins can manage tenant users"
on public.users for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or public.is_platform_admin());

create policy "tenant admins read staff invitations"
on public.staff_invitations for select
using ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or public.is_platform_admin());

create policy "tenant admins manage staff invitations"
on public.staff_invitations for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role() = 'admin') or public.is_platform_admin());

create policy "tenant members can read patients"
on public.patients for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist'))
  or user_id = auth.uid()
);

create policy "tenant members can read diagnoses"
on public.diagnoses for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor'))
  or exists (
    select 1 from public.patients
    where patients.id = diagnoses.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "tenant members can read clinical prescriptions"
on public.clinical_prescriptions for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor'))
  or exists (
    select 1 from public.patients
    where patients.id = clinical_prescriptions.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "tenant members can read lab results"
on public.lab_results for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist'))
  or exists (
    select 1 from public.patients
    where patients.id = lab_results.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "tenant members can read visit records"
on public.visit_records for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor'))
  or exists (
    select 1 from public.patients
    where patients.id = visit_records.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "tenant members can read appointments"
on public.appointments for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist'))
  or exists (
    select 1 from public.patients
    where patients.id = appointments.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "staff create and update appointments"
on public.appointments for all
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist'))
  or exists (
    select 1 from public.patients
    where patients.id = appointments.patient_id
      and patients.user_id = auth.uid()
  )
)
with check (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'doctor', 'receptionist'))
  or exists (
    select 1 from public.patients
    where patients.id = appointments.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "tenant members can read payments"
on public.payments for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist', 'pharmacist'))
  or exists (
    select 1 from public.patients
    where patients.id = payments.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "tenant members can read invoices"
on public.invoices for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist', 'pharmacist'))
  or exists (
    select 1 from public.patients
    where patients.id = invoices.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "tenant members can read inventory"
on public.inventory_items for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'pharmacist'))
);

create policy "tenant members can read notifications"
on public.notifications for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist'))
  or user_id = auth.uid()
);
