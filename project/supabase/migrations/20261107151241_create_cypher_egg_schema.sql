/*
# CypherEgg AI - Core Schema

## Overview
Creates the data layer for CypherEgg AI: a profile tied to each auth user that
stores their subscription tier (free / pro / enterprise), and a generations table
that logs every AI code-generation and security-analysis run from the workspace.

## New Tables

### profiles
- `id` (uuid, PK) — matches the auth user id, one row per user.
- `email` (text) — cached for quick display without joining auth.users.
- `full_name` (text) — display name the user enters at signup.
- `tier` (text) — subscription plan: 'free' | 'pro' | 'enterprise'. Default 'free'.
- `stripe_customer_id` (text) — placeholder for a future real Stripe integration.
- `created_at` (timestamptz) — when the profile was created.

### generations
- `id` (uuid, PK) — unique generation id.
- `user_id` (uuid, FK -> auth.users) — owner, defaults to auth.uid().
- `mode` (text) — 'generate' | 'analyze'.
- `language` (text) — target language for generations.
- `prompt` (text) — the user's input prompt.
- `result` (text) — the generated code or analysis output.
- `status` (text) — 'completed' | 'failed'. Default 'completed'.
- `created_at` (timestamptz) — when the run happened.

## Security
- RLS enabled on both tables.
- profiles: a user can read + update only their own profile.
- generations: a user can CRUD only their own rows (owner-scoped via auth.uid()).
- Grants scoped to `authenticated` only (the app requires sign-in).
- user_id has DEFAULT auth.uid() so inserts that omit it still satisfy WITH CHECK.
*/

-- profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  tier text NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- generations table
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'generate' CHECK (mode IN ('generate', 'analyze')),
  language text NOT NULL DEFAULT 'javascript',
  prompt text NOT NULL,
  result text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON generations TO authenticated;

DROP POLICY IF EXISTS "select_own_generations" ON generations;
CREATE POLICY "select_own_generations"
  ON generations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_generations" ON generations;
CREATE POLICY "insert_own_generations"
  ON generations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_generations" ON generations;
CREATE POLICY "update_own_generations"
  ON generations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_generations" ON generations;
CREATE POLICY "delete_own_generations"
  ON generations FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- index for listing a user's generations newest-first
CREATE INDEX IF NOT EXISTS generations_user_created_idx
  ON generations (user_id, created_at DESC);
