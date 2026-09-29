import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CourseCompass AU — Find Australian Courses That Fit Your Profile" },
      {
        name: "description",
        content:
          "Enter your academic score, IELTS result and preferences. CourseCompass AU checks published university entry requirements and returns source-linked course recommendations.",
      },
      {
        property: "og:title",
        content: "CourseCompass AU — Find Australian Courses That Fit Your Profile",
      },
      {
        property: "og:description",
        content:
          "Source-linked Australian undergraduate course recommendations based on your scores, English results and preferences.",
      },
    ],
  }),
  component: Index,
});

const FIELDS = [
  "Engineering",
  "Computer Science",
  "Business & Finance",
  "Health & Medicine",
  "Design & Arts",
];

const CITIES = ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"];

const BUDGETS = [
  "Under $30,000",
  "$30,000 – $45,000",
  "$45,000 – $60,000",
  "$60,000+",
];

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 outline-none transition-colors focus:border-cyan/60 focus:bg-white/10";

const labelClass =
  "mb-2 block text-xs font-medium uppercase tracking-wider text-foreground/50";

function Index() {
  const [academicScore, setAcademicScore] = useState("");
  const [ielts, setIelts] = useState("");
  const [mathsCompleted, setMathsCompleted] = useState<boolean | null>(null);
  const [studyField, setStudyField] = useState(FIELDS[0]);
  const [city, setCity] = useState(CITIES[0]);
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [careerInterest, setCareerInterest] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    // Matching logic arrives in a later phase — this page is profile input only.
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background font-sans text-foreground">
      {/* Ambient glow field */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-40 h-[520px] w-[520px] rounded-full bg-brand/40 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[560px] w-[560px] rounded-full bg-cyan/30 blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-mint/20 blur-[120px]" />
        <div className="absolute left-1/2 top-24 h-[400px] w-[760px] -rotate-12 rounded-[40px] border border-white/10 bg-white/[0.03]" />
        <div className="absolute bottom-10 right-10 h-[300px] w-[520px] rotate-6 rounded-[40px] border border-cyan/15 bg-cyan/[0.05]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-6">
        {/* Header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
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
          </div>
          <span className="hidden items-center gap-2 rounded-full glass px-4 py-2 text-xs text-foreground/70 sm:inline-flex">
            <span className="size-2 rounded-full bg-mint" /> Source-linked entry requirements
          </span>
        </header>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12 lg:mt-20">
          {/* Hero copy */}
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-cyan">
              <span className="size-1.5 rounded-full bg-cyan" /> For Chinese high-school students
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.02]">
              Find Australian Courses That Fit Your{" "}
              <span className="bg-gradient-to-r from-cyan to-mint bg-clip-text text-transparent">
                Profile
              </span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-foreground/60 sm:text-lg">
              We check each university&rsquo;s published entry requirements and return
              source-linked recommendations matched to your scores, language results
              and goals.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="glass rounded-2xl p-4">
                <p className="font-display text-2xl font-bold text-cyan">120+</p>
                <p className="mt-1 text-xs text-foreground/50">Courses mapped</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="font-display text-2xl font-bold text-foreground">6</p>
                <p className="mt-1 text-xs text-foreground/50">Cities covered</p>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="font-display text-2xl font-bold text-mint">100%</p>
                <p className="mt-1 text-xs text-foreground/50">Source-linked</p>
              </div>
            </div>
          </div>

          {/* Profile form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Build your profile</h2>
                <span className="text-xs text-foreground/40">~2 min</span>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="academic-score" className={labelClass}>
                    Academic score
                  </label>
                  <input
                    id="academic-score"
                    type="text"
                    inputMode="decimal"
                    maxLength={20}
                    value={academicScore}
                    onChange={(e) => setAcademicScore(e.target.value)}
                    placeholder="e.g. 88% / Gaokao band"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="ielts" className={labelClass}>
                    IELTS score
                  </label>
                  <input
                    id="ielts"
                    type="text"
                    inputMode="decimal"
                    maxLength={10}
                    value={ielts}
                    onChange={(e) => setIelts(e.target.value)}
                    placeholder="e.g. 6.5 overall"
                    className={inputClass}
                  />
                </div>

                <div>
                  <span id="maths-label" className={labelClass}>
                    Mathematics completed
                  </span>
                  <div
                    role="group"
                    aria-labelledby="maths-label"
                    className="grid grid-cols-2 gap-2"
                  >
                    <button
                      type="button"
                      aria-pressed={mathsCompleted === true}
                      onClick={() => setMathsCompleted(true)}
                      className={
                        mathsCompleted === true
                          ? "rounded-xl border border-cyan/60 bg-cyan/15 px-4 py-3 text-sm font-medium text-cyan transition-colors"
                          : "rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-foreground/60 transition-colors hover:border-white/25 hover:text-foreground/80"
                      }
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      aria-pressed={mathsCompleted === false}
                      onClick={() => setMathsCompleted(false)}
                      className={
                        mathsCompleted === false
                          ? "rounded-xl border border-cyan/60 bg-cyan/15 px-4 py-3 text-sm font-medium text-cyan transition-colors"
                          : "rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-foreground/60 transition-colors hover:border-white/25 hover:text-foreground/80"
                      }
                    >
                      No
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="field" className={labelClass}>
                    Preferred study field
                  </label>
                  <select
                    id="field"
                    value={studyField}
                    onChange={(e) => setStudyField(e.target.value)}
                    className={`${inputClass} appearance-none text-foreground/80`}
                  >
                    {FIELDS.map((f) => (
                      <option key={f} value={f} className="bg-ink2">
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className={labelClass}>
                    Preferred city
                  </label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`${inputClass} appearance-none text-foreground/80`}
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c} className="bg-ink2">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="budget" className={labelClass}>
                    Annual budget (AUD)
                  </label>
                  <select
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className={`${inputClass} appearance-none text-foreground/80`}
                  >
                    {BUDGETS.map((b) => (
                      <option key={b} value={b} className="bg-ink2">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="career" className={labelClass}>
                    Career interest
                  </label>
                  <input
                    id="career"
                    type="text"
                    maxLength={120}
                    value={careerInterest}
                    onChange={(e) => setCareerInterest(e.target.value)}
                    placeholder="e.g. Software engineer, data analyst, doctor"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-7 w-full rounded-xl bg-gradient-to-r from-brand to-cyan px-6 py-4 font-display text-base font-bold text-ink shadow-lg shadow-brand/30 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan/60 focus:ring-offset-2 focus:ring-offset-background"
              >
                Find My Courses
              </button>

              <p className="mt-4 text-center text-xs leading-relaxed text-foreground/40">
                CourseCompass AU provides decision support based on published
                university information. It does not guarantee admission.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
