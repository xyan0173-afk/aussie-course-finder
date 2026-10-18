import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  FRESHNESS_META,
  COURSE_DISPLAY_META,
  decideSourceFreshness,
  aggregateCourseDisplay,
  type CourseDisplayStatus,
  type CheckResult,
} from "../lib/freshness";
import { MONITORED, sourceKey, type CourseId } from "../lib/freshness-data";
import { runFreshnessCheck } from "../lib/freshness-check";
import {
  loadCheckResults,
  saveCheckResults,
  loadApprovedBaselines,
  saveApprovedBaselines,
  loadManualVerifications,
  saveManualVerifications,
  type StoredCheckResults,
  type StoredBaselines,
  type StoredManualVerifications,
} from "../lib/freshness-storage";

type Search = {
  academic: string;
  ielts: string;
  maths: string;
  field: string;
  city: string;
  budget: string;
  career: string;
};

function readSearch(search: Record<string, unknown>): Search {
  const str = (key: string) => (typeof search[key] === "string" ? (search[key] as string) : "");
  return {
    academic: str("academic"),
    ielts: str("ielts"),
    maths: str("maths"),
    field: str("field"),
    city: str("city"),
    budget: str("budget"),
    career: str("career"),
  };
}

export const Route = createFileRoute("/results")({
  validateSearch: readSearch,
  head: () => ({
    meta: [
      { title: "Your Course Matches — CourseCompass AU" },
      {
        name: "description",
        content:
          "Compare your profile with published entry requirements for three Australian Bachelor of Information Technology courses, with official source links.",
      },
      { property: "og:title", content: "Your Course Matches — CourseCompass AU" },
      {
        property: "og:description",
        content:
          "Source-linked comparison of your profile against published requirements for Monash, RMIT and Deakin IT degrees.",
      },
    ],
  }),
  component: Results,
});

// ============= Verified beta dataset =============

type Status = "eligible" | "verify" | "not-met";
type Check = { status: Status; note: string };

const VERIFY_TEXT = "This requirement needs verification using the official university source.";

type Course = {
  id: string;
  university: string;
  course: string;
  code: string;
  location: string;
  cities: string[];
  duration: string;
  tuition: number | null; // indicative 2027 annual international tuition, AUD
  infoStatus: string;
  sources: { label: string; url: string }[];
  lastChecked: string;
  caveat?: string;
  academic: (raw: string) => Check;
  ielts: { overall: number; band: number } | null;
  requiresMaths: boolean | null; // null = not verified
};

function firstNumber(raw: string): number | null {
  const match = raw.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

const COURSES: Course[] = [
  {
    id: "monash-c2000",
    university: "Monash University",
    course: "Bachelor of Information Technology",
    code: "C2000",
    location: "Clayton, Melbourne",
    cities: ["Melbourne"],
    duration: "3 years full-time",
    tuition: 58940,
    infoStatus: "Verified",
    sources: [
      {
        label: "Monash course page (C2000)",
        url: "https://www.monash.edu/study/courses/find-a-course/information-technology-c2000?international=true",
      },
      {
        label: "Monash China Gaokao entry requirements",
        url: "https://www.monash.edu/admissions/entry-requirements/china-gaokao",
      },
    ],
    lastChecked: "13 October 2026",
    academic: (raw) => {
      const n = firstNumber(raw);
      if (n === null)
        return { status: "verify", note: `No Gaokao percentage provided. ${VERIFY_TEXT}` };
      if (n > 100)
        return {
          status: "verify",
          note: `A raw score of ${n} can't be compared safely — Monash requires 65% of your province's official maximum Gaokao score (your score ÷ provincial maximum × 100). ${VERIFY_TEXT}`,
        };
      if (n >= 65)
        return {
          status: "eligible",
          note: `${n}% meets the published 65% of maximum Gaokao score.`,
        };
      return {
        status: "not-met",
        note: `${n}% is below the published 65% of maximum Gaokao score.`,
      };
    },
    ielts: { overall: 6.5, band: 6.0 },
    requiresMaths: true,
  },
  {
    id: "rmit-bp162",
    university: "RMIT University",
    course: "Bachelor of Information Technology",
    code: "BP162",
    location: "Melbourne City",
    cities: ["Melbourne"],
    duration: "3 years full-time",
    tuition: 45120,
    infoStatus: "Verified with regional caveat",
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
    lastChecked: "29 September 2026",
    caveat:
      "Regional equivalency: RMIT's published China table lists Beijing Gaokao 454 as an example of its 70 entry standard. This is not a China-wide threshold — other provinces may be assessed differently or need confirmation by RMIT International.",
    academic: () => ({
      status: "verify",
      note: `Entry standard 70. Your Gaokao result can't be safely mapped without your province's equivalency. ${VERIFY_TEXT}`,
    }),
    ielts: { overall: 6.5, band: 6.0 },
    requiresMaths: true,
  },
  {
    id: "deakin-s326",
    university: "Deakin University",
    course: "Bachelor of Information Technology",
    code: "S326",
    location: "Burwood, Melbourne / Waurn Ponds, Geelong / Online",
    cities: ["Melbourne", "Geelong"],
    duration: "3 years full-time",
    tuition: 43800,
    infoStatus: "Verified",
    sources: [
      {
        label: "Deakin Bachelor of Information Technology (S326)",
        url: "https://www.deakin.edu.au/course/bachelor-information-technology-international",
      },
      {
        label: "Deakin 2027 International Course Guide",
        url: "https://www.deakin.edu.au/__data/assets/pdf_file/0034/274669/deakin-international-course-guide.pdf",
      },
    ],
    lastChecked: "13 October 2026",
    caveat:
      "Based on verified 2027 official Deakin sources. Meeting the published minimum requirements does not guarantee admission — final decisions are made by Deakin.",
    academic: (raw) => {
      const n = firstNumber(raw);
      if (n === null)
        return { status: "verify", note: `No Gaokao percentage provided. ${VERIFY_TEXT}` };
      if (n > 100)
        return {
          status: "verify",
          note: `A raw score of ${n} can't be compared safely — Deakin requires 60% of your province's official maximum Gaokao score (your score ÷ provincial maximum × 100). ${VERIFY_TEXT}`,
        };
      if (n >= 60)
        return {
          status: "eligible",
          note: `${n}% meets the published 60% of maximum Gaokao score.`,
        };
      return {
        status: "not-met",
        note: `${n}% is below the published 60% of maximum Gaokao score.`,
      };
    },
    ielts: { overall: 6.0, band: 6.0 },
    requiresMaths: false,
  },
];

const STATUS_META: Record<
  Status,
  { label: string; short: string; text: string; dot: string; chip: string }
> = {
  eligible: {
    label: "Appears Eligible Based on Published Requirements",
    short: "Appears Met",
    text: "text-mint",
    dot: "bg-mint",
    chip: "border-mint/40 bg-mint/10 text-mint",
  },
  verify: {
    label: "Needs Verification",
    short: "Needs Verification",
    text: "text-warn",
    dot: "bg-warn",
    chip: "border-warn/40 bg-warn/10 text-warn",
  },
  "not-met": {
    label: "Requirement Not Met",
    short: "Not Met",
    text: "text-danger",
    dot: "bg-danger",
    chip: "border-danger/40 bg-danger/10 text-danger",
  },
};

function ieltsResult(course: Course, raw: string): Check {
  if (!course.ielts)
    return { status: "verify", note: `IELTS requirement not verified. ${VERIFY_TEXT}` };
  const { overall, band } = course.ielts;
  const n = firstNumber(raw);
  if (n === null)
    return {
      status: "verify",
      note: `No IELTS score provided. Published: ${overall} overall, min ${band} each band.`,
    };
  if (n >= overall)
    return {
      status: "eligible",
      note: `${n} overall meets the published ${overall}. Each band must also be at least ${band}.`,
    };
  return {
    status: "not-met",
    note: `${n} overall is below the published ${overall} (min ${band} each band).`,
  };
}

function mathsResult(course: Course, maths: string): Check {
  if (course.requiresMaths === null)
    return { status: "verify", note: `Mathematics prerequisite not verified. ${VERIFY_TEXT}` };
  if (course.requiresMaths === false)
    return {
      status: "eligible",
      note: "No separate mathematics prerequisite is listed in the verified 2027 course requirements.",
    };
  if (maths === "yes")
    return {
      status: "eligible",
      note: "Mathematics completed. Confirm your subject matches the published prerequisite.",
    };
  if (maths === "no")
    return { status: "not-met", note: "A mathematics prerequisite applies to this course." };
  return { status: "verify", note: "Mathematics status not provided." };
}

type BudgetCheck = { label: string; tone: Status; note: string };

function budgetCap(raw: string): number | null {
  if (raw.startsWith("Under")) return 30000;
  if (raw.includes("$30,000 –")) return 45000;
  if (raw.includes("$45,000 –")) return 60000;
  if (raw.includes("60,000+")) return Number.POSITIVE_INFINITY;
  return null;
}

function budgetResult(course: Course, budget: string): BudgetCheck {
  const cap = budgetCap(budget);
  if (course.tuition === null)
    return {
      label: "Needs Verification",
      tone: "verify",
      note: `Tuition not verified. ${VERIFY_TEXT}`,
    };
  const fee = `Indicative 2027 tuition A$${course.tuition.toLocaleString()}/yr`;
  if (cap === null)
    return { label: "Needs Verification", tone: "verify", note: `${fee}. No budget provided.` };
  if (course.tuition <= cap)
    return { label: "Within stated budget", tone: "eligible", note: `${fee}.` };
  return {
    label: "Above stated budget",
    tone: "not-met",
    note: `${fee} — above your stated budget (${budget}).`,
  };
}

// Budget is not an admissions requirement, so it does not affect overall status.
function overallStatus(results: Check[]): Status {
  if (results.some((r) => r.status === "not-met")) return "not-met";
  if (results.some((r) => r.status === "verify")) return "verify";
  return "eligible";
}

function explain(
  course: Course,
  p: Search,
  a: Check,
  i: Check,
  m: Check,
  b: BudgetCheck,
): string[] {
  const fieldMatch =
    p.field === "Information Technology" || p.field === "Computer Science"
      ? `Study field: this IT degree matches your preferred field (${p.field}).`
      : `Study field: this is an IT degree, which differs from your preferred field${p.field ? ` (${p.field})` : ""}.`;
  const cityMatch = course.cities.includes(p.city)
    ? `Location: ${course.location} matches your preferred city (${p.city}).`
    : `Location: ${course.location} — not your preferred city${p.city ? ` (${p.city})` : ""}.`;
  const line = (label: string, c: Check) => `${label}: ${STATUS_META[c.status].short}. ${c.note}`;
  return [
    fieldMatch,
    cityMatch,
    line("Academic", a),
    line("IELTS", i),
    line("Mathematics", m),
    `Budget: ${b.label}. ${b.note} (Budget is not an admission requirement.)`,
  ];
}

// ============= Page =============

function StatusChip({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${meta.chip}`}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

function ResultRow({
  label,
  status,
  statusLabel,
  note,
}: {
  label: string;
  status: Status;
  statusLabel?: string;
  note: string;
}) {
  const meta = STATUS_META[status];
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/40">{label}</p>
        <p className="mt-0.5 text-sm leading-snug text-foreground/70">{note}</p>
      </div>
      <span
        className={`mt-0.5 inline-flex shrink-0 items-center gap-1.5 text-right text-xs font-medium ${meta.text}`}
      >
        <span className={`size-1.5 rounded-full ${meta.dot}`} />
        {statusLabel ?? meta.short}
      </span>
    </div>
  );
}

// ============= Data freshness (separate from eligibility) =============
// Freshness answers "does our STORED data still match the official source?"
// It is deliberately kept apart from the eligibility Status above. A detected
// change only flags for human review and never edits any course fact.

function FreshnessBadge({ status }: { status: CourseDisplayStatus }) {
  const meta =
    status === "manually-verified-limited"
      ? COURSE_DISPLAY_META["manually-verified-limited"]
      : FRESHNESS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.chip}`}
      title={meta.description}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

function Results() {
  const profile = Route.useSearch();
  const hasProfile = Boolean(profile.academic || profile.ielts);
  const [openWhy, setOpenWhy] = useState<string | null>(null);
  const [openSource, setOpenSource] = useState<string | null>(null);

  // --- Freshness state, persisted in localStorage (BETA/DEMO only) ---------
  // Two concerns are kept separate on purpose:
  //   checkResults      = what the automated checker fetched (machine).
  //   approvedBaselines = fingerprints a HUMAN approved after review.
  // Both are loaded from localStorage on mount so a check (and an approved
  // baseline) survives a browser refresh. Production would use server storage.
  const [checkResults, setCheckResults] = useState<StoredCheckResults>({});
  const [approvedBaselines, setApprovedBaselines] = useState<StoredBaselines>({});
  // Human MANUAL verifications — a hybrid fallback for sources that cannot be
  // fetched automatically. Tracked separately from checkResults/baselines.
  const [manualVerifications, setManualVerifications] = useState<StoredManualVerifications>({});
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadCheckResults();
    setCheckResults(stored);
    setApprovedBaselines(loadApprovedBaselines());
    setManualVerifications(loadManualVerifications());
    // Surface the most recent check timestamp across all courses, if any.
    const times = Object.values(stored)
      .map((r) => r?.lastSourceCheck)
      .filter((t): t is string => Boolean(t));
    if (times.length > 0) setLastRunAt(times.sort().at(-1) ?? null);
  }, []);

  // Build the full per-source + aggregated course view for one course id.
  const freshnessFor = (id: string) => {
    const monitored = MONITORED[id as CourseId];
    if (!monitored) return null;

    const sources = monitored.sources.map((src) => {
      const key = sourceKey(id as CourseId, src.url);
      const result: CheckResult | null = checkResults[key] ?? null;
      const approvedBaseline = approvedBaselines[key] ?? null;
      const status = decideSourceFreshness(result, approvedBaseline);
      const manual = manualVerifications[key] ?? null;
      return {
        label: src.label,
        url: src.url,
        status,
        lastSourceCheck: result?.lastSourceCheck ?? null,
        reason: result?.reason ?? null,
        approvedBaseline,
        // Approvable only when the page was actually fetched and does not
        // already match the approved baseline. Approval is PER SOURCE.
        canApprove:
          result?.fetchedFingerprint != null && result.fetchedFingerprint !== approvedBaseline,
        // Human review (hybrid fallback) — kept separate from the automated
        // status above. A source can be marked manually verified only when it
        // could NOT be fetched automatically.
        manualVerifiedAt: manual?.manualVerifiedAt ?? null,
        canMarkManual: status === "manual-verification",
      };
    });

    // Course-level status layers manual review on top of the automated
    // aggregation (never upgrades the automated per-source result itself).
    const status: CourseDisplayStatus = aggregateCourseDisplay(
      sources.map((s) => ({ automated: s.status, manuallyVerified: s.manualVerifiedAt !== null })),
    );
    return { status, lastVerified: monitored.lastVerified, sources };
  };

  async function handleCheckNow() {
    setChecking(true);
    setCheckError(null);
    try {
      const report = await runFreshnessCheck();
      const next: StoredCheckResults = { ...checkResults };
      // Store one result PER SOURCE, keyed by courseId + url.
      for (const item of report.items) next[sourceKey(item.courseId, item.url)] = item.result;
      setCheckResults(next);
      saveCheckResults(next); // persist across refresh (beta)
      setLastRunAt(report.checkedAt);
    } catch (err) {
      // If the check mechanism itself fails, do not guess any status.
      setCheckError(
        err instanceof Error
          ? err.message
          : "The freshness check could not be completed. Please try again.",
      );
    } finally {
      setChecking(false);
    }
  }

  // Human review action: approve the latest fetched fingerprint for ONE source
  // as its trusted baseline. This is the ONLY way a source can become
  // "Verified". It never changes any course fact or eligibility rule.
  function handleApproveBaseline(courseId: CourseId, url: string) {
    const key = sourceKey(courseId, url);
    const result = checkResults[key];
    if (!result?.fetchedFingerprint) return;
    const next: StoredBaselines = { ...approvedBaselines, [key]: result.fetchedFingerprint };
    setApprovedBaselines(next);
    saveApprovedBaselines(next); // persist across refresh (beta)
  }

  // Human review action for sources that CANNOT be fetched automatically
  // (e.g. HTTP 403). This records ONLY that a person reviewed the official
  // source. It does NOT create a fingerprint baseline, does NOT change the
  // automated check result, and does NOT modify any course fact.
  function handleMarkManuallyVerified(courseId: CourseId, url: string) {
    const key = sourceKey(courseId, url);
    const next: StoredManualVerifications = {
      ...manualVerifications,
      [key]: {
        manualVerifiedAt: new Date().toISOString(),
        manualVerificationStatus: "verified",
      },
    };
    setManualVerifications(next);
    saveManualVerifications(next); // persist across refresh (beta)
  }

  const summary = [
    { label: "Academic score", value: profile.academic || "—" },
    { label: "IELTS", value: profile.ielts || "—" },
    {
      label: "Mathematics",
      value: profile.maths === "yes" ? "Yes" : profile.maths === "no" ? "No" : "—",
    },
    { label: "Field", value: profile.field || "—" },
    { label: "City", value: profile.city || "—" },
    { label: "Budget", value: profile.budget || "—" },
    ...(profile.career ? [{ label: "Career interest", value: profile.career }] : []),
  ];

  const asksAboutChances = /guarantee|definitely|chance|probability|admit|offer/i.test(
    profile.career,
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-brand/40 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[560px] w-[560px] rounded-full bg-cyan/30 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-mint/20 blur-[120px]" />
        <div className="absolute left-1/2 top-24 h-[400px] w-[760px] -rotate-12 rounded-[40px] border border-white/10 bg-white/[0.03]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-6">
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-cyan font-display text-lg font-bold text-ink">
              C
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-lg font-bold tracking-tight">
                CourseCompass AU
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/40">
                Undergraduate Explorer
              </p>
            </div>
          </Link>
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            <span aria-hidden="true">←</span> Back to Profile
          </Link>
        </header>

        {!hasProfile ? (
          <div className="glass mt-16 rounded-3xl p-8 text-center sm:p-12">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">No profile yet</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/60">
              Fill in your academic profile first, then we&rsquo;ll compare it with published course
              requirements.
            </p>
            <Link
              to="/"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand to-cyan px-6 py-3 font-display text-sm font-bold text-ink transition hover:brightness-110"
            >
              Back to Profile
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-12">
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                Your Course{" "}
                <span className="bg-gradient-to-r from-cyan to-mint bg-clip-text text-transparent">
                  Matches
                </span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/60 sm:text-base">
                We compared your profile with the published requirements for three Bachelor of
                Information Technology courses in our beta dataset. This is a small beta — it does
                not cover all Australian universities or courses.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {summary.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs text-foreground/70"
                >
                  <span className="text-foreground/40">{item.label}:</span> {item.value}
                </span>
              ))}
            </div>

            {asksAboutChances && (
              <div className="mt-8 rounded-2xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-xs leading-relaxed text-foreground/80 sm:text-sm">
                CourseCompass AU cannot guarantee admission. The result only compares your profile
                with currently published requirements. Final admission decisions are made by the
                university.
              </div>
            )}

            {/* ===================== Data Freshness ===================== */}
            <section className="glass mt-8 rounded-3xl p-6" aria-labelledby="freshness-heading">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 id="freshness-heading" className="font-display text-lg font-semibold">
                    Data Freshness
                  </h2>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-foreground/60 sm:text-sm">
                    We monitor whether each official source page has changed since our data was last
                    verified by a person. A detected change only signals a <em>possible</em> source
                    change — it never automatically updates admission requirements, IELTS, maths
                    prerequisites or tuition. A course only shows “Verified” once a person reviews
                    the source and approves it as the baseline.
                  </p>
                  <p className="mt-2 max-w-2xl text-[11px] leading-relaxed text-foreground/40">
                    Beta note: check results and approved baselines are saved in this browser
                    (localStorage) for the demo. A production version would store them on the
                    server.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCheckNow}
                  disabled={checking}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-cyan px-5 py-2.5 font-display text-sm font-bold text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {checking ? "Checking sources…" : "Check official sources now"}
                </button>
              </div>

              {lastRunAt && !checkError && (
                <p className="mt-3 text-[11px] text-foreground/40">
                  Last automated check run: {new Date(lastRunAt).toLocaleString()}
                </p>
              )}
              {checkError && (
                <p className="mt-3 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-xs leading-relaxed text-danger">
                  The source check could not be completed ({checkError}). Nothing was changed.
                  Please verify sources manually or try again.
                </p>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {COURSES.map((course) => {
                  const f = freshnessFor(course.id);
                  if (!f) return null;
                  return (
                    <div
                      key={course.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-cyan">
                        {course.university}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground/50">
                        {course.code} · {f.sources.length}{" "}
                        {f.sources.length === 1 ? "official source" : "official sources"}
                      </p>

                      {/* Aggregated course-level freshness */}
                      <div className="mt-3">
                        <FreshnessBadge status={f.status} />
                      </div>
                      <p className="mt-1 text-[11px] text-foreground/40">
                        Course status reflects all sources below. Last verified: {f.lastVerified}
                      </p>

                      {/* Per-source breakdown */}
                      <ul className="mt-3 space-y-2.5 border-t border-white/5 pt-3">
                        {f.sources.map((s) => (
                          <li
                            key={s.url}
                            className="rounded-xl border border-white/10 bg-white/5 p-3"
                          >
                            <p className="min-w-0 text-xs font-medium text-foreground/80">
                              {s.label}
                            </p>

                            {/* Automated monitoring (fingerprint-based) */}
                            <div className="mt-2">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-foreground/35">
                                Automated monitoring
                              </p>
                              <div className="mt-1">
                                <FreshnessBadge status={s.status} />
                              </div>
                              {s.status === "needs-review" && s.approvedBaseline === null && (
                                <p className="mt-1 text-[11px] leading-snug text-warn">
                                  No verified baseline yet.
                                </p>
                              )}
                              {s.reason && (
                                <p className="mt-1 text-[11px] leading-snug text-foreground/55">
                                  {s.reason}
                                </p>
                              )}
                            </div>

                            {/* Human review (hybrid fallback) — separate fact */}
                            <div className="mt-2.5">
                              <p className="text-[10px] uppercase tracking-[0.14em] text-foreground/35">
                                Human review
                              </p>
                              <p className="mt-1 text-[11px] leading-snug text-foreground/60">
                                {s.manualVerifiedAt
                                  ? `Verified manually on ${new Date(s.manualVerifiedAt).toLocaleDateString()}`
                                  : "Not manually reviewed"}
                              </p>
                            </div>

                            <dl className="mt-2 space-y-1 text-[11px] text-foreground/40">
                              <div className="flex justify-between gap-2">
                                <dt>Last source check</dt>
                                <dd className="text-foreground/60">
                                  {s.lastSourceCheck
                                    ? new Date(s.lastSourceCheck).toLocaleString()
                                    : "Not yet checked"}
                                </dd>
                              </div>
                              <div className="flex justify-between gap-2">
                                <dt>Approved baseline</dt>
                                <dd className="text-foreground/60">
                                  {s.approvedBaseline ? "Set by human review" : "None"}
                                </dd>
                              </div>
                            </dl>

                            {/* Accessible source: automated baseline approval */}
                            {s.canApprove && (
                              <button
                                type="button"
                                onClick={() => handleApproveBaseline(course.id as CourseId, s.url)}
                                className="mt-2 w-full rounded-lg border border-mint/40 bg-mint/10 px-3 py-1.5 text-[11px] font-medium text-mint transition-colors hover:bg-mint/20"
                              >
                                Approve this source as verified baseline
                              </button>
                            )}
                            {/* Inaccessible source: record human review only */}
                            {s.canMarkManual && !s.manualVerifiedAt && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMarkManuallyVerified(course.id as CourseId, s.url)
                                }
                                className="mt-2 w-full rounded-lg border border-cyan/40 bg-cyan/10 px-3 py-1.5 text-[11px] font-medium text-cyan transition-colors hover:bg-cyan/20"
                              >
                                Mark as manually verified
                              </button>
                            )}
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block break-words text-[11px] text-mint underline-offset-2 hover:underline"
                            >
                              Open official source ↗
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* The verified MVP dataset only contains Information Technology
                courses, so only show them when IT is the selected field. */}
            {profile.field !== "Information Technology" ? (
              <div className="glass mt-8 rounded-3xl p-8 text-center sm:p-10">
                <h2 className="font-display text-xl font-bold sm:text-2xl">
                  No verified courses are currently available for this field.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/60">
                  CourseCompass AU currently covers selected undergraduate Information Technology
                  courses only{profile.field ? ` — not ${profile.field}` : ""}. Try selecting
                  Information Technology as your preferred field to see verified matches.
                </p>
                <Link
                  to="/"
                  className="mt-7 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand to-cyan px-6 py-3 font-display text-sm font-bold text-ink transition hover:brightness-110"
                >
                  Adjust my profile
                </Link>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {COURSES.map((course) => {
                  const academic = course.academic(profile.academic);
                  const ielts = ieltsResult(course, profile.ielts);
                  const maths = mathsResult(course, profile.maths);
                  const budget = budgetResult(course, profile.budget);
                  const overall = overallStatus([academic, ielts, maths]);
                  const whyOpen = openWhy === course.id;
                  const sourceOpen = openSource === course.id;

                  return (
                    <article key={course.id} className="glass flex flex-col rounded-3xl p-6">
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan">
                        {course.university}
                      </p>
                      <h2 className="mt-1.5 font-display text-lg font-semibold leading-snug">
                        {course.course}
                      </h2>
                      <p className="mt-1 text-xs text-foreground/50">
                        {course.code} · {course.location} · {course.duration}
                      </p>
                      <p className="mt-1 text-xs text-foreground/50">
                        {course.tuition !== null
                          ? `Indicative 2027 tuition A$${course.tuition.toLocaleString()}/yr`
                          : "Tuition: needs verification"}
                      </p>

                      <div className="mt-4">
                        <StatusChip status={overall} />
                      </div>

                      {course.caveat && (
                        <p className="mt-4 rounded-xl border border-warn/30 bg-warn/10 px-3 py-2.5 text-xs leading-relaxed text-warn">
                          {course.caveat}
                        </p>
                      )}

                      <div className="mt-4 divide-y divide-white/5 border-t border-white/5">
                        <ResultRow
                          label="Academic requirement"
                          status={academic.status}
                          note={academic.note}
                        />
                        <ResultRow
                          label="IELTS requirement"
                          status={ielts.status}
                          note={ielts.note}
                        />
                        <ResultRow
                          label="Mathematics prerequisite"
                          status={maths.status}
                          note={maths.note}
                        />
                        <ResultRow
                          label="Budget status"
                          status={budget.tone}
                          statusLabel={budget.label}
                          note={budget.note}
                        />
                      </div>

                      <p className="mt-3 text-[11px] text-foreground/40">
                        Information status: {course.infoStatus} · Last checked: {course.lastChecked}
                      </p>
                      {(() => {
                        const f = freshnessFor(course.id);
                        return f ? (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[11px] text-foreground/40">Data freshness:</span>
                            <FreshnessBadge status={f.status} />
                          </div>
                        ) : null;
                      })()}

                      {whyOpen && (
                        <ul className="mt-4 space-y-1.5 rounded-xl border border-cyan/25 bg-cyan/10 px-4 py-3 text-xs leading-relaxed text-foreground/75">
                          {explain(course, profile, academic, ielts, maths, budget).map((l) => (
                            <li key={l}>{l}</li>
                          ))}
                          <li className="text-foreground/50">
                            Meeting published minimums does not mean you will receive an offer.
                          </li>
                        </ul>
                      )}
                      {sourceOpen && (
                        <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-foreground/60">
                          {course.sources.map((s) => (
                            <a
                              key={s.url}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block break-words text-mint underline-offset-2 hover:underline"
                            >
                              {s.label} ↗
                            </a>
                          ))}
                          <p>Last checked: {course.lastChecked}</p>
                        </div>
                      )}

                      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                        <button
                          type="button"
                          aria-expanded={whyOpen}
                          onClick={() => {
                            setOpenWhy(whyOpen ? null : course.id);
                            setOpenSource(null);
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-foreground/80 transition-colors hover:border-cyan/50 hover:text-cyan"
                        >
                          {whyOpen ? "Hide details" : "Why this course?"}
                        </button>
                        <button
                          type="button"
                          aria-expanded={sourceOpen}
                          onClick={() => {
                            setOpenSource(sourceOpen ? null : course.id);
                            setOpenWhy(null);
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-medium text-foreground/80 transition-colors hover:border-mint/50 hover:text-mint"
                        >
                          {sourceOpen ? "Hide source" : "Official Source"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <p className="mt-10 text-center text-xs leading-relaxed text-foreground/40">
              CourseCompass AU provides decision support based on published university information.
              It does not guarantee admission. Final admission decisions are made by universities.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
