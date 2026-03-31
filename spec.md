# Tuition Skill

## Current State
- Admin Parents tab shows only parents who have used the support chat (directChats), so parents who registered but never opened support chat are invisible.
- Parent-student linking supports only one linked student per parent; no switcher.
- Classes have announcements and class codes but no class-wide chat.
- No roll call feature for teachers or roll review for admin.

## Requested Changes (Diff)

### Add
- `parentProfileStorage.ts`: registry that saves a parent profile (principal, name, joinedAt) on every parent login; admin reads this registry.
- Admin Parents tab: show all registered parents from the new registry (not just support-chat parents), with ban/unban/delete actions.
- Multi-student linking: `getParentLinks`, `saveParentLink`, `removeParentLink` support an array of linked students per principal. Parent can add additional students from their dashboard. A switcher dropdown lets them pick the active student.
- Class chat: new `classChatStorage.ts` with send/receive messages per class. StudentDashboard shows a "Class Chat" card per enrolled class. TeacherDashboard shows class chat inline on each expanded class card. All messages stored under key `class_chat_{classId}`.
- Roll call: `rollCallStorage.ts` stores roll submissions per class with timestamp, teacher, and per-student present/absent status. TeacherDashboard has a "Take Roll Call" button on each class card; teacher marks each student then submits. AdminDashboard gets a new "Roll Calls" tab showing all submitted rolls.

### Modify
- `App.tsx`: when a parent logs in (`onParentLoggedIn`), save their profile to the registry. Change `linkedStudentUsername`/`linkedStudentName` state to arrays; pass active student + full list to ParentDashboard.
- `ParentDashboard.tsx`: add an "Add Another Student" button that opens the linking form inline. Add a student switcher at the top when multiple students are linked.
- `AdminDashboard.tsx`: replace directChats-based Parents tab with registry-based list; add Roll Calls tab.
- `classStorage.ts`: no changes (backward compatible).

### Remove
- Nothing removed.

## Implementation Plan
1. Create `parentProfileStorage.ts` with save/get functions.
2. Create `classChatStorage.ts` with send/get/clear functions.
3. Create `rollCallStorage.ts` with submit/get functions.
4. Update `studentStorage.ts`: change `saveParentLink` to support array of links; add `getParentLinks`, `getParentLinkNames`, `removeParentLink`.
5. Update `App.tsx`: save parent profile on login; manage multi-student state.
6. Update `ParentLinkStudent.tsx`: accept optional `onLinkedAdditional` mode.
7. Update `ParentDashboard.tsx`: student switcher + add student button.
8. Update `TeacherDashboard.tsx`: class chat section + roll call section.
9. Update `StudentDashboard.tsx`: class chat section per class.
10. Update `AdminDashboard.tsx`: Parents tab from registry + Roll Calls tab.
