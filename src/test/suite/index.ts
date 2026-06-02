// Runs inside VS Code's extension host (real Electron). Drives the worker probe
// and asserts the Hebrew FTS5 MATCH succeeds with the expected ABI.

import * as path from "path";
import * as assert from "assert";
import { runProbeInWorker } from "../../extension";

export async function run(): Promise<void> {
  const workerPath = path.resolve(__dirname, "../../ftsWorker.js");
  const r = await runProbeInWorker(workerPath);
  console.log("[spike] probe result:\n" + JSON.stringify(r, null, 2));

  assert.ok(r.ok, `probe not ok: ${r.error ?? "unknown error"}`);
  assert.ok(r.hebrewMatchHits >= 1, "expected at least one Hebrew MATCH hit");
  assert.ok(
    r.matchedText && r.matchedText.includes("שלום"),
    "matched row should contain the Hebrew word"
  );
  assert.strictEqual(
    r.abiModules,
    "140",
    `worker ran under ABI ${r.abiModules}, expected 140 (Electron 39)`
  );

  console.log(
    "[spike] PASS — native better-sqlite3 FTS5 + Hebrew MATCH works in a " +
      "worker_thread inside VS Code's Electron " +
      `(electron=${r.electron}, sqlite=${r.sqliteVersion}, niqqud-folds=${r.diacriticsFold})`
  );
}
