// ============================================================================
// Monitored official sources (seed data for freshness monitoring)
// ============================================================================
//
// This file lists the official sources we monitor PER COURSE. The entries here
// mirror the `sources` arrays in the COURSES data in results.tsx exactly (same
// labels and URLs). They are duplicated here (rather than imported) to avoid a
// circular import between results.tsx and the freshness library.
//
// ⚠️  KEEP IN SYNC: if a course's `sources` change in results.tsx, update the
// matching entry below. These are the official sources already shown in the UI.
//
// Keys match the existing course ids in results.tsx:
//   "monash-c2000", "rmit-bp162", "deakin-s326"
//
// NOTE: this file holds only the list of sources + the human-set `lastVerified`
// date. It holds NO course requirement values, and no per-source status — the
// automated check results and the human-approved baselines are tracked
// separately and persisted in localStorage for the beta (freshness-storage.ts).
// ============================================================================

import type { MonitoredSource } from "./freshness";

export type CourseId = "monash-c2000" | "rmit-bp162" | "deakin-s326";

export type MonitoredCourse = {
  /** When a human last verified this course's stored data against its sources. */
  lastVerified: string;
  /** Every official source we monitor for this course. */
  sources: MonitoredSource[];
};

export const MONITORED: Record<CourseId, MonitoredCourse> = {
  "monash-c2000": {
    lastVerified: "29 September 2026",
    sources: [
      {
        label: "Monash course page (C2000)",
        url: "https://www.monash.edu/study/courses/find-a-course/information-technology-c2000?international=true",
      },
    ],
  },
  "rmit-bp162": {
    lastVerified: "29 September 2026",
    sources: [
      {
        label: "RMIT course page (BP162)",
        url: "https://www.rmit.edu.au/study-with-us/levels-of-study/undergraduate-study/bachelor-degrees/bachelor-of-information-technology-bp162",
      },
      {
        label: "RMIT China equivalency table",
        url: "https://www.rmit.edu.au/study-with-us/international-students/apply-to-rmit-international-students/entry-requirements/country-equivalency/china-peoples-republic-of",
      },
    ],
  },
  "deakin-s326": {
    lastVerified: "29 September 2026",
    sources: [
      {
        label: "Deakin course page (S326)",
        url: "https://www.deakin.edu.au/course/bachelor-information-technology-international",
      },
    ],
  },
};

/** Convenience list of monitored course ids. */
export const FRESHNESS_IDS = Object.keys(MONITORED) as CourseId[];

/** Stable per-source key used for persistence (courseId + url). */
export function sourceKey(courseId: CourseId, url: string): string {
  return `${courseId}::${url}`;
}
