alter table public.subscriptions
  alter column currency set default 'UGX';

alter table public.subscriptions
  add column if not exists billing_cycle text not null default 'monthly';

update public.subscriptions
set billing_cycle = 'monthly',
    updated_at = now()
where billing_cycle not in ('monthly', 'annual');

alter table public.subscriptions
  drop constraint if exists subscriptions_billing_cycle_check;

alter table public.subscriptions
  add constraint subscriptions_billing_cycle_check
  check (billing_cycle in ('monthly', 'annual'));

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;

alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('starter', 'growth', 'dental', 'enterprise'));

update public.subscriptions as subscription
set plan = 'dental',
    amount = 60000,
    currency = 'UGX',
    billing_cycle = coalesce(nullif(billing_cycle, ''), 'monthly'),
    updated_at = now()
from public.tenants as tenant
where subscription.tenant_id = tenant.id
  and tenant.tenant_kind = 'dentistry';

update public.subscriptions
set amount = case plan
    when 'starter' then 50000
    when 'growth' then 100000
    when 'dental' then 60000
    when 'enterprise' then 200000
    else amount
  end,
  currency = 'UGX',
  billing_cycle = coalesce(nullif(billing_cycle, ''), 'monthly'),
  updated_at = now()
where plan in ('starter', 'growth', 'dental', 'enterprise');

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
  subscription_billing_cycle text;
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
  subscription_billing_cycle := coalesce(new.raw_user_meta_data->>'subscription_billing_cycle', 'monthly');
  payment_method := coalesce(new.raw_user_meta_data->>'payment_method', 'stripe');
  billing_phone := coalesce(new.raw_user_meta_data->>'billing_phone', new.raw_user_meta_data->>'phone', '+256');

  if subscription_plan not in ('starter', 'growth', 'dental', 'enterprise') then
    subscription_plan := 'starter';
  end if;

  if subscription_billing_cycle not in ('monthly', 'annual') then
    subscription_billing_cycle := 'monthly';
  end if;

  subscription_amount := case subscription_plan
    when 'starter' then 50000
    when 'growth' then 100000
    when 'dental' then 60000
    when 'enterprise' then 200000
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
    (created_tenant_id, 'dentist', 'Dental provider', '{"manage_own_schedule": true, "view_patients": true, "manage_treatment_notes": true}'::jsonb),
    (created_tenant_id, 'receptionist', 'Front desk operations', '{"manage_appointments": true, "manage_patients": true}'::jsonb),
    (created_tenant_id, 'pharmacist', 'Dispensary and inventory operations', '{"manage_inventory": true, "manage_prescriptions": true}'::jsonb),
    (created_tenant_id, 'patient', 'Patient portal access', '{"view_own_records": true}'::jsonb)
  on conflict (tenant_id, name) do nothing;

  insert into public.subscriptions (tenant_id, plan, status, amount, currency, billing_cycle, provider)
  values (
    created_tenant_id,
    subscription_plan,
    'trialing',
    subscription_amount,
    'UGX',
    subscription_billing_cycle,
    payment_method
  )
  on conflict do nothing;

  return new;
end;
$$;
