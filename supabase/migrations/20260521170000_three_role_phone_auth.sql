-- MediLink simplified SaaS roles and phone/password authentication.
-- Run before using live owner/seller/pharmacist accounts.

alter type public.user_role add value if not exists 'owner';
alter type public.user_role add value if not exists 'seller';

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
  payment_method text;
  billing_phone text;
  auth_email text;
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
  payment_method := coalesce(new.raw_user_meta_data->>'payment_method', 'mtn_momo');

  if user_role = 'admin' then
    user_role := 'owner';
  end if;

  if subscription_plan not in ('starter', 'growth', 'enterprise') then
    subscription_plan := 'starter';
  end if;

  subscription_amount := case subscription_plan
    when 'starter' then 50000
    when 'growth' then 100000
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

  insert into public.subscriptions (tenant_id, plan, status, amount, currency, provider)
  values (created_tenant_id, subscription_plan, 'trialing', subscription_amount, 'UGX', payment_method)
  on conflict do nothing;

  return new;
end;
$$;

drop policy if exists "tenant users can read tenant users" on public.users;
drop policy if exists "admins can manage tenant users" on public.users;
drop policy if exists "tenant admins read staff invitations" on public.staff_invitations;
drop policy if exists "tenant admins manage staff invitations" on public.staff_invitations;
drop policy if exists "tenant members can read inventory" on public.inventory_items;
drop policy if exists "pharmacy staff manage inventory" on public.inventory_items;
drop policy if exists "tenant finance staff can read sales shifts" on public.sales_shifts;
drop policy if exists "tenant finance staff can insert sales shifts" on public.sales_shifts;
drop policy if exists "tenant finance staff can close sales shifts" on public.sales_shifts;
drop policy if exists "tenant finance staff can read shift expenses" on public.shift_expenses;
drop policy if exists "tenant finance staff can insert shift expenses" on public.shift_expenses;
drop policy if exists "tenant finance staff can read daily sales" on public.daily_sales;
drop policy if exists "tenant finance staff can insert daily sales" on public.daily_sales;
drop policy if exists "tenant members can read prescription orders" on public.prescription_orders;
drop policy if exists "pharmacy staff manage prescription orders" on public.prescription_orders;
drop policy if exists "tenant admins can update their tenant" on public.tenants;
drop policy if exists "admins read subscriptions" on public.subscriptions;
drop policy if exists "tenant admins read audit logs" on public.audit_logs;

create policy "tenant users can read tenant users"
on public.users for select
using (
  id = auth.uid()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin'))
  or public.is_platform_admin()
);

create policy "admins can manage tenant users"
on public.users for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin')) or public.is_platform_admin());

create policy "tenant admins read staff invitations"
on public.staff_invitations for select
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin')) or public.is_platform_admin());

create policy "tenant admins manage staff invitations"
on public.staff_invitations for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin')) or public.is_platform_admin());

create policy "tenant admins can update their tenant"
on public.tenants for update
using (id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin'))
with check (id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin'));

create policy "tenant members can read inventory"
on public.inventory_items for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'seller', 'receptionist', 'pharmacist'))
);

create policy "pharmacy staff manage inventory"
on public.inventory_items for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'seller', 'receptionist', 'pharmacist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'seller', 'receptionist', 'pharmacist')) or public.is_platform_admin());

create policy "tenant finance staff can read sales shifts"
on public.sales_shifts for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'seller', 'receptionist'))
);

create policy "tenant finance staff can insert sales shifts"
on public.sales_shifts for insert
with check (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'seller', 'receptionist'))
);

create policy "tenant finance staff can close sales shifts"
on public.sales_shifts for update
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'seller', 'receptionist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'seller', 'receptionist')) or public.is_platform_admin());

create policy "tenant finance staff can read shift expenses"
on public.shift_expenses for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'seller', 'receptionist'))
);

create policy "tenant finance staff can insert shift expenses"
on public.shift_expenses for insert
with check (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'seller', 'receptionist'))
);

create policy "tenant finance staff can read daily sales"
on public.daily_sales for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'seller', 'receptionist'))
);

create policy "tenant finance staff can insert daily sales"
on public.daily_sales for insert
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'seller', 'receptionist')) or public.is_platform_admin());

create policy "tenant members can read prescription orders"
on public.prescription_orders for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'pharmacist'))
);

create policy "pharmacy staff manage prescription orders"
on public.prescription_orders for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'pharmacist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin', 'pharmacist')) or public.is_platform_admin());

create policy "admins read subscriptions"
on public.subscriptions for select
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin')) or public.is_platform_admin());

create policy "tenant admins read audit logs"
on public.audit_logs for select
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('owner', 'admin')) or public.is_platform_admin());
