# TuitionsApp

## Current State
Student registration (`StudentRegister.tsx`) and verification code generation (`StudentDashboard.tsx`) save data only to `localStorage`. Parent linking (`ParentLinkStudent.tsx`) reads only from `localStorage`. Since `localStorage` is browser/device-specific, a parent on a different device cannot find a student who registered on a different device.

The backend (`main.mo`) already has `registerStudent` but it is never called by the frontend. There are no backend endpoints for verification codes or public student lookup.

## Requested Changes (Diff)

### Add
- Backend: `setVerificationCode(username, code)` public func
- Backend: `checkVerificationCode(username, code)` public query
- Backend: `getStudentPublicByUsername(username)` public query returning `?(Text, Text)` (username, name)
- Backend: stable storage for verification codes
- Frontend: after student registration saves to localStorage, also call `backend.registerStudent()` to persist in canister
- Frontend: after verification code is created in localStorage, also call `backend.setVerificationCode()` to persist in canister
- Frontend: parent linking falls back to backend query if student not found in localStorage

### Modify
- `main.mo`: add verification codes stable var and three new public functions
- `StudentRegister.tsx`: call backend `registerStudent` after local save
- `StudentDashboard.tsx`: call backend `setVerificationCode` after local code creation
- `ParentLinkStudent.tsx`: if student not in localStorage, query backend; verify code via backend

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo` with verification code storage and public lookup functions
2. Update `StudentRegister.tsx` to also register in backend
3. Update `StudentDashboard.tsx` to also sync verification code to backend
4. Update `ParentLinkStudent.tsx` to query backend when local lookup fails and verify code via backend
