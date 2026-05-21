CREATE TABLE IF NOT EXISTS entities (
  id                   SERIAL       PRIMARY KEY,
  name                 TEXT         NOT NULL UNIQUE,
  status               TEXT         NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'suspended')),
  critical_events_count INTEGER     NOT NULL DEFAULT 0,
  total_events_count   INTEGER      NOT NULL DEFAULT 0,
  last_event_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entities_status ON entities (status);
