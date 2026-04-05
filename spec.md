# Tuition Skill

## Current State
- StudentReportAI.tsx: Teachers can generate AI reports with grades/comments. Reports stored in studentReportStorage.ts. Both teachers (via StudentReportAI), parents (ParentDashboard), and students (StudentDashboard) can VIEW reports. All roles can Print. No editing, no teacher signature, no send workflow.
- studentReportStorage.ts: StudentReport type has id, studentUsername, studentName, teacherName, generatedAt, termLabel, entries[], overallSummary. No signature, edit, sent, or sendAt fields.
- ParentDashboard.tsx: Shows student reports in a list, can View in dialog. Has a Print button accessible to parent.
- StudentDashboard.tsx: Presumably shows reports but NO print button (per current inspection).
- LandingPage.tsx + index.css: Functional but generic-looking UI. Uses Nunito font, OKLCH color system, shifting background. Role cards are basic. No advanced visual hierarchy, animations, or premium polish.

## Requested Changes (Diff)

### Add
- StudentReport type: add `teacherSignature?: string`, `sent?: boolean`, `sentAt?: number`, `editedAt?: number` fields
- studentReportStorage.ts: `updateStudentReport(report)` function to update by id
- StudentReportAI.tsx: Edit mode for generated/past reports (edit termLabel, overall summary, per-subject aiComment); teacher signature pad (canvas-based draw) or typed signature option; "Send to Student" button (sets sent=true, sentAt=Date.now()); reports show sent/unsent badge
- ParentDashboard.tsx: Only show reports that have `sent === true`; add Print button (only parent role has it)
- StudentDashboard.tsx: Only show reports that have `sent === true`; remove any print button (print is parent-only)
- LandingPage.tsx: Major visual enhancement — premium hero with animated gradient badge, floating cards, stats bar, trust indicators, improved role cards with hover effects, improved footer
- index.css: Enhanced animations, glass morphism effects, premium card styles, improved transitions
- TeacherDashboard.tsx: No report print button (print is parent-only)

### Modify
- studentReportStorage.ts: Extend StudentReport type with new fields
- StudentReportAI.tsx: Add edit UI, signature pad, send button, sent badge
- ParentDashboard.tsx: Filter to sent-only reports, add Print button, remove any existing teacher print access
- StudentDashboard.tsx: Filter to sent-only reports, ensure no print button
- LandingPage.tsx: Premium redesign — enhanced hero, animated elements, feature highlights, stats section
- index.css: New animation keyframes, glass card styles, premium hover effects

### Remove
- Print button from teacher's StudentReportAI view (teacher can see report but cannot print — only parent can)
- Print button from student dashboard report view (if present)

## Implementation Plan
1. Update `studentReportStorage.ts`: extend type with signature/sent/sentAt/editedAt, add updateStudentReport()
2. Rewrite `StudentReportAI.tsx`: add inline edit of report fields (subject comments, overall summary, term label), canvas signature pad + typed signature toggle, Send button (marks sent=true), sent/draft badge on past reports list, remove print button from teacher view
3. Update `ParentDashboard.tsx`: filter reports to sent===true only, add Print button inside report dialog (parent-only)
4. Update `StudentDashboard.tsx`: filter reports to sent===true only, ensure no print button
5. Enhance `LandingPage.tsx`: premium hero design, animated trust badge, stats row, improved role cards, better feature icons, animated CTA
6. Enhance `index.css`: new premium animations (fade-in-up, float), glass-card utility, improved card-lift, trust-badge style
