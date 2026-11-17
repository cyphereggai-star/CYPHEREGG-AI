/*
# Create payment_requests and investor_leads tables

## Overview
Adds two new tables for production-readiness:
1. `payment_requests` — logs every TRC20 USDT crypto payment submission from the
   Pro upgrade modal so administrators can audit transactions. When a user
   pastes their Transaction Hash (TxID) and clicks "Verify & Activate Pro
   Account", a row is inserted here BEFORE the profile tier is upgraded.
2. `investor_leads` — stores inquiries submitted through the "Investor
   Relations" contact form in the footer, so the team can follow up with
   potential investors.

## New Tables

### payment_requests
- `id` (uuid, PK) — unique request id.
- `user_id` (uuid, FK -> auth.users) — the user submitting the payment proof.
- `user_email` (text) — cached email for admin auditing without joins.
- `tx_id` (text) — the TRC20 transaction hash pasted by the user.
- `amount` (numeric) — payment amount in USDT (default 19).
- `status` (text) — 'pending' | 'verified'. Default 'pending'.
- `created_at` (timestamptz) — when the request was submitted.

### investor_leads
- `id` (uuid, PK) — unique lead id.
- `name` (text) — contact name.
- `email` (text) — contact email.
- `company` (text) — company or firm (optional).
- `message` (text) — the inquiry message.
- `created_at` (timestamptz) — when the inquiry was submitted.

## Security

### payment_requests
- RLS enabled.
- Grant SELECT, INSERT to `authenticated` (users submit their own requests).
- Owner-scoped: a user can only SELECT and INSERT their own payment requests.
  (Updates/deletes are admin-only via the service role, not exposed to the
  anon/authenticated roles.)

### investor_leads
- RLS enabled.
- Grant INSERT to `anon, authenticated` — any visitor (signed in or not) can
  submit an investor inquiry through the public contact form.
- No SELECT/UPDATE/DELETE grants for anon or authenticated — leads are only
  readable by admins via the service role. This keeps submitted inquiries
  private.
*/

-- payment_requests table
CREATE TABLE IF NOT EXISTS payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  tx_id text NOT NULL,
  amount numeric NOT NULL DEFAULT 19,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON payment_requests TO authenticated;

DROP POLICY IF EXISTS "select_own_payment_requests" ON payment_requests;
CREATE POLICY "select_own_payment_requests"
  ON payment_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_payment_requests" ON payment_requests;
CREATE POLICY "insert_own_payment_requests"
  ON payment_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- index for admin auditing by user
CREATE INDEX IF NOT EXISTS payment_requests_user_idx
  ON payment_requests (user_id, created_at DESC);

-- investor_leads table
CREATE TABLE IF NOT EXISTS investor_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE investor_leads ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON investor_leads TO anon, authenticated;

DROP POLICY IF EXISTS "insert_investor_leads" ON investor_leads;
CREATE POLICY "insert_investor_leads"
  ON investor_leads FOR INSERT TO anon, authenticated
  WITH CHECK (true);
