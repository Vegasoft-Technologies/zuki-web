-- Table bookings: one row per reservation. Times are stored twice on purpose: the London
-- date and clock time the visitor chose (what the café reads), and the instants the
-- sitting starts and ends (what the capacity check compares). Personal details are the
-- name, one contact method and an optional note; nothing else is collected.
CREATE TABLE bookings (
  id          TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  party_size  INTEGER NOT NULL CHECK (party_size > 0),
  date        TEXT    NOT NULL,             -- YYYY-MM-DD, London
  time        TEXT    NOT NULL,             -- HH:MM, London
  starts_at   INTEGER NOT NULL,             -- milliseconds since the epoch
  ends_at     INTEGER NOT NULL,
  phone       TEXT,
  email       TEXT,
  note        TEXT,
  status      TEXT    NOT NULL CHECK (status IN ('requested', 'confirmed')),
  created_at  INTEGER NOT NULL,
  CHECK (ends_at > starts_at)
);

-- The capacity check reads every booking on a date whose sitting overlaps a window.
CREATE INDEX bookings_by_date_start ON bookings (date, starts_at);
