# MediLink

MediLink is a production-shaped multi-tenant SaaS management platform for clinics, hospitals, and pharmacies in Uganda and East Africa.

The app is built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Supabase Auth/PostgreSQL/RLS, and payment adapter contracts for Flutterwave, MTN Mobile Money, Airtel Money, and Stripe.

## What is included

- Tenant-isolated clinic dashboard
- Tenant-aware pharmacy portal for inventory, prescriptions, sales, and pickup monitoring
- EMR patient files with history, diagnoses, prescriptions, lab results, and visit notes
- Appointment booking workflow for website, WhatsApp intake, and reception desk
- SMS, WhatsApp, email, and in-app reminder surfaces
- Billing and finance workspace for invoices, receipts, cash, mobile money, and insurance tracking
- Lab management for requests, result uploads, report printing, and doctor access
- Multi-branch owner dashboard for revenue, patient flow, and staff monitoring
- Email/password and Google Auth wiring through Supabase
- Role model for admin, doctor, receptionist, pharmacist, and patient
- Doctors, patients, appointments, payments, reports, notifications, settings, and super-admin screens
- Appointment API with tenant checks, rate limiting, and double-booking prevention
- Payment initiation API and webhook endpoints
- WhatsApp and email notification service placeholders
- PWA manifest
- Supabase schema with RLS policies for strict tenant isolation

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Without Supabase env vars the app runs in demo mode with selectable clinic, hospital, and pharmacy portals.

## Simulate real domains locally

Use `.localhost` subdomains so the demo feels like production without changing DNS. Start the app with:

```bash
npm run dev:domains
```

For local demo domains, create `.env.local` with:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_TENANT_ROOT_DOMAIN=localhost
```

Open these URLs to test the SaaS like a real hosted app:

- `http://localhost:3000/demo-flow` for the platform demo launcher
- `http://kampalaclinic.localhost:3000/book` for a clinic patient booking page
- `http://kampalaclinic.localhost:3000/dashboard` for the clinic portal
- `http://citycare.localhost:3000/dashboard` for the hospital operations dashboard
- `http://mediplus.localhost:3000/dashboard/pharmacy` for the pharmacy workflow

Built-in local demo accounts:

- `admin@kampalaclinic.com` - admin, manages the entire clinic
- `doctor@kampalaclinic.com` - doctor, views patients and consultations
- `reception@kampalaclinic.com` - receptionist, books appointments
- `admin@citycare.com` - admin for the hospital tenant
- `pharmacist@mediplus.com` - pharmacist, handles medicine and inventory
- `patient@kampalaclinic.com` - patient demo account

If your browser or Windows setup does not resolve `*.localhost`, open Notepad as Administrator, edit `C:\Windows\System32\drivers\etc\hosts`, and add one line per demo domain:

```text
127.0.0.1 kampalaclinic.localhost
127.0.0.1 citycare.localhost
127.0.0.1 mediplus.localhost
```

## Production setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Enable Supabase email/password and Google auth providers.
4. Copy `.env.example` to `.env.local` and fill the Supabase keys.
5. New owner/admin signups automatically receive a 7-day free trial with the subscription marked `trialing` until `trial_ends_at`.
6. Add payment provider credentials for Flutterwave, MTN MoMo, Airtel Money, and optionally Stripe.
7. Add email delivery credentials so MediLink password reset emails show the OTP inside the email instead of using Supabase's link-only sender. Use `RESEND_API_KEY` plus a verified-domain `EMAIL_FROM` for production, or configure `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` as a temporary sender before you own a domain.
8. Add Meta WhatsApp Cloud API credentials with `WHATSAPP_CLOUD_API_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` if you want appointment confirmations sent over WhatsApp.
9. Set `ENABLE_DEMO_MODE=false` and `ALLOW_DEMO_PAYMENTS=false` for real production.
10. Add webhook verification secrets: `FLUTTERWAVE_WEBHOOK_SECRET_HASH`, `MTN_MOMO_WEBHOOK_SECRET`, `AIRTEL_MONEY_WEBHOOK_SECRET`, and `STRIPE_WEBHOOK_SECRET` where those providers are enabled.
11. Deploy to Vercel and copy the same env vars into the Vercel project.

## Multi-tenancy model

MediLink uses a shared database with `tenant_id` on all operational tables and `tenant_kind` to route clinics, hospitals, and pharmacies into the right portal. Supabase Row Level Security enforces:

- tenant users can only read rows matching `public.current_tenant_id()`
- clinic admins can manage records only inside their tenant
- platform admins can monitor tenants and subscriptions
- appointment double booking is blocked by a partial unique index on active doctor slots

Optional subdomain tenancy is supported through `clinicname.medilink.ug`, `clinicname.localhost`, and `/api/tenant/resolve`.

## Payment notes

Payment adapters are intentionally env-driven:

- Flutterwave uses its v4 mobile-money API flow through `FLUTTERWAVE_CLIENT_ID`, `FLUTTERWAVE_CLIENT_SECRET`, and a configurable base URL.
- MTN MoMo uses Collections `RequestToPay`.
- Airtel Money uses configurable collection/status paths because access varies by Airtel developer account and market.
- Stripe is available for global card payment expansion.

In non-production environments, missing provider credentials can return demo payment references when `ALLOW_DEMO_PAYMENTS=true`.

For MTN MoMo and Airtel Money callbacks, include the configured secret as either an `x-medilink-webhook-secret` header or a `?secret=` query parameter on the webhook URL.
