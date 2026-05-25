-- Give every newly created owner/admin workspace a 7-day free trial.

alter table public.subscriptions
  add column if not exists trial_ends_at timestamptz;

update public.subscriptions
set trial_ends_at = coalesce(
    trial_ends_at,
    case
      when status = 'trialing' then coalesce(current_period_start, created_at, now()) + interval '7 days'
      else current_period_end
    end
  ),
  current_period_end = case
    when status = 'trialing'
      and current_period_end > coalesce(current_period_start, created_at, now()) + interval '7 days'
      then coalesce(current_period_start, created_at, now()) + interval '7 days'
    else current_period_end
  end,
  updated_at = now()
where trial_ends_at is null
  or (
    status = 'trialing'
    and current_period_end > coalesce(current_period_start, created_at, now()) + interval '7 days'
  );

alter table public.subscriptions
  alter column trial_ends_at set not null,
  alter column trial_ends_at set default (now() + interval '7 days'),
  alter column current_period_end set default (now() + interval '7 days');

create index if not exists subscriptions_trial_ends_at_idx
  on public.subscriptions (status, trial_ends_at);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  created_tenant_id uuid;
  existing_tenant_id uuid;
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
  auth_email text;
  trial_started_at timestamptz;
  trial_ends_at timestamptz;
begin
  auth_email := coalesce(
    nullif(new.email, ''),
    concat(regexp_replace(coalesce(new.phone, new.id::text), '[^0-9a-zA-Z]+', '', 'g'), '@phone.medilink.local')
  );
  billing_phone := coalesce(new.raw_user_meta_data->>'billing_phone', new.raw_user_meta_data->>'phone', new.phone, '+256');
  staff_invitation_id := nullif(new.raw_user_meta_data->>'staff_invitation_id', '')::uuid;
  existing_tenant_id := nullif(new.raw_user_meta_data->>'tenant_id', '')::uuid;

  if existing_tenant_id is not null then
    user_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'seller');

    insert into public.users (id, tenant_id, email, full_name, role, phone, avatar_url)
    values (
      new.id,
      existing_tenant_id,
      auth_email,
      coalesce(new.raw_user_meta_data->>'full_name', new.phone, auth_email),
      user_role,
      coalesce(new.raw_user_meta_data->>'phone', new.phone),
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

    return new;
  end if;

  if staff_invitation_id is not null then
    select *
    into staff_invitation
    from public.staff_invitations
    where id = staff_invitation_id
      and lower(email) = lower(auth_email)
      and status in ('pending', 'sent')
      and expires_at > now();

    if staff_invitation.id is null then
      raise exception 'Invalid or expired MediLink staff invitation';
    end if;

    insert into public.users (id, tenant_id, email, full_name, role, phone, avatar_url)
    values (
      new.id,
      staff_invitation.tenant_id,
      auth_email,
      coalesce(new.raw_user_meta_data->>'full_name', staff_invitation.full_name, auth_email),
      staff_invitation.role,
      coalesce(new.raw_user_meta_data->>'phone', staff_invitation.phone, new.phone),
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

  tenant_name := coalesce(new.raw_user_meta_data->>'tenant_name', 'New MediLink Business');
  tenant_slug := coalesce(new.raw_user_meta_data->>'tenant_slug', lower(regexp_replace(tenant_name, '[^a-zA-Z0-9]+', '-', 'g')));
  tenant_kind := coalesce((new.raw_user_meta_data->>'tenant_kind')::public.tenant_kind, 'pharmacy');
  user_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'owner');
  subscription_plan := coalesce(new.raw_user_meta_data->>'subscription_plan', 'starter');
  subscription_billing_cycle := coalesce(new.raw_user_meta_data->>'subscription_billing_cycle', 'monthly');
  payment_method := coalesce(new.raw_user_meta_data->>'payment_method', 'mtn_momo');
  trial_started_at := now();
  trial_ends_at := trial_started_at + interval '7 days';

  if user_role = 'admin' then
    user_role := 'owner';
  end if;

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
    auth_email,
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
    auth_email,
    coalesce(new.raw_user_meta_data->>'full_name', auth_email),
    user_role,
    billing_phone,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role,
      phone = excluded.phone,
      updated_at = now();

  insert into public.roles (tenant_id, name, description, permissions)
  values
    (created_tenant_id, 'owner', 'Business owner with full access', '{"manage_all": true}'::jsonb),
    (created_tenant_id, 'seller', 'Seller with shift and sales access', '{"manage_sales": true}'::jsonb),
    (created_tenant_id, 'pharmacist', 'Pharmacist with inventory and dispensing access', '{"manage_inventory": true, "manage_prescriptions": true}'::jsonb)
  on conflict (tenant_id, name) do nothing;

  insert into public.subscriptions (
    tenant_id,
    plan,
    status,
    amount,
    currency,
    billing_cycle,
    current_period_start,
    current_period_end,
    trial_ends_at,
    provider
  )
  values (
    created_tenant_id,
    subscription_plan,
    'trialing',
    subscription_amount,
    'UGX',
    subscription_billing_cycle,
    trial_started_at,
    trial_ends_at,
    trial_ends_at,
    payment_method
  )
  on conflict do nothing;

  return new;
end;
$$;
