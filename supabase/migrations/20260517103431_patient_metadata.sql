-- Run this only if you already created the MediLink schema before patient metadata existed.
-- New Supabase projects can run supabase/schema.sql directly instead.

alter table public.patients
add column if not exists metadata jsonb not null default '{}'::jsonb;
