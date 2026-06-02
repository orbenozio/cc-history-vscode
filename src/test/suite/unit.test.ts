// Unit tests for the ported decode + query helpers.

import * as assert from "assert";
import { decodeNaive } from "../../core/decode";
import { buildFtsQuery, parseDurationOrDate } from "../../core/query";

export function testDecode(): void {
  if (process.platform === "win32") {
    assert.strictEqual(
      decodeNaive("c--Users-orben-Projects-Diburit"),
      "c:\\Users\\orben\\Projects\\Diburit"
    );
  } else {
    assert.strictEqual(
      decodeNaive("-Users-orben-Projects-foo"),
      "/Users/orben/Projects/foo"
    );
  }
  console.log("[unit] decode PASS");
}

export function testQuery(): void {
  // Phrase auto-quote vs operator passthrough (mirrors the CLI regex).
  assert.strictEqual(buildFtsQuery("auth flow"), '"auth flow"');
  assert.strictEqual(buildFtsQuery("auth OR login"), "auth OR login");
  assert.strictEqual(buildFtsQuery("data*"), "data*");
  assert.strictEqual(buildFtsQuery('"x y"'), '"x y"');

  // Duration + date parsing always yields UTC "…Z".
  const isoZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
  assert.ok(isoZ.test(parseDurationOrDate("2d")), "duration must be UTC Z");

  const dateOut = parseDurationOrDate("2026-01-15");
  assert.ok(isoZ.test(dateOut), "date must be UTC Z");
  // Naive local date -> UTC, matching new Date(local midnight).
  const expected = new Date(2026, 0, 15).toISOString().replace(/\.\d{3}Z$/, "Z");
  assert.strictEqual(dateOut, expected, "naive date must convert local->UTC");

  // Explicit offset is honored (not reinterpreted as local).
  assert.strictEqual(
    parseDurationOrDate("2026-01-15T12:00:00+02:00"),
    "2026-01-15T10:00:00Z"
  );
  console.log("[unit] query PASS");
}
