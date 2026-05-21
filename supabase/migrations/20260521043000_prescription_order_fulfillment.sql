alter table public.prescription_orders
  add column if not exists customer_phone text,
  add column if not exists fulfillment_method text not null default 'pickup' check (fulfillment_method in ('pickup', 'delivery')),
  add column if not exists delivery_address text,
  add column if not exists payment_method text not null default 'cash' check (payment_method in ('mtn_momo', 'airtel_money', 'cash')),
  add column if not exists customer_notes text,
  add column if not exists ready_notification_sent_at timestamptz;
