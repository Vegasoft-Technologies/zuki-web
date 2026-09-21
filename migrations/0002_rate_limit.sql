-- One row per accepted request to the booking endpoint, keyed by the caller's address, so
-- the rate limit is counted in one place rather than in each Worker isolate's memory.
-- Rows older than the window are removed as new ones are written; the table never holds
-- more than a few minutes of traffic and no personal data beyond the address.
CREATE TABLE rate_limit_hits (
  address TEXT    NOT NULL,
  at      INTEGER NOT NULL              -- milliseconds since the epoch
);

CREATE INDEX rate_limit_hits_by_address ON rate_limit_hits (address, at);
