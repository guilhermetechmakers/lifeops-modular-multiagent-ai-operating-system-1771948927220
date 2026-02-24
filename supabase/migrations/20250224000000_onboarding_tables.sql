-- Onboarding / Setup Wizard tables
-- Run with: supabase migration up

-- User onboarding sessions (progress persistence)
CREATE TABLE IF NOT EXISTS user_onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_index INT NOT NULL DEFAULT 1,
  state_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user ON user_onboarding_sessions(user_id);

ALTER TABLE user_onboarding_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own onboarding session"
  ON user_onboarding_sessions FOR ALL
  USING (auth.uid() = user_id);

-- Connectors (OAuth tokens stored encrypted via app logic)
CREATE TABLE IF NOT EXISTS connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  status TEXT NOT NULL DEFAULT 'not_connected',
  connected_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider_key)
);

CREATE INDEX IF NOT EXISTS idx_connectors_user ON connectors(user_id);

ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own connectors"
  ON connectors FOR ALL
  USING (auth.uid() = user_id);

-- Modules enabled per user
CREATE TABLE IF NOT EXISTS modules_enabled (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  enabled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_key)
);

ALTER TABLE modules_enabled ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own modules"
  ON modules_enabled FOR ALL
  USING (auth.uid() = user_id);

-- Data imports
CREATE TABLE IF NOT EXISTS data_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  result_summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE data_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own imports"
  ON data_imports FOR ALL
  USING (auth.uid() = user_id);

-- Cronjobs (simplified for onboarding)
CREATE TABLE IF NOT EXISTS cronjobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  schedule TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  input_payload JSONB DEFAULT '{}',
  permissions TEXT[] DEFAULT '{}',
  safety_rails JSONB DEFAULT '{}',
  retry_policy JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  next_run TIMESTAMPTZ,
  last_run_outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cronjobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cronjobs"
  ON cronjobs FOR ALL
  USING (auth.uid() = user_id);
