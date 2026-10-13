# CourseCompass AU – Build Diary

## 29 September 2026

### Tool
Lovable

### Goal
Build the first beta version of CourseCompass AU for Chinese high-school students applying to Australian undergraduate courses.

### What AI produced
Lovable generated the homepage, student profile form, course results page, eligibility checks, source links, and explanation sections.

### Human judgement
The initial version contained unsupported claims such as “120+ Courses” and “100% Source-linked”. These claims were removed because they were not supported by verified data.

The project was then connected to GitHub and imported into Kiro for further development and testing.

### Data
Verified beta course data was added for:
- Monash University – Bachelor of Information Technology (C2000)
- RMIT University – Bachelor of Information Technology (BP162)

Deakin University – Bachelor of Information Technology (S326) was included with “Needs Verification” for fields that had not yet been verified.

### Testing
The following tests were completed:

1. High academic score, IELTS 8.0, Mathematics Yes
   - Monash showed “Appears Eligible Based on Published Requirements”.

2. IELTS 5.0
   - Monash showed “Requirement Not Met”.
   - IELTS requirement showed “Not Met”.

3. Mathematics No
   - Monash showed “Requirement Not Met”.
   - Mathematics requirement showed “Not Met”.

The “Why this course?” explanation and “Official Source” sections were also checked and worked correctly.

### Current limitations
- Only a small beta dataset is currently included.
- RMIT academic equivalency requires regional verification.
- Deakin entry requirements, IELTS, mathematics prerequisite, and tuition are not yet fully verified.

### Next step
Collect beta feedback and decide which issue should be fixed first.

## Week 9 Update

## 4 October 2026

### Beta Testing Feedback
The Week 9 beta presentation provided a clearer direction for improving CourseCompass AU.

One of the main issues identified was data freshness. The current beta uses university information that is manually collected and verified from official sources. However, university entry requirements, tuition fees and other course information may change over time.

The feedback also highlighted that simply using automated web scraping may not be reliable because some university websites use bot detection or CAPTCHA.

### Human Judgement
We decided that the current MVP should not claim to provide real-time university data.

Instead, the app should clearly show when the information was last checked and continue using “Needs Verification” when the information cannot be confidently confirmed.

### Improvement Direction
The next development focus will be to investigate more reliable ways of keeping university information up to date, including:

- official APIs or data feeds where available;
- scheduled checks of university information;
- human verification before important data is updated;
- a clear “last checked” date;
- keeping “Needs Verification” as a fallback when the data cannot be confirmed.

### Next Week Focus
The main focus for next week will be improving the data update and verification process so that CourseCompass AU can provide more current and trustworthy information without relying on uncontrolled web scraping.

## 13 October 2026

### Goal
Act on the Week 9 beta feedback about data freshness by adding a monitoring
system that detects when an official university source may have changed —
without ever auto-editing verified course facts.

### Why (origin of this work)
Beta testers raised that university entry requirements, tuition and other course
details can change over time, and that naive web scraping is unreliable because
some university sites use bot detection or CAPTCHA. The decision was that the MVP
must not claim real-time data and must never silently overwrite verified
information based only on a detected webpage change.

### What was built
A data-freshness layer that is deliberately SEPARATE from eligibility logic:

- `src/lib/freshness.ts` — freshness types, display metadata, and a pure
  decision helper. Three statuses:
  - Verified / source unchanged
  - Needs Review / possible source change
  - Manual Verification Required / source could not be checked
- `src/lib/freshness-data.ts` — the only place freshness metadata is stored
  (source URL, lastVerified, lastSourceCheck, freshnessStatus), keyed by the
  existing course ids. Seeded for Monash C2000, RMIT BP162 and Deakin S326.
- `src/lib/source-check.server.ts` — server-only checker. Fetches the official
  page, hashes the whole-page normalized text, and compares it to the stored
  baseline. On non-2xx, timeout, network error, or anything resembling
  CAPTCHA / bot protection, it returns an error outcome → "Manual Verification
  Required". It never guesses content.
- `src/lib/freshness-check.ts` — a TanStack Start server function
  (`runFreshnessCheck`) powering a manual "Check official sources now" button.
  The same entry point can later be called by a scheduled GitHub Action; the
  scheduler is intentionally NOT required for this first version.
- `src/routes/results.tsx` — a new visible "Data Freshness" section plus a
  per-course freshness badge. Additive only.

### Safety design (human judgement)
- A detected change is treated strictly as a POSSIBLE source change. It flags a
  course as "Needs Review" and never modifies academic requirements, IELTS,
  maths prerequisites, tuition, or any other course fact.
- The checker only updates freshness metadata (lastSourceCheck, freshnessStatus)
  and returns a report. A human reviews and re-verifies before any course data
  is updated. Eligibility logic and all existing Monash/RMIT/Deakin data were
  left unchanged (verified via a whitespace-ignoring diff).
- Whole-page normalized-text hashing is used for the beta MVP. False positives
  are acceptable because a detected change only triggers human review, never an
  automatic update.

### Verification
- `npm run build` succeeds; the checker modules compile as server-only chunks.
- Lint passes.
- Existing eligibility behaviour (Monash eligible/not-met cases, IELTS and maths
  checks) is unchanged.

### Next step
Optionally add a scheduled GitHub Action that calls the same check endpoint and
opens a review task when a course flips to "Needs Review".

## 13 October 2026 (update 2)

### Goal
Fix two issues found during browser testing of the freshness workflow and
tighten the human-in-the-loop design.

### Issues observed
1. Before any check had run, every course showed "Manual Verification Required",
   which wrongly implied a failed check. It should show that no check has
   happened yet.
2. After running "Check official sources now", refreshing the browser lost the
   results and everything reverted to "Not yet checked" (results lived only in
   React state).

### Changes made
- Added a fourth freshness state, `not-checked` → "Not Yet Checked", and made it
  the seeded default. A course now only shows an error state after a check
  actually fails.
- Introduced a clear separation between two kinds of state:
  - automated check RESULTS (what the checker fetched: timestamp, fetched
    fingerprint, reason/error), and
  - HUMAN-APPROVED baselines (a fingerprint a person approved after review).
  These are stored under separate keys and never mixed.
- A freshly fetched page is never auto-verified. Display status is computed by
  comparing the fetched fingerprint against the approved baseline:
  - no check yet → "Not Yet Checked";
  - fetched but no approved baseline → "Needs Review — No verified baseline yet";
  - fetched == approved baseline → "Verified / Source unchanged";
  - fetched != approved baseline → "Needs Review / Possible source change";
  - could not access (CAPTCHA, bot protection, timeout, HTTP 403, network) →
    "Manual Verification Required" with the reason shown (e.g. "HTTP 403
    Forbidden" for Monash/Deakin).
- Added a human review action: "Approve current source as verified baseline".
  This is the ONLY path to a "Verified" status and it changes no course facts.

### Persistence (BETA/DEMO ONLY)
- Check results and approved baselines are persisted in the browser's
  localStorage so they survive a refresh during the demo
  (`src/lib/freshness-storage.ts`). This is explicitly a beta/demo mechanism:
  it is per-browser, user-clearable, and not authoritative. A production
  deployment would use server-side persistent storage (database / durable KV)
  so results and baselines are shared, audited and access-controlled. No
  database or external service was added for the beta.

### Safety / preservation
- No course facts or eligibility rules were changed. All existing Monash C2000,
  RMIT BP162 and Deakin S326 data and the eligibility logic are preserved
  (verified with a whitespace-ignoring diff).

### Verification
- `npm run build` succeeds and lint passes.
- The status decision logic was checked for every branch, including that an
  HTTP 403 surfaces as "HTTP 403 Forbidden" even when the response omits a
  status phrase.

### Files changed
- `src/lib/freshness.ts`, `src/lib/freshness-data.ts`,
  `src/lib/source-check.server.ts`, `src/lib/freshness-check.ts`,
  `src/lib/freshness-storage.ts` (new), `src/routes/results.tsx`.

## 13 October 2026 (update 3)

### Goal
Fix a correctness gap found during review: the freshness system only monitored
one source per course, so a course could show "Verified" even when another
official source it relies on had changed.

### Context
RMIT BP162 cites TWO official sources in the existing course data: the BP162
course page and the RMIT China equivalency table. Monash C2000 and Deakin S326
each cite one. Monitoring only the first source was unsafe.

### Change: multi-source monitoring
- Freshness state is now tracked PER SOURCE, keyed by course id + source URL,
  so every official source in a course's `sources` array is monitored.
- Each source has its own: last source check, fetched fingerprint, human
  -approved baseline, and freshness result.
- Human approval is PER SOURCE. Approving the RMIT course page does not approve
  the China equivalency page; each must be reviewed and approved separately.
- The course-level status is an aggregation of its sources:
  - no sources checked yet            -> "Not Yet Checked";
  - any source could not be accessed  -> "Manual Verification Required";
  - any source changed or lacks an approved baseline -> "Needs Review";
  - a source still unchecked while others are verified -> "Needs Review"
    (a course is not "Verified" until every source is confirmed);
  - every accessible source matches its approved baseline -> "Verified /
    Sources unchanged".
- The Data Freshness UI now lists each official source under its course with its
  own status badge, last-check time, baseline state, per-source "Approve this
  source as verified baseline" button, and a direct link to the source.

### Safety / preservation
- The existing `sources` arrays in the course data remain the authoritative
  list; the monitored-sources list mirrors them exactly. No course facts or
  eligibility rules were changed (verified with a whitespace-ignoring diff).
- The checker still only reads pages and records metadata. It never updates
  admission requirements, IELTS, maths prerequisites or tuition.

### Persistence (BETA/DEMO ONLY)
- Per-source results and per-source approved baselines are persisted in
  localStorage (keys bumped to v2 for the new per-source shape). This remains a
  beta/demo mechanism; production would use server-side storage. No database or
  external service was added.

### Verification
- `npm run build` succeeds and lint passes.
- The aggregation logic was checked for all cases, including that RMIT only
  reaches "Verified" when BOTH sources match their approved baselines, and drops
  to "Manual Verification Required" if either source returns e.g. HTTP 403.

### Files changed
- `src/lib/freshness.ts`, `src/lib/freshness-data.ts`,
  `src/lib/source-check.server.ts`, `src/lib/freshness-check.ts`,
  `src/lib/freshness-storage.ts`, `src/routes/results.tsx`.

## 13 October 2026 (update 4)

### Goal
Complete verified data coverage for Monash C2000 and Deakin S326, while leaving
RMIT BP162 and the freshness architecture untouched.

### Monash C2000
- Expanded freshness coverage by adding a second official source: the Monash
  China Gaokao entry requirements page
  (https://www.monash.edu/admissions/entry-requirements/china-gaokao). This
  source confirms the existing C2000 values (Gaokao 65%, English Level A =
  IELTS 6.5 overall / 6.0 each band, Gaokao or Gao Er Mathematics prerequisite),
  so no requirement values changed.
- Updated the last-verified date to 13 October 2026. Tuition and the existing
  course-page source are unchanged.
- Freshness now monitors BOTH Monash sources independently.

### Deakin S326
- Replaced the intentionally incomplete beta placeholders with verified 2027
  official data:
  - tuition A$43,800/yr (2027);
  - locations Burwood (Melbourne), Waurn Ponds (Geelong) and Online; cities used
    for matching: Melbourne and Geelong;
  - academic: Chinese Gaokao 60% of the provincial maximum;
  - IELTS 6.0 overall with minimum 6.0 in each band;
  - no separate mathematics prerequisite is listed, represented safely as
    requiresMaths: false so maths never fails a Deakin applicant;
  - infoStatus changed from "Needs Verification" to "Verified";
  - last-verified date 13 October 2026.
- Removed the old "not verified" caveat and replaced it with wording that the
  data is based on verified 2027 official Deakin sources and that meeting the
  minimum requirements does not guarantee admission.
- Deakin freshness now monitors TWO official sources independently: the S326
  course page and the Deakin 2027 International Course Guide (PDF).

### Eligibility logic
- Deakin academic: Gaokao ≥ 60% → Appears Met; < 60% → Not Met; invalid/unusable
  score → Needs Verification.
- Deakin IELTS: overall ≥ 6.0 and each band ≥ 6.0 → Appears Met; otherwise Not
  Met.
- Mathematics does not cause a Deakin applicant to fail (no listed prerequisite).
- The "meeting minimum requirements does not guarantee admission" disclaimer is
  retained.

### Freshness / safety
- Source counts now: Monash 2, RMIT 2 (unchanged), Deakin 2.
- Per-source human approval is still required; a freshly fetched page is never
  auto-verified, and the checker never auto-updates any course fact.
- RMIT BP162 data and logic were left exactly as they were (confirmed by diff).

### Verification
- `npm run build` succeeds and lint passes.
- Deakin academic, IELTS and maths logic were checked across representative
  inputs (e.g. 60% met, 59% not met, invalid score needs verification, IELTS 6.0
  met vs 5.5 not met, maths "no" does not fail).

### Files changed
- `src/routes/results.tsx`, `src/lib/freshness-data.ts`.

## 13 October 2026 (update 5)

### Goal
Complete the freshness workflow for official sources that cannot be checked
automatically, by adding a hybrid human-review fallback.

### Why
During real testing, both Monash C2000 official sources and both Deakin S326
official sources returned HTTP 403 Forbidden to the automated checker (bot
protection). RMIT BP162's two sources remained automatically accessible. So the
automated-only model could not reach a confident status for Monash or Deakin,
even though a person can open and review those pages directly.

### What we added
A per-source MANUAL verification fallback that is kept completely separate from
automated monitoring:
- New per-source metadata: `manualVerifiedAt` and `manualVerificationStatus`,
  persisted in localStorage under a separate key (beta/demo mechanism, same as
  the rest of the freshness persistence; production would use server storage).
- For a source that could not be fetched automatically, the UI shows a
  "Mark as manually verified" button. Pressing it records ONLY that a person
  reviewed the official source. It does NOT create a fingerprint baseline, does
  NOT change the automated check result, does NOT claim automated monitoring
  succeeded, and does NOT modify any course fact.
- Each source now displays both facts independently, e.g.:
  - Automated monitoring: "Manual Verification Required — HTTP 403 Forbidden"
  - Human review: "Verified manually on 13 October 2026"
- Sources that ARE automatically accessible (RMIT) keep the existing
  human-approved fingerprint baseline workflow unchanged.

### Course-level wording
- If one or more required sources cannot be monitored automatically but every
  such source has been manually reviewed (and no accessible source needs
  review), the course shows "Manually Verified / Automated Monitoring Limited"
  instead of "Verified / Sources unchanged".
- If an inaccessible source has NOT yet been manually reviewed, the course stays
  "Manual Verification Required".

### Separation / safety
- Automated status and human-review status are stored and displayed separately
  and never merged. Manual verification never upgrades the automated per-source
  result; it only changes the course-level wording.
- RMIT continues to demonstrate the full automated baseline-comparison workflow.
- No course data or eligibility logic was changed; all existing source URLs are
  preserved (confirmed by inspection: Monash 58940, RMIT 45120 with regional
  caveat, Deakin 43800, and their requiresMaths/IELTS values are intact).

### Verification
- `npm run build` succeeds and lint passes.
- The course-level aggregation was checked for all hybrid cases, including both
  Monash/Deakin sources 403 + unreviewed (Manual Verification Required), both
  reviewed (Manually Verified / Automated Monitoring Limited), and RMIT both
  automatically verified (Verified / Sources unchanged).

### Files changed
- `src/lib/freshness.ts`, `src/lib/freshness-storage.ts`, `src/routes/results.tsx`.
