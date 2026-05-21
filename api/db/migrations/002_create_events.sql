CREATE TABLE IF NOT EXISTS events (
  id          SERIAL       PRIMARY KEY,
  entity_id   INTEGER      NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  external_id TEXT         NOT NULL UNIQUE,
  type        TEXT         NOT NULL CHECK (type IN ('info', 'warning', 'critical')),
  payload     JSONB        NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_entity_id
  ON events (entity_id);

CREATE INDEX IF NOT EXISTS idx_events_critical_ranking
  ON events (entity_id, created_at DESC)
  WHERE type = 'critical';
