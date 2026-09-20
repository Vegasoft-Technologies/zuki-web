import assert from "node:assert/strict";
import test from "node:test";
import { byAscendingPrice } from "./menuOrder.ts";

const item = (name: string, amount?: number) => ({ name, amount });

test("priced items come out in ascending order", () => {
  const out = byAscendingPrice([item("c", 3), item("a", 1), item("b", 2)]);
  assert.deepEqual(
    out.map((i) => i.name),
    ["a", "b", "c"],
  );
});

test("items without an amount sort last, in their written order", () => {
  const out = byAscendingPrice([
    item("x"),
    item("b", 2),
    item("y"),
    item("a", 1),
    item("z"),
  ]);
  assert.deepEqual(
    out.map((i) => i.name),
    ["a", "b", "x", "y", "z"],
  );
});

test("equal prices keep their written order", () => {
  const out = byAscendingPrice([item("first", 5), item("second", 5), item("cheap", 1)]);
  assert.deepEqual(
    out.map((i) => i.name),
    ["cheap", "first", "second"],
  );
});

test("a supplement sorts by its number like anything else", () => {
  const out = byAscendingPrice([item("Flat White", 3.6), item("Sprinkles", 0.5)]);
  assert.deepEqual(
    out.map((i) => i.name),
    ["Sprinkles", "Flat White"],
  );
});

test("the input is not mutated", () => {
  const input = [item("b", 2), item("a", 1)];
  byAscendingPrice(input);
  assert.deepEqual(
    input.map((i) => i.name),
    ["b", "a"],
  );
});
