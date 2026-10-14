-- Safe to run many times; it never deletes data.
-- `npm run db:migrate` applies it to an existing database. `db:init` runs it after schema.sql.

CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- typo-tolerant search

-- Every reviewer decision and every resubmission, so contributors can see the conversation.
CREATE TABLE IF NOT EXISTS contribution_history (
  id              SERIAL PRIMARY KEY,
  contribution_id INTEGER NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  actor           VARCHAR(12) NOT NULL CHECK (actor IN ('reviewer', 'contributor')),
  status          VARCHAR(20) NOT NULL,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_history_contribution ON contribution_history(contribution_id);

-- One-time password reset links. Only a hash of the token is stored.
CREATE TABLE IF NOT EXISTS password_resets (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_heritage_title_trgm ON heritage USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_villages_name_trgm  ON villages  USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_stories_title_trgm  ON stories   USING gin (title gin_trgm_ops);

-- ---- Real-time notifications, announcements, reminders and reviews ----
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;          -- where a notification takes you when clicked

-- Who submitted a record (lets us tell them about reviews, comments and likes).
ALTER TABLE heritage ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
UPDATE heritage h SET user_id = u.id FROM users u
  WHERE h.user_id IS NULL AND u.role = 'member' AND u.name = h.contributor_name;

-- Messages an admin sent to members.
CREATE TABLE IF NOT EXISTS broadcasts (
  id         SERIAL PRIMARY KEY,
  admin_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  message    TEXT NOT NULL,
  audience   VARCHAR(20) NOT NULL,
  district   VARCHAR(100),
  recipients INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Remembers which event reminders were already sent, so nobody gets the same one twice.
CREATE TABLE IF NOT EXISTS event_reminders (
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind     VARCHAR(10) NOT NULL,
  PRIMARY KEY (event_id, user_id, kind)
);

-- Star ratings with an optional written review. One review per person per item (target_id is e.g. "h3" or "s1").
CREATE TABLE IF NOT EXISTS reviews (
  id         SERIAL PRIMARY KEY,
  target_id  VARCHAR(40) NOT NULL,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author     VARCHAR(100) NOT NULL,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (target_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(target_id);

-- ---- Launch hardening ----
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;   -- bumping it logs a user out everywhere (used after a password reset)
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN NOT NULL DEFAULT false;      -- moderation: suspended accounts cannot log in or post
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;              -- when the person agreed to the Terms and Privacy Policy

-- ---- Playlists: named, orderable, shareable collections ----
CREATE TABLE IF NOT EXISTS playlists (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(80) NOT NULL,
  description VARCHAR(300) NOT NULL DEFAULT '',
  is_public   BOOLEAN NOT NULL DEFAULT false,
  share_code  VARCHAR(16) NOT NULL UNIQUE,       -- random code used in the shareable link, so private lists cannot be guessed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_playlists_user ON playlists(user_id);

-- item_id uses the public ids: h3 (record), s1 (story), e2 (event), o1 (oral history), v-gondal (village)
CREATE TABLE IF NOT EXISTS playlist_items (
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  item_id     VARCHAR(70) NOT NULL,
  position    INTEGER NOT NULL,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (playlist_id, item_id)
);
