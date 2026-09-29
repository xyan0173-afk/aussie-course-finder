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
          "Sample Australian undergraduate course matches based on your profile. Illustrative entry requirements for testing only — not official.",
      },
      {
        property: "og:title",
        content: "Your Course Matches — CourseCompass AU",
      },
      {
        property: "og:description",
        content:
          "Sample, source-linked Australian undergraduate course matches based on your academic profile.",
      },
   ],
  }),
  component: Results,
});

// ============= Sample / demo data (UI testing only — NOT official) =============

type Status = "eligible" | "verify" | "not-met";

type SampleCourse = {
  university: string;
  course: string;
  city: string;
  annualTuition: number;
  sampleMinScore: number;
  sampleMinIelts: number;
  sampleRequiresMaths: boolean;
  why: string;
};

const SAMPLE_COURSES: SampleCourse[] = [
  {
    university: "Monash University",
    course: "Bachelor of Computer Science",
    city: "Melbourne",
    annualTuition: 48000,
    sampleMinScore: 75,
    sampleMinIelts: 6.5,
    sampleRequiresMaths: true,
    why: "Matches a Computer Science interest in your preferred city of Melbourne. The sample threshold here is illustrative only — the university's official published requirements apply.",
  },
  {
    university: "RMIT University",
    course: "Bachelor of Information Technology",
    city: "Melbourne",
    annualTuition: 42240,
    sampleMinScore: 65,
    sampleMinIelts: 6.5,
    sampleRequiresMaths: false,
    why: "A broader IT degree that keeps software, data and network pathways open, with a lower sample academic threshold. Sample figures only — verify with the university.",
  },
  {
    university: "University of Sydney",
    course: "Bachelor of Advanced Computing",
    city: "Sydney",
    annualTuition: 57000,
    sampleMinScore: 80,
    sampleMinIelts: 6.5,
    sampleRequiresMaths: true,
    why: "An advanced computing program in Sydney with strong industry connections. The sample threshold is set high in this demo — official entry requirements apply.",
  },
];

const STATUS_META: Record<Status, { label: string; text: string; dot: string; chip: string }> = {
  eligible: {
    label: "Appears Eligible",
    text: "text-mint",
    dot: "bg-mint",
    chip: "border-mint/40 bg-mint/10 text-mint",
  },
  verify: {
    label: "Needs Verification",
    text: "text-warn",
    dot: "bg-warn",
    chip: "border-warn/40 bg-warn/10 text-warn",
  },
  "not-met": {
    label: "Requirement Not Met",
    text: "text-danger",
    dot: "bg-danger",
    chip: "border-danger/40 bg-danger/10 text-danger",
  },
};

function firstNumber(raw: string): number | null {
  const match = raw.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

function budgetCap(raw: string): number {
  if (raw.startsWith("Under")) return 30000;
  if (raw.includes("30,000")) return 45000;
  if (raw.includes("45,000")) return 60000;
  return Number.POSITIVE_INFINITY;
}

function academicResult(course: SampleCourse, raw: string): { status: Status; note: string } {
  const score = firstNumber(raw);
  if (score === null) {
    return { status: "verify", note: "Score could not be read — verify with the university." };
  }
  if (score >= course.sampleMinScore) {
    return {
      status: "eligible",
      note: `Sample threshold ${course.sampleMinScore}% met with ${score}.`,
    };
  }
  if (score >= course.sampleMinScore - 10) {
    return {
      status: "verify",
      note: `${score} is close to the sample threshold of ${course.sampleMinScore}% — confirm with the university.`,
    };
  }
  return {
    status: "not-met",
    note: `${score} is below the sample threshold of ${course.sampleMinScore}%.`,
  };
}

function ieltsResult(course: SampleCourse, raw: string): { status: Status; note: string } {
  const score = firstNumber(raw);
  if (score === null) {
    return { status: "verify", note: "IELTS result could not be read — verify with the university." };
  }
  if (score >= course.sampleMinIelts) {
    return {
      status: "eligible",
      note: `Sample minimum ${course.sampleMinIelts} met with ${score}.`,
    };
  }
  if (score >= course.sampleMinIelts - 0.5) {
    return {
      status: "verify",
      note: `${score} is just below the sample minimum of ${course.sampleMinIelts} — pathway or bridging options may exist.`,
    };
  }
  return {
    status: "not-met",
    note: `${score} is below the sample minimum of ${course.sampleMinIelts}.`,
  };
}

function mathsResult(course: SampleCourse, maths: string): { status: Status; note: string } {
  if (!course.sampleRequiresMaths) {
    return { status: "eligible", note: "No strict mathematics prerequisite in this sample." };
  }
  if (maths === "yes") {
    return { status: "eligible", note: "Mathematics completed — sample prerequisite met." };
  }
  if (maths === "no") {
    return { status: "not-met", note: "Mathematics not completed — this course lists it as a prerequisite." };
  }
  return { status: "verify", note: "Mathematics status not provided — verify with the university." };
}

function budgetResult(course: SampleCourse, budget: string): { status: Status; note: string } {
  const cap = budgetCap(budget);
  if (course.annualTuition <= cap) {
    return {
      status: "eligible",
      note: `Est. A$${course.annualTuition.toLocaleString()}/yr fits within your stated budget.`,
    };
  }
  if (Number.isFinite(cap) && course.annualTuition <= cap + 15000) {
    return {
      status: "verify",
      note: `Est. A$${course.annualTuition.toLocaleString()}/yr is slightly above your stated budget — scholarships may apply.`,
    };
  }
  return {
    status: "not-met",
    note: `Est. A$${course.annualTuition.toLocaleString()}/yr is above your stated budget.`,
  };
}

function overallStatus(results: { status: Status }[]): Status {
  if (results.some((r) => r.status === "not-met")) return "not-met";
  if (results.some((r) => r.status === "verify")) return "verify";
  return "eligible";
}

// ============= Page =============

function StatusChip({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${meta.chip}`}
    >
      <span className={`size-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function ResultRow({ label, status, note }: { label: string; status: Status; note: string }) {
  const meta = STATUS_META[status];
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/40">{label}</p>
        <p className="mt-0.5 text-sm leading-snug text-foreground/70">{note}</p>
      </div>
      <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1.5 text-xs font-medium ${meta.text}`}>
        <span className={`size-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {/* Ambient glow field */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-brand/40 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[560px] w-[560px] rounded-full bg-cyan/30 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-mint/20 blur-[120px]" />
        <div className="absolute left-1/2 top-24 h-[400px] w-[760px] -rotate-12 rounded-[40px] border border-white/10 bg-white/[0.03]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-6">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-cyan font-display text-lg font-bold text-ink">
              C
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-lg font-bold tracking-tight">CourseCompass AU</p>
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
              Fill in your academic profile first, then we&rsquo;ll match it against course
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
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/60 sm:text-base">
                Based on your profile, we checked each course&rsquo;s entry requirements.
                Every result includes an academic, English, mathematics and budget check.
              </p>
            </div>

            {/* Profile summary */}
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

            {/* Sample data banner */}
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-warn" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-warn sm:text-sm">
                <span className="font-semibold">Sample / demo data.</span> These three courses
                and all entry requirements shown below are illustrative examples for testing
                only — they are not official and must not be relied on. Official, source-linked
                data will replace this sample set later.
              </p>
            </div>

            {/* Course cards */}
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {SAMPLE_COURSES.map((course) => {
                const academic = academicResult(course, profile.academic);
                const ielts = ieltsResult(course, profile.ielts);
                const maths = mathsResult(course, profile.maths);
                const budget = budgetResult(course, profile.budget);
                const overall = overallStatus([academic, ielts, maths, budget]);
                const whyOpen = openWhy === course.course;
                const sourceOpen = openSource === course.course;

                return (
                  <article key={course.course} className="glass flex flex-col rounded-3xl p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan">
                          {course.university}
                        </p>
                        <h2 className="mt-1.5 font-display text-lg font-semibold leading-snug">
                          {course.course}
                        </h2>
                        <p className="mt-1 text-xs text-foreground/50">
                          {course.city} · Est. tuition A${course.annualTuition.toLocaleString()}/yr
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <StatusChip status={overall} />
                    </div>

                    <div className="mt-4 divide-y divide-white/5 border-t border-white/5">
                      <ResultRow label="Academic requirement" status={academic.status} note={academic.note} />
                      <ResultRow label="IELTS requirement" status={ielts.status} note={ielts.note} />
                      <ResultRow label="Mathematics prerequisite" status={maths.status} note={maths.note} />
                      <ResultRow label="Budget status" status={budget.status} note={budget.note} />
                    </div>

                    {whyOpen && (
                      <p className="mt-4 rounded-xl border border-cyan/25 bg-cyan/10 px-4 py-3 text-xs leading-relaxed text-foreground/75">
                        {course.why}
                      </p>
                    )}
                    {sourceOpen && (
                      <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-foreground/60">
                        Sample data — no official source yet. The direct link to the
                        university&rsquo;s published entry requirements will appear here once
                        verified data is connected.
                      </p>
                    )}

                    <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                      <button
                        type="button"
                        aria-expanded={whyOpen}
                        onClick={() => {
                          setOpenWhy(whyOpen ? null : course.course);
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
                          setOpenSource(sourceOpen ? null : course.course);
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
              CourseCompass AU provides decision support based on published university
              information. It does not guarantee admission.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
