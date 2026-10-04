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