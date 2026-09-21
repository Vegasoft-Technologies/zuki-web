import assert from "node:assert/strict";
import test from "node:test";
import { clarityProjectId } from "./analytics.ts";

test("a project identifier is letters and digits; anything else is refused", () => {
  assert.equal(clarityProjectId("abc123def"), "abc123def");
  assert.equal(clarityProjectId(undefined), null);
  assert.equal(clarityProjectId(""), null);
  assert.equal(clarityProjectId("short"), null);
  assert.equal(clarityProjectId("abc123/../x"), null);
  assert.equal(clarityProjectId("abc 123 def"), null);
});
