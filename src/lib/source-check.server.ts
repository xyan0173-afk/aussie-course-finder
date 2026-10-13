// ============================================================================
// Server-only source checker
// ============================================================================
//
// Runs the "scheduled source check" step of the freshness pipeline:
//
//   official source -> fetch (server-side) -> normalize whole-page text
//   -> hash -> compare against stored baseline fingerprint
//
// SAFETY:
//   - On ANY failure (non-2xx, timeout, network error, or a response that
//     looks like CAPTCHA / bot protection), we return { kind: "error" }.
//     We never guess content. The caller maps that to "Manual Verification
//     Required".
//   - This module reads the live page and produces a fingerprint + outcome.
//     It NEVER writes course requirement values. The only state the pipeline
//     updates is freshness metadata (lastSourceCheck, freshnessStatus).
//
// The `.server.ts` suffix keeps this out of the client bundle. `node:crypto`
// is used for hashing, so this must only run on the server.
// ============================================================================

import { createHash } from "node:crypto";

import { normalizePageText, type SourceCheckOutcome } from "./freshness";
import { MONITORED, type CourseId } from "./freshness-data";

const DEFAULT_TIMEOUT_MS = 15_000;

/** Signals in a response body/status that commonly indicate bot/anti-automation walls. */
const BOT_WALL_PATTERNS: RegExp[] = [
  /captcha/i,
  /are you a (?:human|robot)/i,
  /verify you are human/i,
  /cf-browser-verification/i, // Cloudflare
  /just a moment\.\.\./i, // Cloudflare interstitial
  /unusual traffic/i,
  /access denied/i,
  /request blocked/i,
  /enable javascript and cookies/i,
];

function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

/** Common HTTP status phrases, used when the response omits a statusText (e.g. HTTP/2). */
const HTTP_STATUS_TEXT: Record<number, string> = {
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  408: "Request Timeout",
  429: "Too Many Requests",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

function httpErrorReason(status: number, statusText: string): string {
  const phrase = statusText?.trim() || HTTP_STATUS_TEXT[status] || "";
  return phrase ? `HTTP ${status} ${phrase}` : `HTTP ${status}`;
}

function looksLikeBotWall(status: number, body: string): boolean {
  // 403/429 are classic anti-bot responses.
  if (status === 403 || status === 429) return true;
  const head = body.slice(0, 4000);
  return BOT_WALL_PATTERNS.some((re) => re.test(head));
}

/**
 * Fetch a single source URL and return a check OUTCOME.
 *
 * The checker's only job is to retrieve the page and produce a fingerprint of
 * its normalized whole-page text:
 *   - "fetched": the page was read; `fingerprint` is its normalized-text hash.
 *   - "error":   could not fetch/read, or the response looks like a bot wall.
 *
 * The checker deliberately does NOT compare against any baseline and does NOT
 * decide "verified"/"changed". That comparison happens later against a
 * HUMAN-APPROVED baseline (see decideFreshness in freshness.ts), so a freshly
 * fetched page can never be auto-verified.
 */
export async function checkSource(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<SourceCheckOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        // A realistic UA reduces trivially-blocked requests, but we still
        // detect and respect anti-bot responses rather than circumventing them.
        "User-Agent":
          "Mozilla/5.0 (compatible; CourseCompassAU-FreshnessBot/1.0; +https://aussie-course-finder.lovable.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const body = await response.text();

    if (!response.ok) {
      return { kind: "error", reason: httpErrorReason(response.status, response.statusText) };
    }

    if (looksLikeBotWall(response.status, body)) {
      return { kind: "error", reason: "Response resembles bot protection / CAPTCHA — not read." };
    }

    const normalized = normalizePageText(body);
    if (normalized.length === 0) {
      return { kind: "error", reason: "Empty page content after normalization." };
    }

    const fingerprint = hash(normalized);
    return { kind: "fetched", fingerprint };
  } catch (err) {
    const reason =
      err instanceof Error && err.name === "AbortError"
        ? `Timeout after ${timeoutMs}ms`
        : err instanceof Error
          ? err.message
          : "Unknown network error";
    return { kind: "error", reason };
  } finally {
    clearTimeout(timer);
  }
}

/** Per-source result of a check run (one entry per official source). */
export type SourceCheckResult = {
  courseId: CourseId;
  label: string;
  url: string;
  outcome: SourceCheckOutcome;
};

/**
 * Run checks for EVERY official source of every monitored course (or a provided
 * subset of courses). Each source in a course's `sources` array is fetched.
 *
 * Returns a REPORT only. It does not persist anything. A human decides what to
 * approve, keeping the "human verifies before update" step intact.
 */
export async function checkAllSources(ids?: CourseId[]): Promise<SourceCheckResult[]> {
  const targetIds = (ids ?? (Object.keys(MONITORED) as CourseId[])).filter(
    (id): id is CourseId => id in MONITORED,
  );

  // Flatten every (course, source) pair, then check them all.
  const pairs = targetIds.flatMap((courseId) =>
    MONITORED[courseId].sources.map((s) => ({ courseId, label: s.label, url: s.url })),
  );

  return Promise.all(
    pairs.map(async ({ courseId, label, url }) => {
      const outcome = await checkSource(url);
      return { courseId, label, url, outcome };
    }),
  );
}
