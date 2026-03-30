# TuitionsApp

## Current State
- Logo: Sparkles icon in a small rounded box + "TuitionsApp" text in LandingPage.tsx and DashboardNav.tsx.
- Teacher-Parent: Parents see read-only student-teacher chat. No private teacher-parent channel exists.
- Admin: Cannot see teacher-parent direct messages (they don't exist yet).

## Requested Changes (Diff)

### Add
- TpChatMessage type + storage in supportStorage.ts (key: tuitions_tp_chat). Channel key = tp:teacherName:parentPrincipal. Helpers: getTpMessages(channel), sendTpMessage(channel, senderRole, senderName, text), getAllTpChats().
- Parent Messages section in TeacherDashboard.tsx: list parents from bookings, click to open direct chat.
- Message Teacher button in ParentDashboard.tsx: opens direct chat inline per booking.
- Parent-Teacher Chats tab in AdminDashboard.tsx: read-only view of all tp channels.

### Modify
- Logo in LandingPage.tsx and DashboardNav.tsx: replace Sparkles-in-box with a premium inline SVG mark (graduation cap with spark) + TuitionsApp wordmark.

### Remove
- Nothing.

## Implementation Plan
1. Add TpChatMessage type + helpers to supportStorage.ts.
2. Redesign logo in LandingPage.tsx (navy version) and DashboardNav.tsx (white version).
3. Add Parent Messages section in TeacherDashboard.tsx.
4. Add Message Teacher button + inline chat in ParentDashboard.tsx.
5. Add Parent-Teacher Chats tab in AdminDashboard.tsx.
6. Validate build.
