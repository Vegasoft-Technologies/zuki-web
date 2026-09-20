import assert from "node:assert/strict";
import test from "node:test";
import { fetchRating, parseRating } from "./rating.ts";

const when = new Date("2026-09-20T10:00:00Z");

test("a well-formed response becomes a rating with source, link and date", () => {
  const r = parseRating({ result: { rating: 4.3, user_ratings_total: 57 } }, "abc", when);
  assert.deepEqual(r, {
    value: 4.3,
    count: 57,
    source: "Google",
    url: "https://www.google.com/maps/place/?q=place_id:abc",
    fetchedAt: when,
  });
});

test("a response without a rating yields null rather than a made-up figure", () => {
  assert.equal(parseRating({ result: {} }, "abc", when), null);
  assert.equal(parseRating({ status: "NOT_FOUND" }, "abc", when), null);
  assert.equal(parseRating(null, "abc", when), null);
  assert.equal(parseRating("nonsense", "abc", when), null);
});

test("out-of-range or non-integer values are rejected", () => {
  assert.equal(
    parseRating({ result: { rating: 7, user_ratings_total: 1 } }, "a", when),
    null,
  );
  assert.equal(
    parseRating({ result: { rating: 4, user_ratings_total: 1.5 } }, "a", when),
    null,
  );
  assert.equal(
    parseRating({ result: { rating: "4.3", user_ratings_total: 1 } }, "a", when),
    null,
  );
});

test("without a key and a place identifier nothing is fetched and the answer is null", async () => {
  const saved = {
    key: process.env.GOOGLE_PLACES_API_KEY,
    id: process.env.GOOGLE_PLACE_ID,
  };
  delete process.env.GOOGLE_PLACES_API_KEY;
  delete process.env.GOOGLE_PLACE_ID;
  const realFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = (async () => {
    called = true;
    return new Response("{}");
  }) as typeof fetch;
  try {
    assert.equal(await fetchRating(), null);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = realFetch;
    if (saved.key) process.env.GOOGLE_PLACES_API_KEY = saved.key;
    if (saved.id) process.env.GOOGLE_PLACE_ID = saved.id;
  }
});

test("a failed request yields null instead of throwing", async () => {
  process.env.GOOGLE_PLACES_API_KEY = "test-key";
  process.env.GOOGLE_PLACE_ID = "test-place";
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    throw new Error("network down");
  }) as typeof fetch;
  try {
    assert.equal(await fetchRating(), null);
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.GOOGLE_PLACES_API_KEY;
    delete process.env.GOOGLE_PLACE_ID;
  }
});
