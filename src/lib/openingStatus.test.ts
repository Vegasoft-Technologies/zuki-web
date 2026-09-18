import assert from "node:assert/strict";
import test from "node:test";
import { getLondonDayIndex, getOpeningStatus } from "./openingStatus.ts";

// Every instant below is given in UTC, so that the tests are independent of the machine
// they run on. The comment after each one states the London time it corresponds to.

test("a weekday mid-morning is open until closing", () => {
  const status = getOpeningStatus(new Date("2026-09-16T09:30:00Z")); // Wed 10:30 BST
  assert.equal(status.isOpen, true);
  assert.equal(status.detail, "until 17:00 today");
  assert.equal(status.dayIndex, 3);
});

test("Sunday at 16:30 is closed, because Sunday closes at 16:00", () => {
  const status = getOpeningStatus(new Date("2026-09-20T15:30:00Z")); // Sun 16:30 BST
  assert.equal(status.isOpen, false);
  assert.equal(status.detail, "opens 08:00 tomorrow");
  assert.equal(status.dayIndex, 0);
});

test("Saturday at 08:30 is closed and opens later the same day", () => {
  const status = getOpeningStatus(new Date("2026-09-19T07:30:00Z")); // Sat 08:30 BST
  assert.equal(status.isOpen, false);
  assert.equal(status.detail, "opens 09:00 today");
  assert.equal(status.dayIndex, 6);
});

test("the exact minute of closing counts as closed", () => {
  const open = getOpeningStatus(new Date("2026-09-21T15:59:00Z")); // Mon 16:59 BST
  assert.equal(open.isOpen, true);

  const shut = getOpeningStatus(new Date("2026-09-21T16:00:00Z")); // Mon 17:00 BST
  assert.equal(shut.isOpen, false);
  assert.equal(shut.detail, "opens 08:00 tomorrow");
});

test("the exact minute of opening counts as open", () => {
  const status = getOpeningStatus(new Date("2026-09-19T08:00:00Z")); // Sat 09:00 BST
  assert.equal(status.isOpen, true);
  assert.equal(status.detail, "until 17:00 today");
});

test("British Summer Time is applied, not a fixed offset", () => {
  // 16:30 UTC is 17:30 in London during BST, so the cafe has shut. Reading the clock
  // as UTC would wrongly report it as open with half an hour left.
  const summer = getOpeningStatus(new Date("2026-07-08T16:30:00Z")); // Wed 17:30 BST
  assert.equal(summer.isOpen, false);
  assert.equal(summer.detail, "opens 08:00 tomorrow");

  // The same clock time in January is 16:30 in London, and the cafe is still open.
  const winter = getOpeningStatus(new Date("2026-01-07T16:30:00Z")); // Wed 16:30 GMT
  assert.equal(winter.isOpen, true);
  assert.equal(winter.detail, "until 17:00 today");
});

test("the day index follows London, not UTC, across midnight", () => {
  // 23:30 UTC on a Saturday in summer is already 00:30 on Sunday in London.
  assert.equal(getLondonDayIndex(new Date("2026-09-19T23:30:00Z")), 0);
  // The same instant in winter is still Saturday.
  assert.equal(getLondonDayIndex(new Date("2026-01-03T23:30:00Z")), 6);
});
