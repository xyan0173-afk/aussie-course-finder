// ============================================================================
// Data-freshness monitoring — types + pure helpers (no network, no I/O)
// ============================================================================
//
// This module is intentionally SEPARATE from eligibility logic.
//
// Eligibility ("eligible" / "verify" / "not-met" in results.tsx) answers:
//   "Does the student's profile meet the stored requirements?"
//
// Data freshness (this module) answers a DIFFERENT question:
//   "Does the course data we STORED still match its official source pages?"
//
// MULTI-SOURCE: a course may cite MORE THAN ONE official source (e.g. RMIT has
// a course page AND a China equivalency page). We monitor EVERY source. State
// (check result + human-approved baseline) is tracked PER SOURCE, and the
// course-level status is an aggregation of its sources.
//
// IMPORTANT SAFETY CONTRACT (beta feedback: data freshness + bot/CAPTCHA):
//   - A detected webpage change only means a POSSIBLE source change.
//     It never means an admission requirement definitely changed.
//   - This system only ever flags for human review and updates freshness
//     METADATA. It must never auto-edit academic requirements, IELTS
//     requirements, maths prerequisites, tuition, or any other course fact.
//   - A freshly fetched page is NEVER auto-marked "verified". A source can only
//     become "verified" when its fetched fingerprint matches a baseline that a
//     human explicitly approved after review — approval is PER SOURCE.
// ============================================================================

/**
 * Freshness status for a single source OR an aggregated course.
 *
 * - "not-checked":         no automated check has been attempted yet.
 * - "verified":            fetched content matches the human-approved baseline
 *                          (for a course: every accessible source matches).
 * - "needs-review":        content changed from the approved baseline, OR the
 *                          page is accessible but has no approved baseline yet.
 * - "manual-verification": the source could not be accessed (CAPTCHA, bot
 *                          protection, timeout, HTTP 403, network error, etc.).
 */
export type FreshnessStatus = "not-checked" | "verified" | "needs-review" | "manual-verification";

/** A single monitored official source for a course. */
export type MonitoredSource = {
  label: string;
  url: string;
};

/**
 * Result of an automated check for one SOURCE. This is the data that gets
 * PERSISTED (localStorage in the beta) and is kept distinct from the
 * human-approved baseline.
 */
export type CheckResult = {
  /** ISO timestamp of the check attempt. */
  lastSourceCheck: string;
  /** The normalized-text fingerprint fetched from the live page, if any. */
  fetchedFingerprint: string | null;
  /** Human-readable reason / error (e.g. "HTTP 403 Forbidden"). */
  reason: string;
};

/** Outcome of a single source check attempt (produced server-side). */
export type SourceCheckOutcome =
  { kind: "fetched"; fingerprint: string } | { kind: "error"; reason: string };

/** Display metadata, mirroring the STATUS_META pattern used for eligibility. */
export const FRESHNESS_META: Record<
  FreshnessStatus,
  { label: string; short: string; text: string; dot: string; chip: string; description: string }
> = {
  "not-checked": {
    label: "Not Yet Checked",
    short: "Not Yet Checked",
    text: "text-foreground/60",
    dot: "bg-foreground/40",
    chip: "border-white/15 bg-white/5 text-foreground/70",
    description: "No automated source check has been run yet.",
  },
  verified: {
    label: "Verified / Sources unchanged",
    short: "Verified",
    text: "text-mint",
    dot: "bg-mint",
    chip: "border-mint/40 bg-mint/10 text-mint",
    description:
      "Every accessible official source matches the fingerprint a person approved as its baseline, so the sources are unchanged since human verification.",
  },
  "needs-review": {
    label: "Needs Review / Possible source change",
    short: "Needs Review",
    text: "text-warn",
    dot: "bg-warn",
    chip: "border-warn/40 bg-warn/10 text-warn",
    description:
      "At least one official source is accessible but either has no human-approved baseline yet, or its content differs from the approved baseline. This only signals a POSSIBLE change — a person must review before any stored data is updated.",
  },
  "manual-verification": {
    label: "Manual Verification Required / Source could not be accessed",
    short: "Manual Verification Required",
    text: "text-danger",
    dot: "bg-danger",
    chip: "border-danger/40 bg-danger/10 text-danger",
    description:
      "At least one official source could not be reached or read (e.g. CAPTCHA, bot protection, timeout, HTTP 403, or network error). We do not guess — a person must check that source directly.",
  },
};

/**
 * Pure decision function for a SINGLE source: given its check result and its
 * human-approved baseline, decide the per-source status.
 *
 *   - No check yet            -> "not-checked"
 *   - Check errored           -> "manual-verification"
 *   - Fetched, no baseline    -> "needs-review"  (never auto-verify)
 *   - Fetched, == baseline    -> "verified"
 *   - Fetched, != baseline    -> "needs-review"
 */
export function decideSourceFreshness(
  result: CheckResult | null,
  approvedBaseline: string | null,
): FreshnessStatus {
  if (result === null) return "not-checked";
  if (result.fetchedFingerprint === null) return "manual-verification";
  if (approvedBaseline === null) return "needs-review";
  return result.fetchedFingerprint === approvedBaseline ? "verified" : "needs-review";
}

/**
 * Aggregate per-source statuses into a single COURSE-level status.
 *
 * Priority (most urgent wins), per the agreed rule:
 *   - no sources / all "not-checked"           -> "not-checked"
 *   - any "manual-verification"                 -> "manual-verification"
 *   - any "needs-review"                        -> "needs-review"
 *   - any "not-checked" (mixed with verified)   -> "needs-review"
 *                                                  (not every source confirmed)
 *   - otherwise (every source "verified")       -> "verified"
 *
 * Rationale: a course is only "Verified / Sources unchanged" when EVERY source
 * has been checked, is accessible, and matches its approved baseline. A source
 * that an important page could not be read keeps the whole course at
 * "Manual Verification Required".
 */
export function aggregateCourseFreshness(statuses: FreshnessStatus[]): FreshnessStatus {
  if (statuses.length === 0) return "not-checked";
  if (statuses.every((s) => s === "not-checked")) return "not-checked";
  if (statuses.some((s) => s === "manual-verification")) return "manual-verification";
  if (statuses.some((s) => s === "needs-review")) return "needs-review";
  // Any remaining "not-checked" alongside "verified" means not all sources are
  // confirmed yet -> treat the course as needing review, not verified.
  if (statuses.some((s) => s === "not-checked")) return "needs-review";
  return "verified";
}

/**
 * Normalize page text before hashing so trivial differences (whitespace, case)
 * do not cause noise, while still catching meaningful content changes.
 * Whole-page normalized text is intentional for the beta MVP: false positives
 * are acceptable because a detected change only triggers human review.
 */
export function normalizePageText(raw: string): string {
  return (
    raw
      // Drop script/style blocks entirely.
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      // Strip remaining tags.
      .replace(/<[^>]+>/g, " ")
      // Collapse whitespace and lowercase.
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  );
}
