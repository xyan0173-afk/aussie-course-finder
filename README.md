# CourseCompass AU

CourseCompass AU is a decision-support MVP for Chinese high-school students researching Australian undergraduate Information Technology courses.

## Core feature

CourseCompass AU compares a student profile with verified published course requirements and returns a source-backed shortlist with transparent eligibility, affordability, and data-freshness statuses.

## Live MVP

https://aussie-course-finder-seven.vercel.app

No login is required. Do not enter real personal data; the MVP is designed for simulated student profiles.

## How to try it

1. Open the live MVP.
2. Enter a simulated student profile. For example:
   - Academic score: `80`
   - IELTS Overall: `6.0`
   - IELTS Listening: `6.0`
   - IELTS Reading: `6.0`
   - IELTS Writing: `6.0`
   - IELTS Speaking: `6.0`
   - Mathematics completed: `Yes`
   - Preferred Field: `Information Technology`
   - Preferred City: `Melbourne`
   - Annual Budget: `A$60,000+`
3. Select **Find My Courses**.
4. Review the Monash, RMIT, and Deakin results, including requirement-level statuses, explanations, affordability, and official-source links.
5. Scroll to **Data Freshness** and select **Check official sources now**.
   - RMIT sources can demonstrate the automated source-check/baseline workflow.
   - Monash and Deakin may return HTTP 403 because their sites restrict automated access; the MVP shows **Manual Verification Required** rather than claiming success.

A useful correctness test is IELTS Overall `6.5` with Listening `6.0`, Reading `6.0`, Writing `5.5`, and Speaking `6.0`. The English requirement should return **Requirement Not Met** because the Writing component is below the published minimum.

## Scope and decision logic

The final MVP intentionally covers a small verified Information Technology dataset only:

- Monash University — Bachelor of Information Technology (C2000)
- RMIT University — Bachelor of Information Technology (BP162)
- Deakin University — Bachelor of Information Technology (S326)

Eligibility is deterministic and based on verified published academic, IELTS, and mathematics requirements. CourseCompass AU does **not** predict admission probability and does not guarantee admission. Uncertain requirements remain **Needs Verification**.

Budget is an affordability indicator and does not change academic eligibility.

## AI use

AI was central to the build process:

- **Lovable** — first working beta and interface generation.
- **Kiro** — AI-assisted code refinement, freshness workflow implementation, debugging, and deployment troubleshooting.
- **ChatGPT** — final review and implementation support for the IELTS component-score changes after Kiro organisation access became unavailable.

The exact underlying model names used in the historical Lovable/Kiro interactions were not retained, so they are not reconstructed. The final live eligibility workflow itself uses deterministic rules rather than asking a generative model to decide admission eligibility.

GitHub was used for version control and Vercel for production deployment.

## Data freshness and human review

The freshness checker is separate from eligibility logic. It can compare accessible official sources with human-approved fingerprints, but it never automatically changes verified course facts. If a source cannot be accessed automatically, the MVP surfaces that limitation and supports manual human verification.

Freshness check results and approved baselines are stored in browser `localStorage` for the beta/demo. A production version should move these records to durable, auditable server-side storage.

## Local development

Requirements:

- Node.js
- npm

From the project folder:

```sh
npm install
npm run dev
```

Open the local URL shown by Vite.

Useful verification commands:

```sh
npm run test:regression
npx tsc --noEmit
npm run build
```

The regression script checks the final IELTS component logic, including component failure and missing-component cases.

## Important limitations

- Coverage is limited to selected verified IT courses from Monash, RMIT, and Deakin.
- RMIT academic equivalency may require regional verification.
- Some official university sites block automated source checks.
- Freshness persistence uses browser `localStorage` in the beta.
- Profile persistence and side-by-side comparison remain future improvements.

See `DIARY.md` for the full build journey, AI tool changes, prompt evidence, testing, dead ends, and design decisions.
