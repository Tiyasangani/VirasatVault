-- VirasatVault PostgreSQL schema. Running db:init drops and recreates everything.
DROP TABLE IF EXISTS playlist_items, playlists, reviews, event_reminders, broadcasts, password_resets, contribution_history, notifications, comments, likes, bookmarks, reports, contributions,
  oral_histories, events, stories, heritage, villages, users CASCADE;

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  village       VARCHAR(100),
  district      VARCHAR(100),
  role          VARCHAR(10) NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  points        INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE villages (
  id        SERIAL PRIMARY KEY,
  slug      VARCHAR(80) NOT NULL UNIQUE,
  name      VARCHAR(100) NOT NULL,
  district  VARCHAR(100) NOT NULL,
  region    VARCHAR(100) NOT NULL,
  image     TEXT,
  gallery   JSONB NOT NULL DEFAULT '[]',
  summary   TEXT NOT NULL,
  intro     JSONB NOT NULL DEFAULT '[]',
  lat       DOUBLE PRECISION NOT NULL,
  lng       DOUBLE PRECISION NOT NULL,
  people    JSONB NOT NULL DEFAULT '[]',
  foods     JSONB NOT NULL DEFAULT '[]',
  festivals JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE heritage (
  id               SERIAL PRIMARY KEY,
  slug             VARCHAR(120) NOT NULL UNIQUE,
  record_no        VARCHAR(30) NOT NULL UNIQUE,
  title            VARCHAR(200) NOT NULL,
  category         VARCHAR(40) NOT NULL,
  type             VARCHAR(20) NOT NULL,
  htype            VARCHAR(20) NOT NULL,
  village_id       INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  district         VARCHAR(100) NOT NULL,
  period           VARCHAR(60) NOT NULL,
  year_label       VARCHAR(60),
  image            TEXT,
  gallery          JSONB NOT NULL DEFAULT '[]',
  lat              DOUBLE PRECISION NOT NULL,
  lng              DOUBLE PRECISION NOT NULL,
  summary          TEXT NOT NULL,
  description      JSONB NOT NULL DEFAULT '[]',
  significance     TEXT,
  timeline         JSONB NOT NULL DEFAULT '[]',
  sources          JSONB NOT NULL DEFAULT '[]',
  contributor_name VARCHAR(100) NOT NULL,
  verified         BOOLEAN NOT NULL DEFAULT false,
  likes_base       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_heritage_village ON heritage(village_id);
CREATE INDEX idx_heritage_category ON heritage(category);

CREATE TABLE stories (
  id               SERIAL PRIMARY KEY,
  slug             VARCHAR(120) NOT NULL UNIQUE,
  title            VARCHAR(200) NOT NULL,
  category         VARCHAR(40) NOT NULL,
  explore          VARCHAR(40) NOT NULL,
  village_id       INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  district         VARCHAR(100) NOT NULL,
  contributor_name VARCHAR(100) NOT NULL,
  read_time        INTEGER NOT NULL,
  published_on     DATE NOT NULL,
  image            TEXT,
  featured         BOOLEAN NOT NULL DEFAULT false,
  likes_base       INTEGER NOT NULL DEFAULT 0,
  excerpt          TEXT NOT NULL,
  body             JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE events (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  name        VARCHAR(200) NOT NULL,
  category    VARCHAR(40) NOT NULL,
  event_date  DATE NOT NULL,
  end_date    DATE,
  village_id  INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  location    VARCHAR(200) NOT NULL,
  district    VARCHAR(100) NOT NULL,
  image       TEXT,
  description TEXT NOT NULL,
  schedule    JSONB NOT NULL DEFAULT '[]',
  entry       VARCHAR(100)
);

CREATE TABLE oral_histories (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  speaker     VARCHAR(150) NOT NULL,
  village_id  INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  duration    INTEGER NOT NULL,
  description TEXT NOT NULL,
  audio_url   TEXT
);

CREATE TABLE contributions (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  contributor_name VARCHAR(100) NOT NULL,
  title            VARCHAR(200) NOT NULL,
  category         VARCHAR(60) NOT NULL,
  village          VARCHAR(100) NOT NULL,
  district         VARCHAR(100) NOT NULL,
  period           VARCHAR(60),
  description      TEXT NOT NULL,
  images           JSONB NOT NULL DEFAULT '[]',
  video_url        TEXT,
  audio_url        TEXT,
  sources          TEXT,
  reference        TEXT,
  extra            TEXT,
  status           VARCHAR(20) NOT NULL DEFAULT 'Pending'
                   CHECK (status IN ('Pending','Under Review','Approved','Rejected','Changes Requested')),
  admin_note       TEXT,
  heritage_id      INTEGER REFERENCES heritage(id) ON DELETE SET NULL,
  submitted_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  reviewed_at      TIMESTAMPTZ
);
CREATE INDEX idx_contrib_user ON contributions(user_id);
CREATE INDEX idx_contrib_status ON contributions(status);

CREATE TABLE reports (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  reporter_name VARCHAR(100) NOT NULL,
  target        VARCHAR(200) NOT NULL,
  reason        VARCHAR(40) NOT NULL,
  detail        TEXT NOT NULL,
  status        VARCHAR(10) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','Resolved')),
  created_at    DATE NOT NULL DEFAULT CURRENT_DATE
);

-- item_type is one of places | stories | villages | events; item_id is the public id such as "h3".
CREATE TABLE bookmarks (
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(10) NOT NULL,
  item_id   VARCHAR(40) NOT NULL,
  PRIMARY KEY (user_id, item_type, item_id)
);

CREATE TABLE likes (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id VARCHAR(40) NOT NULL,
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE comments (
  id         SERIAL PRIMARY KEY,
  target_id  VARCHAR(40) NOT NULL,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  author     VARCHAR(100) NOT NULL,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_target ON comments(target_id);

CREATE TABLE notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(20) NOT NULL,
  text       TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON notifications(user_id, read);
