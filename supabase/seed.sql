insert into public.tenants (id, tenant_kind, name, slug, legal_name, region, address, phone, email, status, subdomain)
values (
  '11111111-1111-4111-8111-111111111111',
  'clinic',
  'Kampala Family Clinic',
  'kampala-family-clinic',
  'Kampala Family Clinic Ltd',
  'Kampala, Uganda',
  'Plot 21 Acacia Avenue, Kololo',
  '+256 700 112 233',
  'admin@kampalafamilyclinic.ug',
  'trialing',
  'kampala-family-clinic'
)
on conflict (id) do nothing;

insert into public.doctors (tenant_id, full_name, specialization, license_number, phone, email, consultation_fee, status, room)
values
  ('11111111-1111-4111-8111-111111111111', 'Dr. Daniel Okello', 'General Medicine', 'UMD-10492', '+256 701 654 810', 'daniel.okello@kampalafamilyclinic.ug', 65000, 'available', 'Room 3'),
  ('11111111-1111-4111-8111-111111111111', 'Dr. Aisha Nakasujja', 'Pediatrics', 'UMD-11984', '+256 752 889 401', 'aisha.nakasujja@kampalafamilyclinic.ug', 80000, 'busy', 'Room 6')
on conflict (tenant_id, license_number) do nothing;

insert into public.branches (tenant_id, name, region, manager, patients_today, revenue_month, staff_online, status)
values
  ('11111111-1111-4111-8111-111111111111', 'Kololo Main Clinic', 'Kampala', 'Dr. Sarah Namutebi', 38, 6120000, 14, 'active'),
  ('11111111-1111-4111-8111-111111111111', 'Ntinda Satellite', 'Kampala', 'Grace Atim', 19, 2840000, 7, 'active')
on conflict (tenant_id, name) do nothing;

insert into public.patients (id, tenant_id, full_name, date_of_birth, sex, phone, email, national_id, medical_history, allergies, emergency_contact)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', '11111111-1111-4111-8111-111111111111', 'Miriam Akello', '1991-05-11', 'female', '+256 703 222 118', 'miriam.akello@example.com', 'CM91000123Q', '["Hypertension monitoring", "Annual wellness review"]'::jsonb, '["Penicillin"]'::jsonb, '{"name": "James Akello", "phone": "+256 772 000 120"}'::jsonb),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', '11111111-1111-4111-8111-111111111111', 'Joseph Kato', '1984-10-21', 'male', '+256 786 450 441', 'joseph.kato@example.com', 'CM84000391P', '["Asthma", "Follow-up chest review"]'::jsonb, '[]'::jsonb, '{"name": "Ruth Kato", "phone": "+256 700 761 109"}'::jsonb)
on conflict (id) do nothing;

insert into public.diagnoses (tenant_id, patient_id, label, status, diagnosed_at, notes)
values
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Essential hypertension', 'active', now() - interval '30 days', 'Stable on medication, monitor monthly readings.'),
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Intermittent asthma', 'active', now() - interval '20 days', 'Carry reliever inhaler and review triggers.');

insert into public.clinical_prescriptions (tenant_id, patient_id, medication, dosage, status, prescribed_by, prescribed_at)
values
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Amlodipine 5mg', 'One tablet daily for 30 days', 'active', 'Dr. Daniel Okello', now() - interval '5 days'),
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Salbutamol inhaler', 'Two puffs when needed', 'active', 'Dr. Aisha Nakasujja', now() - interval '3 days');

insert into public.lab_results (tenant_id, patient_id, test_name, requested_by, status, result_summary, requested_at, completed_at)
values
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Full blood count', 'Dr. Daniel Okello', 'completed', 'Normal white cell count, mild anemia noted.', now() - interval '5 days', now() - interval '5 days' + interval '3 hours'),
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Chest X-ray', 'Dr. Aisha Nakasujja', 'processing', null, now() - interval '3 days', null);

insert into public.visit_records (tenant_id, patient_id, doctor_name, visit_type, notes, visited_at)
values
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Dr. Daniel Okello', 'Follow-up', 'Blood pressure improving. Continue medicine and reduce salt intake.', now() - interval '5 days'),
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Dr. Aisha Nakasujja', 'Consultation', 'Reviewed shortness of breath and requested chest imaging.', now() - interval '3 days');

insert into public.invoices (tenant_id, patient_id, invoice_number, customer_name, amount, paid_amount, status, payer_type, due_at)
values
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'MLK-INV-1001', 'Miriam Akello', 65000, 65000, 'paid', 'mobile_money', now()),
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'MLK-INV-1002', 'Joseph Kato', 120000, 40000, 'issued', 'insurance', now() + interval '7 days')
on conflict (tenant_id, invoice_number) do nothing;

insert into public.tenants (id, tenant_kind, name, slug, legal_name, region, address, phone, email, status, subdomain)
values (
  '55555555-5555-4555-8555-555555555555',
  'pharmacy',
  'Acacia Care Pharmacy',
  'acacia-care-pharmacy',
  'Acacia Care Pharmacy Ltd',
  'Kampala, Uganda',
  'Acacia Mall, Kisementi',
  '+256 759 412 882',
  'manager@acaciacarepharmacy.ug',
  'active',
  'acacia-care-pharmacy'
)
on conflict (id) do nothing;

insert into public.inventory_items (tenant_id, name, sku, category, stock_on_hand, reorder_level, unit_price, expiry_date, status)
values
  ('55555555-5555-4555-8555-555555555555', 'Amoxicillin 500mg capsules', 'ACX-AMOX-500', 'Antibiotics', 42, 60, 12000, '2026-09-30', 'low_stock'),
  ('55555555-5555-4555-8555-555555555555', 'Paracetamol 500mg tablets', 'ACX-PARA-500', 'Pain relief', 360, 120, 4500, '2027-01-12', 'in_stock'),
  ('55555555-5555-4555-8555-555555555555', 'ORS sachets', 'ACX-ORS-20', 'Hydration', 18, 50, 2500, '2026-06-18', 'expiring')
on conflict (tenant_id, sku) do nothing;

insert into public.branches (tenant_id, name, region, manager, patients_today, revenue_month, staff_online, status)
values
  ('55555555-5555-4555-8555-555555555555', 'Acacia Mall Dispensary', 'Kampala', 'Michael Ssewanyana', 84, 4260000, 6, 'active'),
  ('55555555-5555-4555-8555-555555555555', 'Ntinda Pickup Point', 'Kampala', 'Harriet Nambi', 41, 1780000, 3, 'attention')
on conflict (tenant_id, name) do nothing;

insert into public.prescription_orders (tenant_id, patient_name, prescriber, medicine, quantity, status, total_amount, fulfillment_due)
values
  ('55555555-5555-4555-8555-555555555555', 'Rebecca Namara', 'Dr. Daniel Okello', 'Amlodipine 5mg tablets', 30, 'ready', 42000, now() + interval '4 hours'),
  ('55555555-5555-4555-8555-555555555555', 'Patrick Wekesa', 'Jinja Children Hospital', 'Salbutamol inhaler', 1, 'dispensing', 32000, now() + interval '6 hours');

insert into public.invoices (tenant_id, invoice_number, customer_name, amount, paid_amount, status, payer_type, due_at)
values
  ('55555555-5555-4555-8555-555555555555', 'ACX-RX-2001', 'Rebecca Namara', 42000, 42000, 'paid', 'mobile_money', now()),
  ('55555555-5555-4555-8555-555555555555', 'ACX-RX-2002', 'Patrick Wekesa', 32000, 0, 'issued', 'mobile_money', now() + interval '1 day')
on conflict (tenant_id, invoice_number) do nothing;
