-- Adds dentistry as a first-class tenant kind and dentist as a staff role.

alter type public.tenant_kind add value if not exists 'dentistry';
alter type public.user_role add value if not exists 'dentist';

drop policy if exists "tenant members can read patients" on public.patients;
drop policy if exists "staff manage patients" on public.patients;
drop policy if exists "tenant members can read diagnoses" on public.diagnoses;
drop policy if exists "clinical staff manage diagnoses" on public.diagnoses;
drop policy if exists "tenant members can read clinical prescriptions" on public.clinical_prescriptions;
drop policy if exists "clinical staff manage clinical prescriptions" on public.clinical_prescriptions;
drop policy if exists "tenant members can read lab results" on public.lab_results;
drop policy if exists "clinical staff manage lab results" on public.lab_results;
drop policy if exists "tenant members can read visit records" on public.visit_records;
drop policy if exists "clinical staff manage visit records" on public.visit_records;
drop policy if exists "staff manage schedules" on public.schedules;
drop policy if exists "tenant members can read appointments" on public.appointments;
drop policy if exists "staff create and update appointments" on public.appointments;
drop policy if exists "pharmacy staff manage prescription orders" on public.prescription_orders;
drop policy if exists "clinic staff can read document templates" on public.document_templates;

create policy "tenant members can read patients"
on public.patients for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist'))
  or user_id = auth.uid()
);

create policy "staff manage patients"
on public.patients for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist')) or public.is_platform_admin());

create policy "tenant members can read diagnoses"
on public.diagnoses for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist'))
  or exists (
    select 1 from public.patients
    where patients.id = diagnoses.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "clinical staff manage diagnoses"
on public.diagnoses for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist')) or public.is_platform_admin());

create policy "tenant members can read clinical prescriptions"
on public.clinical_prescriptions for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist'))
  or exists (
    select 1 from public.patients
    where patients.id = clinical_prescriptions.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "clinical staff manage clinical prescriptions"
on public.clinical_prescriptions for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist')) or public.is_platform_admin());

create policy "tenant members can read lab results"
on public.lab_results for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist'))
  or exists (
    select 1 from public.patients
    where patients.id = lab_results.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "clinical staff manage lab results"
on public.lab_results for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist')) or public.is_platform_admin());

create policy "tenant members can read visit records"
on public.visit_records for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist'))
  or exists (
    select 1 from public.patients
    where patients.id = visit_records.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "clinical staff manage visit records"
on public.visit_records for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist')) or public.is_platform_admin());

create policy "staff manage schedules"
on public.schedules for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist')) or public.is_platform_admin());

create policy "tenant members can read appointments"
on public.appointments for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist'))
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
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist'))
  or exists (
    select 1 from public.patients
    where patients.id = appointments.patient_id
      and patients.user_id = auth.uid()
  )
)
with check (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist'))
  or exists (
    select 1 from public.patients
    where patients.id = appointments.patient_id
      and patients.user_id = auth.uid()
  )
);

create policy "pharmacy staff manage prescription orders"
on public.prescription_orders for all
using ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist', 'pharmacist')) or public.is_platform_admin())
with check ((tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist', 'pharmacist')) or public.is_platform_admin());

create policy "clinic staff can read document templates"
on public.document_templates for select
using (
  public.is_platform_admin()
  or (tenant_id = public.current_tenant_id() and public.current_user_role()::text in ('admin', 'doctor', 'dentist', 'receptionist'))
);
