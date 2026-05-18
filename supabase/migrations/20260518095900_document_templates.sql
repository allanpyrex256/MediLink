-- Adds tenant-owned blank document templates for clinic and hospital forms.

create table if not exists public.document_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  storage_path text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists document_templates_tenant_created_idx
on public.document_templates (tenant_id, created_at);

drop trigger if exists document_templates_set_updated_at on public.document_templates;
create trigger document_templates_set_updated_at before update on public.document_templates
for each row execute function public.set_updated_at();

alter table public.document_templates enable row level security;

drop policy if exists "clinic staff can read document templates" on public.document_templates;
drop policy if exists "admins and reception manage document templates" on public.document_templates;

create policy "clinic staff can read document templates"
on public.document_templates for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist'))
);

create policy "admins and reception manage document templates"
on public.document_templates for all
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist'))
)
with check (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role() in ('admin', 'receptionist'))
);

insert into storage.buckets (id, name, public)
values ('tenant-documents', 'tenant-documents', false)
on conflict (id) do nothing;
