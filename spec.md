# Tuition Skill — Dashboard Colour Customisation

## Current State
- Student, Teacher, and Parent dashboards each have a fixed header gradient defined by CSS classes: `dashboard-header-student`, `dashboard-header-teacher`, `dashboard-header-parent`.
- The Admin dashboard has its own plain `bg-card` header with no gradient.
- No mechanism exists for users to change their dashboard colours.
- The `DashboardNav` component accepts a `headerClass` prop to set the header gradient.

## Requested Changes (Diff)

### Add
- A colour customisation panel accessible from a palette icon button in each dashboard header (Student, Teacher, Parent, Admin).
- A `DashboardColorPicker` component that renders a panel with:
  - A set of 6–8 curated colour presets per role (visually labelled swatches).
  - A "custom" option with two colour pickers (gradient start and end) for freeform choice.
  - A "Reset to default" button.
  - A live preview of the selected gradient in the panel header.
- A `useDashboardColor` hook that:
  - Stores the chosen gradient in `localStorage` keyed by role (`dashboard-color-student`, `dashboard-color-teacher`, `dashboard-color-parent`, `dashboard-color-admin`).
  - Returns the active gradient string and a setter.
- The `DashboardNav` component gains a palette button (top-right, next to logout) that opens the colour picker panel.
- The header's `style` prop is used to override the CSS class gradient when a custom colour is stored.
- Admin dashboard header is also updated to support colour customisation.

### Modify
- `DashboardNav.tsx` — add optional `onCustomizeColor` callback prop and palette icon button.
- `StudentDashboard.tsx` — use `useDashboardColor` hook, pass gradient style and callback to `DashboardNav`.
- `TeacherDashboard.tsx` — same as student.
- `ParentDashboard.tsx` — same, also apply gradient to the sub-header bar (action row).
- `AdminDashboard.tsx` — apply colour customisation to the admin header (palette button in header).

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/utils/dashboardColorStorage.ts` — `useDashboardColor(role)` hook, save/load from localStorage, default gradient per role.
2. Create `src/frontend/src/components/DashboardColorPicker.tsx` — modal/popover panel with preset swatches and custom pickers.
3. Update `DashboardNav.tsx` — add `onCustomizeColor?: () => void` prop and palette icon button. Also accept `headerStyle?: React.CSSProperties` to allow inline gradient override.
4. Update `StudentDashboard.tsx` — wire hook, pass style and callback.
5. Update `TeacherDashboard.tsx` — wire hook, pass style and callback. Also apply to the sub-action-row div.
6. Update `ParentDashboard.tsx` — wire hook, pass style and callback. Also apply to the sub-action-row div.
7. Update `AdminDashboard.tsx` — add palette button and colour customisation to the admin header.
