CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('HOMEOWNER', 'SALES', 'SURVEYOR', 'COORDINATOR')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS app_sessions_user_id_idx ON app_sessions(user_id);
CREATE INDEX IF NOT EXISTS app_sessions_expires_at_idx ON app_sessions(expires_at);

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  attempts SMALLINT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_otps_user_created_idx
  ON password_reset_otps(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS solar_leads (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solar_rules (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('subsidy', 'pricing')),
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solar_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES solar_leads(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('Advance', 'Installment', 'Final')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI Mock', 'Bank Transfer Mock')),
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Paid', 'Failed')),
  transaction_reference TEXT NOT NULL UNIQUE,
  idempotency_key UUID NOT NULL UNIQUE,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES app_users(id)
);

CREATE INDEX IF NOT EXISTS solar_payments_project_date_idx
  ON solar_payments(project_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS solar_payments_status_idx
  ON solar_payments(status);

CREATE TABLE IF NOT EXISTS solar_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES solar_leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'WhatsApp Mock',
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Sent Mock',
  stage TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS solar_notifications_project_id_idx ON solar_notifications(project_id);
CREATE INDEX IF NOT EXISTS solar_notifications_customer_id_idx ON solar_notifications(customer_id);
CREATE INDEX IF NOT EXISTS solar_notifications_created_at_idx ON solar_notifications(created_at DESC);
