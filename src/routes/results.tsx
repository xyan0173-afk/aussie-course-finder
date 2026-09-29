import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

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
  const str = (key: string) =>
    typeof search[key] === "string" ? (search[key] as string) : "";
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
    ],
    lastChecked: "29 September 2026",
    academic: (raw) => {
      const n = firstNumber(raw);
      if (n === null) return { status: "verify", note: `No Gaokao percentage provided. ${VERIFY_TEXT}` };
      if (n > 100)
        return {
          status: "verify",
          note: `A raw score of ${n} can't be compared safely — Monash requires 65% of your province's official maximum Gaokao score (your score ÷ provincial maximum × 100). ${VERIFY_TEXT}`,
        };
      if (n >= 65) return { status: "eligible", note: `${n}% meets the published 65% of maximum Gaokao score.` };
      return { status: "not-met", note: `${n}% is below the published 65% of maximum Gaokao score.` };
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
    location: "Burwood, Melbourne / Waurn Ponds, Geelong",
    cities: ["Melbourne"],
    duration: "3 years full-time",
    tuition: null,
    infoStatus: "Needs Verification",
    sources: [
      {
        label: "Deakin course page (S326)",
        url: "https://www.deakin.edu.au/course/bachelor-information-technology-international",
      },
    ],
    lastChecked: "29 September 2026",
    caveat:
      "Needs Verification: China-specific entry requirements, IELTS, mathematics and tuition for this course have not been verified in our beta dataset yet. Please check the official Deakin source.",
    academic: () => ({
      status: "verify",
      note: `China-specific academic requirements not yet verified. ${VERIFY_TEXT}`,
    }),
    ielts: null,
    requiresMaths: null,
  },
];

const STATUS_META: Record<Status, { label: string; short: string; text: string; dot: string; chip: string }> = {
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
  if (!course.ielts) return { status: "verify", note: `IELTS requirement not verified. ${VERIFY_TEXT}` };
  const { overall, band } = course.ielts;
  const n = firstNumber(raw);
  if (n === null) return { status: "verify", note: `No IELTS score provided. Published: ${overall} overall, min ${band} each band.` };
  if (n >= overall)
    return {
      status: "eligible",
      note: `${n} overall meets the published ${overall}. Each band must also be at least ${band}.`,
    };
  return { status: "not-met", note: `${n} overall is below the published ${overall} (min ${band} each band).` };
}

function mathsResult(course: Course, maths: string): Check {
  if (course.requiresMaths === null)
    return { status: "verify", note: `Mathematics prerequisite not verified. ${VERIFY_TEXT}` };
  if (maths === "yes")
    return { status: "eligible", note: "Mathematics completed. Confirm your subject matches the published prerequisite." };
  if (maths === "no") return { status: "not-met", note: "A mathematics prerequisite applies to this course." };
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
    return { label: "Needs Verification", tone: "verify", note: `Tuition not verified. ${VERIFY_TEXT}` };
  const fee = `Indicative 2027 tuition A$${course.tuition.toLocaleString()}/yr`;
  if (cap === null) return { label: "Needs Verification", tone: "verify", note: `${fee}. No budget provided.` };
  if (course.tuition <= cap) return { label: "Within stated budget", tone: "eligible", note: `${fee}.` };
  return { label: "Above stated budget", tone: "not-met", note: `${fee} — above your stated budget (${budget}).` };
}

// Budget is not an admissions requirement, so it does not affect overall status.
function overallStatus(results: Check[]): Status {
  if (results.some((r) => r.status === "not-met")) return "not-met";
  if (results.some((r) => r.status === "verify")) return "verify";
  return "eligible";
}

function explain(course: Course, p: Search, a: Check, i: Check, m: Check, b: BudgetCheck): string[] {
  const fieldMatch =
    p.field === "Information Technology" || p.field === "Computer Science"
      ? `Study field: this IT degree matches your preferred field (${p.field}).`
      : `Study field: this is an IT degree, which differs from your preferred field${p.field ? ` (${p.field})` : ""}.`;
  const cityMatch = course.cities.includes(p.city)
    ? `Location: ${course.location} matches your preferred city (${p.city}).`
    : `Location: ${course.location} — not your preferred city${p.city ? ` (${p.city})` : ""}.`;
  const line = (label: string, c: Check) =>
    `${label}: ${STATUS_META[c.status].short}. ${c.note}`;
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
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${meta.chip}`}>
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

function ResultRow({ label, status, statusLabel, note }: { label: string; status: Status; statusLabel?: string; note: string }) {
  const meta = STATUS_META[status];
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/40">{label}</p>
        <p className="mt-0.5 text-sm leading-snug text-foreground/70">{note}</p>
      </div>
      <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1.5 text-right text-xs font-medium ${meta.text}`}>
        <span className={`size-1.5 rounded-full ${meta.dot}`} />
        {statusLabel ?? meta.short}
      </span>
    </div>
  );
}

function Results() {
  const profile = Route.useSearch();
  const hasProfile = Boolean(profile.academic || profile.ielts);
  const [openWhy, setOpenWhy] = useState<string | null>(null);
  const [openSource, setOpenSource] = useState<string | null>(null);

  const summary = [
    { label: "Academic score", value: profile.academic || "—" },
    { label: "IELTS", value: profile.ielts || "—" },
    { label: "Mathematics", value: profile.maths === "yes" ? "Yes" : profile.maths === "no" ? "No" : "—" },
    { label: "Field", value: profile.field || "—" },
    { label: "City", value: profile.city || "—" },
    { label: "Budget", value: profile.budget || "—" },
    ...(profile.career ? [{ label: "Career interest", value: profile.career }] : []),
  ];

  const asksAboutChances = /guarantee|definitely|chance|probability|admit|offer/i.test(profile.career);

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
              <p className="truncate font-display text-lg font-bold tracking-tight">CourseCompass AU</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-foreground/40">Undergraduate Explorer</p>
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
              Fill in your academic profile first, then we&rsquo;ll compare it with published course requirements.
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
                <span className="bg-gradient-to-r from-cyan to-mint bg-clip-text text-transparent">Matches</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/60 sm:text-base">
                We compared your profile with the published requirements for three Bachelor of
                Information Technology courses in our beta dataset. This is a small beta — it does
                not cover all Australian universities or courses.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {summary.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs text-foreground/70">
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
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan">{course.university}</p>
                    <h2 className="mt-1.5 font-display text-lg font-semibold leading-snug">{course.course}</h2>
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
                      <ResultRow label="Academic requirement" status={academic.status} note={academic.note} />
                      <ResultRow label="IELTS requirement" status={ielts.status} note={ielts.note} />
                      <ResultRow label="Mathematics prerequisite" status={maths.status} note={maths.note} />
                      <ResultRow label="Budget status" status={budget.tone} statusLabel={budget.label} note={budget.note} />
                    </div>

                    <p className="mt-3 text-[11px] text-foreground/40">
                      Information status: {course.infoStatus} · Last checked: {course.lastChecked}
                    </p>

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
