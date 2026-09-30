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