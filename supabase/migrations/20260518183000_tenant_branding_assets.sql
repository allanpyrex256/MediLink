alter table public.tenants
  add column if not exists logo_url text,
  add column if not exists cover_image_url text,
  add column if not exists profile_image_url text,
  add column if not exists primary_color text,
  add column if not exists accent_color text,
  add column if not exists theme text check (theme in ('purple', 'blue', 'green', 'dark')),
  add column if not exists brand_tagline text,
  add column if not exists logo_approved_at timestamptz,
  add column if not exists storage_usage_mb numeric(12, 2) not null default 0;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-assets',
  'tenant-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
