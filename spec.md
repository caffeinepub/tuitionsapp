# Tuition Skill — Portal Colour Upgrade

## Current State
All three dashboards (Student, Teacher, Parent) use the existing palette:
- Header gradients: deep navy (#1B2B50) blended with role accent (coral/emerald/amber)
- Background: body shifting animation between orange/blue/pink/green
- Cards: white with light border
- Role token colours defined in index.css as OKLCH values
- Some hardcoded hex literals in ParentDashboard.tsx (bg-[#1B2B50], text-[#1B2B50])

## Requested Changes (Diff)

### Add
- A refined, world-class tuition-standard colour system:
  - **Student portal**: Rich sapphire/indigo primary with gold accent — conveys focus, academic prestige
  - **Teacher portal**: Deep teal/forest green primary with warm amber accent — professional authority, growth
  - **Parent portal**: Warm slate/burgundy primary with soft rose accent — trust, warmth, reliability
- Elevated dashboard header gradients — richer, multi-stop gradients with subtle depth
- Refined card styling: subtle coloured top-border accent per role, elevated shadow
- Better contrast and visual hierarchy on stat badges and action buttons

### Modify
- `src/frontend/src/index.css`: Update OKLCH tokens for `--student`, `--student-light`, `--teacher`, `--teacher-light`, `--parent`, `--parent-light`, `--primary`, `--secondary`, `--accent`; update `.dashboard-header-student`, `.dashboard-header-teacher`, `.dashboard-header-parent` gradients
- Replace hardcoded `bg-[#1B2B50]`/`text-[#1B2B50]` literals in `ParentDashboard.tsx` with semantic token classes

### Remove
- Nothing removed — all features, CRUD, and logic untouched

## Implementation Plan
1. Update `index.css` CSS tokens: redesign role colour OKLCH values for student (sapphire), teacher (teal), parent (burgundy/slate)
2. Upgrade dashboard header gradient CSS classes for all three roles
3. Update `tailwind.config.js` if role colour tokens need new named keys
4. Replace hardcoded hex literals in `ParentDashboard.tsx` with token classes
5. Validate — typecheck, lint, build
