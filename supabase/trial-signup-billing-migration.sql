-- Update the signup trigger so new trial workspaces capture plan and billing details.
-- Run this in Supabase SQL Editor if you already ran schema.sql before this change.

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
  subscription_plan text;
  subscription_amount numeric(12, 2);
  payment_method text;
  billing_phone text;
begin
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
      phone = excluded.phone,
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
