-- Every booking names the area it is for, inside or outside, and the capacity check counts
-- each area on its own. SQLite cannot add a NOT NULL column without a default, and the
-- area must have no default, so the table is rebuilt. (The live table held no rows when
-- this was written; any row copied would be marked inside.)
CREATE TABLE bookings_with_area (
  id          TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  party_size  INTEGER NOT NULL CHECK (party_size > 0),
  area        TEXT    NOT NULL CHECK (area IN ('inside', 'outside')),
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

INSERT INTO bookings_with_area (id, name, party_size, area, date, time, starts_at, ends_at, phone, email, note, status, created_at)
  SELECT id, name, party_size, 'inside', date, time, starts_at, ends_at, phone, email, note, status, created_at FROM bookings;

DROP TABLE bookings;

ALTER TABLE bookings_with_area RENAME TO bookings;

-- The capacity check reads every booking in one area on a date whose sitting overlaps a window.
CREATE INDEX bookings_by_date_area_start ON bookings (date, area, starts_at);
