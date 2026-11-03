# CourseCompass AU – Build Diary

> **Diary integrity note (added for final A3 submission):** This diary was kept across the semester. The final A3 instructions ask for AI tool/model and prompt evidence. Where the exact wording of an earlier prompt was not retained, the entry below is explicitly labelled **paraphrased prompt intent** rather than reconstructed as a verbatim quote. Where an AI platform did not expose, or the diary did not retain, the underlying model name, that is stated honestly instead of inventing one.

## Week 6 – 31 August to 4 September 2026

### AI tool / model and prompt record
No CourseCompass product build was carried out this week. The team was learning the unit's AI build-lane framework and AI-assisted development approach. No product prompt or underlying model was recorded for this exploratory week.

### What was dropped / what we would do differently
The bakery forecasting proposal was deliberately not carried forward as the group project. In hindsight, we would begin recording tool/model and prompt evidence from the first exploratory week, even before the final project is selected.

### Exploring AI build lanes and development tools

At this stage, the group had not yet combined and compared all four members' A1 proposals, so the final group project had not been selected.

To learn the Week 6 build-lane framework, we used one member's existing A1 proposal as a working example: an AI-based demand forecasting system for independent bakeries.

That proposal focused on a structured prediction problem using historical POS sales, weather, holidays and other tabular inputs to forecast bakery demand. This helped us understand why different business problems suit different AI approaches and why a structured forecasting problem is better matched to predictive or classical machine-learning methods than to a foundation model.

Week 6 was therefore primarily an exploration and learning stage rather than final MVP development.

The team also began learning the AI-assisted development tools introduced in the unit and became familiar with the idea of using tools such as Lovable to rapidly build and iterate a working MVP.

### Human judgement

We did not treat the bakery forecasting proposal as the final group project simply because it was available first.

The purpose of using it in Week 6 was to understand the AI build lanes and the available AI-building workflow before the team compared all four A1 proposals.

## Week 7 – 7 to 11 September 2026

### AI tool / model and prompt record
No AI-generated CourseCompass build was produced in this entry. The work was a human comparison of the four A1 proposals and a scope decision. No product prompt/model was recorded.

### What was dropped / what we would do differently
Three A1 proposals were not selected after the comparison. The team chose CourseCompass AU because it offered a clearer testable workflow and verifiable data. We would document the proposal comparison criteria in a reusable decision table earlier if repeating the process.

### Comparing the four A1 proposals

The four group members compared their individual A1 project ideas before selecting the final group direction.

The comparison considered:

- the business problem and user value;
- fit between the problem and AI;
- feasibility of building a working MVP within the semester;
- availability and verifiability of data;
- the ability to demonstrate the system clearly in testing and presentation;
- the risk of over-scoping the project.

### Final project selection

After comparing and discussing the four proposals, the team selected CourseCompass AU as the group project.

CourseCompass AU was defined as a decision-support MVP for Chinese high-school students researching Australian undergraduate courses.

The team deliberately narrowed the initial scope rather than attempting to cover a large number of universities and study areas.

The early MVP direction focused on:

- a student profile;
- course matching;
- eligibility checks based on published requirements;
- explainable results;
- official university sources;
- a small, manageable verified dataset.

This decision established the direction that was later developed into the working CourseCompass AU MVP.

## Week 8 – 14 to 18 September 2026

### AI tool / model and prompt record
This entry records the team's Responsible AI risk review rather than an AI coding interaction. No build prompt/model was used or retained for this risk-review activity.

### What was dropped / what we would do differently
We deliberately dropped the idea of broad, automated admission prediction and kept the MVP as decision support. If repeating the project, we would turn the risk review into explicit acceptance tests before the first beta so some later safeguards could be tested earlier.

### Responsible AI risk review

During Week 8, the team used the Responsible AI and MVP risk-review framework from class to examine CourseCompass AU before expanding development.

The review focused on the business case, intended users, expected benefit, important AI-related risks, possible safeguards and the residual risks that would remain even after controls were introduced.

### Main risks identified

The main risks identified for CourseCompass AU were:

1. Outdated or incorrect university information

- University entry requirements, fees and course information can change.
- Incorrect or outdated data could mislead a student.

2. Overconfident or misleading eligibility conclusions

- A user could incorrectly interpret a course recommendation or eligibility result as a guarantee of admission.

3. Over-reliance on AI or automated outputs

- If AI-generated content or automated checking is inaccurate, users may still trust it unless uncertainty and human oversight are made visible.

### Planned safeguards

Based on the Week 8 risk review, the team established several design principles for the MVP:

- use official university sources wherever possible;
- avoid predicting admission probability;
- use conservative statuses such as "Needs Verification" when information cannot be confidently confirmed;
- explain why requirements appear to be met or not met;
- retain human review for uncertain or higher-risk information;
- test and monitor the system before wider deployment;
- keep the MVP dataset deliberately small and verified rather than claiming unsupported coverage.

### Human judgement

The team concluded that the MVP should proceed only with safeguards, limited scope and further testing.

At this stage, the later data-freshness monitoring system had NOT yet been implemented. However, the Week 8 risk review established the principles that later influenced the freshness monitoring, manual verification and human-in-the-loop safeguards added during later development.

This ensured that CourseCompass AU was developed as a decision-support tool rather than an automated admissions decision-maker.

## 29 September 2026

### AI tool / model
Lovable. The specific underlying model was not exposed or retained in the build log.

### Prompt that mattered
**Paraphrased prompt intent:** Build a first beta of CourseCompass AU for Chinese high-school students applying to Australian undergraduate courses, with a student profile, course matching, published-requirement eligibility checks, explanations and official-source links.

### What came back
Lovable produced the first working interface and flow. The output was useful as a fast prototype, but it also introduced unsupported marketing claims that required human review.

### What broke / was dropped / what we would do differently
The claims “120+ Courses” and “100% Source-linked” were dropped because they were not supported by the verified dataset. If repeating this prompt, we would state the verified scope and prohibit unsupported numeric claims in the first instruction.

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

### AI tool / model and prompt record
No AI tool was used to generate the Beta Lab feedback itself; this entry records human testing/teaching feedback and the team's response. Prompt: not applicable.

### What broke / was dropped / what we would do differently
The assumption that manually collected course information was sufficient was dropped. If restarting, source freshness would be treated as a first-class requirement earlier rather than added after the beta discussion.

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

### AI tool / model
Kiro was used for AI-assisted implementation. The exact underlying Kiro model was not retained in the diary.

### Prompt that mattered
**Paraphrased prompt intent:** Add a source-freshness system that is separate from eligibility. Check official university sources safely, compare fetched content with a human-approved baseline, never auto-edit verified course facts, and return a visible manual-verification state when a source cannot be accessed.

### What came back
The AI-assisted implementation proposed the freshness modules, server-side source checker and UI states. Human review constrained the design so detected changes could only trigger review, never modify course data.

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

### AI tool / model
Kiro (exact underlying model not retained).

### Prompt that mattered
**Paraphrased prompt intent:** Fix two browser-test failures: show “Not Yet Checked” before the first source check, and persist check results across refresh while keeping automated results and human-approved baselines separate. Do not auto-verify a fresh fetch.

### What broke / was dropped / what we would do differently
The original design incorrectly showed a failure before any check and lost state on refresh. Those behaviours were dropped. If repeating the design, we would model “not checked”, “checked”, and “human approved” as separate states from the start.

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

### AI tool / model
Kiro (exact underlying model not retained).

### Prompt that mattered
**Paraphrased prompt intent:** Monitor every official source used by each course, not only the first URL. Track results and human approval per source, and only show a course as verified when all required sources are confirmed.

### What broke / was dropped / what we would do differently
The one-source-per-course approach was dropped because it could falsely show “Verified” while another official source had changed. Multi-source monitoring became the safer design.

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

### AI tool / model
Kiro supported implementation and checking; the exact underlying model was not retained. Official university sources remained the authority for factual values.

### Prompt that mattered
**Paraphrased prompt intent:** Complete Monash and Deakin verified data coverage using the already identified official sources, preserve RMIT behaviour, and implement only rules directly supported by the verified requirements.

### What broke / was dropped / what we would do differently
The incomplete Deakin placeholders were dropped after official verification. We would verify every planned course before exposing it in the first public beta if time allowed.

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
- The verified Deakin English requirement was IELTS overall ≥ 6.0 with each band
  ≥ 6.0. At this stage, however, the beta form still collected only an overall IELTS
  score, so component-level Listening, Reading, Writing and Speaking checks were
  not yet implemented. This remained a known limitation for later validation.
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
- Deakin academic and mathematics logic were checked across representative inputs
  (e.g. 60% met, 59% not met, invalid score needs verification, and maths "no"
  does not fail).
- The overall IELTS check was tested at 6.0 versus 5.5. Component-level band
  validation was not yet implemented in the beta form at this stage.

### Files changed
- `src/routes/results.tsx`, `src/lib/freshness-data.ts`.

## 13 October 2026 (update 5)

### AI tool / model
Kiro (exact underlying model not retained).

### Prompt that mattered
**Paraphrased prompt intent:** Add a manual human-review fallback for sources that return HTTP 403 or otherwise block automation. Keep manual verification separate from automated status and never create a fake automated baseline from manual review.

### What broke / was dropped / what we would do differently
An automated-only freshness workflow was dropped because Monash and Deakin blocked the checker. If rebuilding, the hybrid automated/manual path would be designed from the start rather than added after live source testing.

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

## 14 October 2026

### AI tool / model
Kiro-assisted troubleshooting plus local npm/TypeScript diagnostics in VS Code. The exact Kiro model was not retained.

### Prompt that mattered
**Paraphrased prompt intent:** Resolve the Vercel dependency-security block with the minimum compatible package upgrades, fix resulting version/type conflicts, and preserve course data, eligibility and freshness behaviour.

### What broke / was dropped / what we would do differently
The first Vercel deployment failed because of dependency security/version conflicts. We avoided a broad dependency rewrite and used the minimum compatible upgrade. Future work should check deployment dependencies earlier, not only at final deployment.

### Vercel deployment: dependency security fix
- The first attempt to deploy CourseCompass AU to Vercel was blocked because the
  installed TanStack React Start / Start Server Core versions were flagged for a
  dependency security issue.
- We chose the minimum compatible patched upgrade rather than changing any
  application behaviour: `@tanstack/react-start` 1.168.32 → 1.168.61, which
  brings `@tanstack/start-server-core` up to 1.169.40.
- The upgrade exposed a `@tanstack/router-core` version mismatch (an old 1.171.15
  copy alongside the required 1.171.35), which caused missing-export build
  errors. We resolved it by aligning the related versions: `@tanstack/react
  -router` → 1.170.42 and `@tanstack/router-plugin` → 1.168.43, leaving a single
  router-core.
- `npm run build` and `npx tsc --noEmit` now pass. One small, behaviour
  -preserving compatibility fix was needed in `__root.tsx` (the router now types
  the error boundary's `error` as `unknown`), plus a tsconfig-friendly bracket
  access in `vite.config.ts`.
- Course data, eligibility logic, freshness logic and manual-verification
  behaviour were NOT changed.
- At this stage, the final result still needed to be verified by a successful
  live Vercel deployment.

## 14 October 2026 – Successful Production Deployment and Live Verification

### AI tool / model and prompt record
No new AI-generated feature was required for this entry. This was manual production verification of the deployed build after the AI-assisted dependency fixes. Prompt: not applicable.

### What broke / was dropped / what we would do differently
Production testing confirmed that automated source access is not universal. We retained the manual fallback rather than trying to bypass website protections.

- CourseCompass AU was successfully deployed to Vercel Production.
- The public production website became accessible through the Vercel URL.
- The main course-matching workflow was tested successfully in the production
  environment.
- "Check official sources now" successfully ran server-side in the Vercel
  deployment.
- RMIT's two official sources were automatically accessible and could complete
  the approved-baseline workflow.
- Monash and Deakin official sources returned HTTP 403 to automated checks
  because of access/bot restrictions.
- The system correctly showed "Manual Verification Required" instead of falsely
  claiming success.
- After human review, Monash and Deakin displayed "Manually Verified / Automated
  Monitoring Limited".
- RMIT displayed "Verified / Sources unchanged" after both sources were
  approved.
- Refresh persistence was confirmed using the beta/demo localStorage mechanism.
- No course facts or eligibility thresholds were automatically changed by the
  freshness system.

## 18 October 2026 – Final MVP Validation and Regression Testing

### AI tool / model
Kiro-assisted code refinement was used alongside manual browser regression testing; the exact underlying Kiro model was not retained.

### Prompt that mattered
**Paraphrased prompt intent:** Test contrasting profiles and confirm that Preferred Field, Preferred City and budget affect the results correctly. Apply minimal fixes only where behaviour is wrong, without inventing new course data or changing verified thresholds.

### What broke / was dropped / what we would do differently
Unsupported fields and incorrect city filtering were found. The broader field selector was dropped and city filtering was corrected. Future regression plans should include deliberately contrasting profiles earlier because they exposed logic that happy-path testing missed.

This was internal regression testing conducted by the development team, not
external user testing.

### Preferred Field scope validation
- Testing found that unsupported study fields could previously be selected even
  though the verified dataset only contained Information Technology courses, so
  offering those fields could imply coverage we do not have.
- The MVP scope was refined so Preferred Field is now limited to Information
  Technology (a minimal change in `src/routes/index.tsx`), and the preferred
  -field filtering logic in `src/routes/results.tsx` was corrected so a non-IT
  field returns a transparent empty state rather than the IT courses.
- The interface clearly states: "Current MVP coverage: Information Technology
  only."
- This was a deliberate human design decision to avoid implying unsupported
  coverage. We did NOT fabricate Business or other course data.

### Preferred City validation
- Testing found that the selected city was previously displayed in the student
  profile but was not actually applied to course filtering.
- Adelaide incorrectly returned Melbourne-based courses.
- City filtering was corrected (a minimal change in `src/routes/results.tsx`).
- Melbourne returns Monash, RMIT and Deakin.
- Geelong returns Deakin only.
- Adelaide and Sydney return no local verified courses and show a clear empty
  state, with the student's profile still visible.
- No fake courses were added for unsupported locations.

### Budget validation
- A profile with an annual budget under A$30,000 was tested.
- All three current courses have tuition above this budget.
- The system correctly kept the courses visible but labelled them "Above stated
  budget."
- Budget remains an affordability indicator, not an admission eligibility
  criterion.
- No code change was required for this logic.

### Lower-entry-profile regression test
Test profile:
- Academic score: 60
- IELTS: 6.0
- Maths: No
- Field: Information Technology
- City: Melbourne
- Budget: A$45,000–60,000

Results:
- Monash: Requirement Not Met
- RMIT: Requirement Not Met, with academic verification caveat
- Deakin: Appears Eligible Based on Published Requirements

This confirmed that different published requirements produce different outcomes.

### High-condition-profile regression test
Test profile:
- Academic score: 80
- IELTS: 6.5
- Maths: Yes
- Field: Information Technology
- City: Melbourne
- Budget: A$60,000+

Results:
- Monash: Appears Eligible Based on Published Requirements
- RMIT: academic requirement still remains subject to regional equivalency
  verification rather than being automatically treated as confirmed
- Deakin: Appears Eligible Based on Published Requirements
- All three courses were within the stated budget

This confirmed that the system does not convert uncertain information into a
confident eligibility decision simply because the applicant has a stronger
profile.

### Validation conclusion
- Final regression testing covered field scope, city filtering, unsupported
  locations, affordability, lower-condition and higher-condition profiles.
- The main issues discovered during testing were preferred-field scope and city
  filtering.
- Both were corrected and re-tested.
- Existing verified course facts, academic thresholds, IELTS logic, mathematics
  logic, freshness monitoring and manual-verification workflows were not changed.

## 2 November 2026 – Final Beta Lab Feedback Review

### AI tool / model
ChatGPT was used as the AI-assisted development and review tool because Kiro organisation access was unavailable. The exact ChatGPT model name was not recorded in the original diary entry, so no model name is reconstructed here.

### Prompt that mattered
**Paraphrased prompt intent:** Implement the final Beta Lab correctness changes without altering verified course facts: add IELTS Overall plus Listening, Reading, Writing and Speaking; return “Requirement Not Met” when any required component is below the minimum, “Needs Verification” when a component is missing; remove Career Interest because it is unused; expose Geelong because existing Deakin logic already supports it; preserve the freshness workflow.

### What came back
The AI-assisted patch added the component-score inputs and shared eligibility logic, removed the unused field, exposed Geelong and added a regression script. The changes were manually integrated, built, type-checked, tested and then pushed to GitHub/Vercel.

### What broke / was dropped / what we would do differently
Kiro access itself became a tool constraint, so the workflow switched to ChatGPT rather than delaying the build. The unused Career Interest field was dropped. If repeating the project, the team would keep a tool-independent local workflow and record model/prompt metadata at the time of each AI interaction.

On 2 November 2026, we reviewed the consolidated Beta Lab feedback prepared from peer reviews originally received on 7 October 2026. The four reviews were from G14 reviewers Jinyang Li, Yiyao Ma and Darrel Darmawan, and G13 reviewer Anike Mparuri.

The feedback identified several important issues: Preferred Study Field and Preferred City were not affecting recommendations correctly; the dataset was limited; the IELTS check used only an overall score; inputs were cleared when returning to the profile page; and reviewers suggested broader coverage and side-by-side comparison.

We assessed the Field and City issues as high priority because they directly affected recommendation relevance. These had already been corrected during later regression testing. We kept the limited dataset as a deliberate scope decision because every additional course would require careful verification, while profile persistence and side-by-side comparison remain lower-priority usability improvements.

The IELTS component-score issue was assessed as an important correctness problem. We implemented separate IELTS Overall, Listening, Reading, Writing and Speaking inputs and changed the English eligibility logic so both the overall score and all four components are checked against each course's published requirement. Missing component scores now produce "Needs Verification", while a component below the minimum produces "Requirement Not Met" even if the overall score passes.

Career Interest was removed from the active profile because it was not used by verified matching or eligibility logic. During the same review, we found that Geelong was supported by the existing Deakin location logic but was missing from the city dropdown, so Geelong was added as a selectable city without adding any new course data.

Regression checks confirmed that: (1) overall 6.5 with Writing 5.5 fails the English requirement for Monash, RMIT and Deakin; (2) overall 6.5 with all components at 6.0 passes all three English checks; (3) overall 6.0 with all components at 6.0 fails Monash and RMIT but passes Deakin; and (4) missing component scores produce "Needs Verification". The regression test script, TypeScript check and production build all passed in the original Mac development environment.

The final changes were committed as `Address final A3 beta validation feedback` and pushed to the `main` branch. Vercel automatically created a new production deployment and reported `Ready`. The live application was then re-verified: the profile showed IELTS Overall plus Listening, Reading, Writing and Speaking; Career Interest was removed; Geelong was available as a city; and a live profile with Overall 6.5, Listening 6.0, Reading 6.0, Writing 5.5 and Speaking 6.0 correctly returned "Requirement Not Met" for the English requirement.

ChatGPT was used as the AI-assisted development tool to support implementation and review of these final changes after Kiro access was unavailable. The updated files were then manually integrated into the existing project in VS Code, and the team ran the regression tests, TypeScript check and production build before committing and pushing the changes to GitHub and verifying the Vercel deployment. Human judgement was used to assess the feedback, preserve verified course data and decide which changes were appropriate for the MVP scope.


## Final AI Tool-Switching Summary

- **Lovable → Kiro:** Lovable was effective for rapidly producing the first working beta, but later work required more direct control over the GitHub codebase, testing and implementation details, so the project moved into Kiro for continued AI-assisted development.
- **Kiro → ChatGPT (2 November):** Kiro organisation access was unavailable near final submission. Rather than delay the correctness fixes, ChatGPT was used to support the final patch. The patch was manually integrated and verified locally before GitHub/Vercel deployment.
- **Model-name limitation:** the underlying model names used by Lovable and Kiro, and the exact ChatGPT model used in the historical interaction, were not retained in the contemporaneous build log. We therefore declare the tools accurately and do not invent model names retrospectively.
