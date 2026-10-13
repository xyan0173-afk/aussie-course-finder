// ============================================================================
// Freshness persistence — BETA/DEMO ONLY (localStorage), PER SOURCE
// ============================================================================
//
// ⚠️  BETA / DEMO MECHANISM — NOT PRODUCTION STORAGE.
//
// For the beta MVP we persist freshness state in the browser's localStorage so
// that a manual "Check official sources now" run survives a page refresh, and
// so human-approved baselines are remembered on this device.
//
// Multi-source: state is keyed PER SOURCE using `sourceKey(courseId, url)` so
// each official source (e.g. RMIT's course page vs its China equivalency page)
// has its own check result and its own human-approved baseline.
//
// Limits (why this is beta-only):
//   - Per-browser / per-device, not shared between users or machines.
//   - Not authoritative; the user can clear it at any time.
//
// A PRODUCTION deployment would replace this with server-side persistent
// storage (database / durable KV). We deliberately do NOT add a database or
// external service in this beta.
//
// Two concerns are kept in SEPARATE storage keys so they can never be confused:
//   1. Automated check RESULTS  (what the checker fetched; machine-produced).
//   2. Human-APPROVED baselines (set only by an explicit human review action).
// ============================================================================

import type { CheckResult } from "./freshness";

const RESULTS_KEY = "ccau.freshness.checkResults.v2";
const BASELINES_KEY = "ccau.freshness.approvedBaselines.v2";

/** Keyed by sourceKey(courseId, url). */
export type StoredCheckResults = Record<string, CheckResult>;
/** Keyed by sourceKey(courseId, url) -> approved fingerprint. */
export type StoredBaselines = Record<string, string>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupt / unavailable storage -> behave as if empty.
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota / privacy mode errors are non-fatal for a beta demo.
  }
}

// ---- Automated check results (machine-produced) ----------------------------

export function loadCheckResults(): StoredCheckResults {
  return readJson<StoredCheckResults>(RESULTS_KEY, {});
}

export function saveCheckResults(results: StoredCheckResults): void {
  writeJson(RESULTS_KEY, results);
}

// ---- Human-approved baselines (set only by explicit human action) ----------

export function loadApprovedBaselines(): StoredBaselines {
  return readJson<StoredBaselines>(BASELINES_KEY, {});
}

export function saveApprovedBaselines(baselines: StoredBaselines): void {
  writeJson(BASELINES_KEY, baselines);
}
