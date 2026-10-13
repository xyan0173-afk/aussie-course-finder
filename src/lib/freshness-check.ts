// ============================================================================
// Freshness check — server function + report shaping (multi-source)
// ============================================================================
//
// This is the "manual Check official sources now" mechanism (and the exact
// same entry point a future scheduled GitHub Action can call).
//
// It wraps the server-only checker in a TanStack Start server function so the
// results page can trigger it from a button, while the actual network fetch +
// hashing run on the SERVER (never in the browser).
//
// It returns ONE RAW result PER OFFICIAL SOURCE: the fetched fingerprint (when
// the page was accessible) and a human-readable reason. It deliberately does
// NOT decide "verified" — the final status is computed on the client by
// comparing each fetched fingerprint against that source's HUMAN-APPROVED
// baseline. A freshly fetched page is never auto-verified, and nothing here
// touches course requirement values.
// ============================================================================

import { createServerFn } from "@tanstack/react-start";

import type { CheckResult } from "./freshness";
import { type CourseId } from "./freshness-data";

export type FreshnessReportItem = {
  courseId: CourseId;
  label: string;
  url: string;
  result: CheckResult;
};

export type FreshnessReport = {
  checkedAt: string;
  items: FreshnessReportItem[];
};

/**
 * Server function: check every official source of every course and return raw
 * per-source results. Demonstrable manually from the results page, and callable
 * later by a scheduled GitHub Action (a normal POST endpoint under the hood).
 */
export const runFreshnessCheck = createServerFn({ method: "POST" }).handler(
  async (): Promise<FreshnessReport> => {
    // Import the server-only checker lazily so node:crypto / fetch stay off the
    // client bundle.
    const { checkAllSources } = await import("./source-check.server");

    const checkedAt = new Date().toISOString();
    const results = await checkAllSources();

    const items: FreshnessReportItem[] = results.map((r) => {
      const result: CheckResult =
        r.outcome.kind === "fetched"
          ? {
              lastSourceCheck: checkedAt,
              fetchedFingerprint: r.outcome.fingerprint,
              reason: "Source fetched successfully.",
            }
          : {
              lastSourceCheck: checkedAt,
              fetchedFingerprint: null,
              reason: r.outcome.reason,
            };

      return { courseId: r.courseId, label: r.label, url: r.url, result };
    });

    return { checkedAt, items };
  },
);
