# Tuition Skill

## Current State
- TeacherDashboard.tsx: Has roll call feature (openRollCall/submitRoll). After submitRollCallStorage is called, the roll call dialog closes with a toast but the teacher cannot review the submitted roll data inline.
- rollCallStorage.ts: getRollCallsForClass(classId) already exists and returns all roll calls for a class.
- No Student Reports AI exists.
- No Term End / Holiday scheduling feature exists.
- assignmentStorage.ts: Grade type has studentName, grade, feedback, subject, teacherName fields.
- ParentDashboard.tsx: Shows grades for linked student.
- StudentDashboard.tsx: Shows grades for logged-in student.

## Requested Changes (Diff)

### Add
1. **Roll Call Review (Teacher)**: After submitting, teacher can see a collapsible "Previous Roll Calls" section inside each class card showing the submitted roll(s) — date, present/absent counts, and per-student status.
2. **Student Reports AI**: New component `StudentReportAI.tsx`. Teacher-only AI that generates a printable grade report for a selected student. Report includes student name, teacher name, subject grades, AI-generated comments per subject, overall summary, and print button. The report is saved to localStorage so the parent and student can view it in their respective dashboards.
3. **Term End Scheduler**: New component `TermScheduler.tsx`. Teacher can set a term end date and holiday periods (start+end date + label). Stored in localStorage. Students and parents can view the upcoming term end and holidays in a read-only panel on their dashboards.

### Modify
- `TeacherDashboard.tsx`: Add roll call history view per class card; add Student Reports AI button/panel; add Term Scheduler section.
- `StudentDashboard.tsx`: Add read-only Term & Holiday panel.
- `ParentDashboard.tsx`: Add read-only Term & Holiday panel and Student Report view button.
- `rollCallStorage.ts`: No changes needed (getRollCallsForClass already exists).

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/utils/termStorage.ts` — CRUD for term end date and holidays, keyed per teacher.
2. Create `src/frontend/src/utils/studentReportStorage.ts` — save/get generated student reports.
3. Create `src/frontend/src/components/StudentReportAI.tsx` — teacher-facing AI report generator with print support.
4. Create `src/frontend/src/components/TermScheduler.tsx` — teacher-facing term/holiday scheduler.
5. Modify `TeacherDashboard.tsx`:
   - In each class card, after submitRoll, show a "View Roll Calls" toggle that lists past rolls.
   - Add Student Reports AI button (opens StudentReportAI panel).
   - Add Term Scheduler section.
6. Modify `StudentDashboard.tsx`: Add Term & Holidays read-only panel.
7. Modify `ParentDashboard.tsx`: Add Term & Holidays read-only panel + button to view student reports.
