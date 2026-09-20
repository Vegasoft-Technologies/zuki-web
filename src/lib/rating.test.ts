import assert from "node:assert/strict";
import test from "node:test";
import { fetchRating, parseRating } from "./rating.ts";

const when = new Date("2026-09-20T10:00:00Z");

test("a Places API (New) resource becomes a rating with source, link and date", () => {
  const r = parseRating(
    { rating: 4.3, userRatingCount: 57, googleMapsUri: "https://maps.google.com/?cid=1" },
    "abc",
    when,
  );
  assert.deepEqual(r, {
    value: 4.3,
    count: 57,
    source: "Google",
    url: "https://maps.google.com/?cid=1",
    fetchedAt: when,
  });
});

test("without a maps link the reviews link is built from the place identifier", () => {
  const r = parseRating({ rating: 4.3, userRatingCount: 57 }, "abc", when);
  assert.equal(r?.url, "https://www.google.com/maps/place/?q=place_id:abc");
});

test("a resource without a rating yields null rather than a made-up figure", () => {
  assert.equal(parseRating({}, "abc", when), null);
  assert.equal(parseRating({ error: { status: "NOT_FOUND" } }, "abc", when), null);
  assert.equal(parseRating(null, "abc", when), null);
  assert.equal(parseRating("nonsense", "abc", when), null);
});

test("out-of-range or non-integer values are rejected", () => {
  assert.equal(parseRating({ rating: 7, userRatingCount: 1 }, "a", when), null);
  assert.equal(parseRating({ rating: 4, userRatingCount: 1.5 }, "a", when), null);
  assert.equal(parseRating({ rating: "4.3", userRatingCount: 1 }, "a", when), null);
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

test("the key travels in a header, never in the URL, and the field mask is set", async () => {
  process.env.GOOGLE_PLACES_API_KEY = "test-key";
  process.env.GOOGLE_PLACE_ID = "test-place";
  const realFetch = globalThis.fetch;
  const calls: { url: string; headers: Record<string, string> }[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      headers: Object.fromEntries(Object.entries(init?.headers ?? {})) as Record<
        string,
        string
      >,
    });
    return new Response(JSON.stringify({ rating: 4.3, userRatingCount: 57 }), {
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  try {
    const r = await fetchRating();
    assert.equal(r?.count, 57);
    assert.equal(calls.length, 1);
    const call = calls[0];
    assert.ok(!call.url.includes("test-key"));
    assert.equal(call.headers["X-Goog-Api-Key"], "test-key");
    assert.equal(
      call.headers["X-Goog-FieldMask"],
      "rating,userRatingCount,googleMapsUri",
    );
    assert.ok(call.url.endsWith("/v1/places/test-place"));
  } finally {
    globalThis.fetch = realFetch;
    delete process.env.GOOGLE_PLACES_API_KEY;
    delete process.env.GOOGLE_PLACE_ID;
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
