# Mock → API Migration Verification Guide (AI-Friendly, English)

## Goal
Verify that UI remains unchanged while internal data sources switch from mock constants to real API data.
This guide is written for AI-assisted verification and includes **Supabase MCP cross-check steps**.

---

## 1) Preconditions
- App runs locally: `npm run dev`
- A valid **mentee** user exists in Supabase
- Supabase MCP is available and connected to the **monguri** project

---

## 2) Current Migration Scope (What’s already API-backed)

### A. Home
- Data replaced: `MENTOR_TASKS`, `USER_PROFILE`
- Expected:
  - “Arrived Feedback” list uses DB data
  - Profile name/avatar uses DB data

### B. Planner Detail `/planner/[id]`
- Data replaced: `MENTOR_TASKS` (fallback to API when id not in mock)
- Expected:
  - Task detail loads from API if mock doesn’t contain the id
  - `deadline` string converted to Date without UI breakage

### C. MyPage
- Data replaced: `MENTOR_TASKS`, `USER_PROFILE`
- Expected:
  - Subject achievement stats reflect DB data
  - Profile name/avatar uses DB data

---

## 3) Supabase MCP Cross-Verification (Source of Truth)

Use MCP to validate what the UI should show.

### A. Identify a mentee user
- Table: `public.profiles`
- Filter: `role = 'mentee'`
- Note: store `id` as `menteeId`

### B. Check mentor tasks for this mentee
- Table: `public.mentor_tasks`
- Filter: `mentee_id = <menteeId>`
- Fields to compare in UI:
  - `title`, `status`, `deadline`, `badge_color`
  - `subject_id` (join with `subjects`)

### C. Check feedback presence (drives “Arrived Feedback”)
- Table: `public.task_feedback`
- Filter: `task_id IN (mentor_tasks ids)`
- Presence of records should toggle feedback UI and `hasMentorResponse`

### D. Check subjects/colors (categories reuse)
- Table: `public.subjects`
- Fields: `id`, `name`, `color`, `text_color`
- These should map to UI badge styles

---

## 4) UI Verification Steps (Manual + AI)

### Step 1 — Confirm login state
- Log in as the mentee from MCP
- Open Home screen
- No console errors

### Step 2 — Home verification
- “Arrived Feedback” count equals number of tasks with feedback in MCP
- Each card title matches `mentor_tasks.title`
- Badge color aligns with `subjects.color/text_color`
- Profile name/avatar matches `profiles`

### Step 3 — Planner detail verification
- Click a task from Home or navigate `/planner/<taskId>`
- Detail should load using API if mock doesn’t contain id
- `deadline` displayed correctly (no invalid date)

### Step 4 — MyPage verification
- Subject-wise progress reflects MCP data for the selected period
- Profile info still matches MCP profile

---

## 5) Fallback & Error Cases

- If no login session:
  - UI must fallback to mock data
  - No crashes or layout changes

- If API returns empty or error:
  - UI must keep stable mock fallback
  - No runtime error

---

## 6) Expected Invariants

- UI layout/structure unchanged
- Data values updated from API
- Duplicate data reused (e.g., subject colors from `subjects` or default categories)
- Dates are parsed safely (string → Date) without rendering breaks

---

## 7) Verification Notes Template

- Date:
- MenteeId (from MCP):
- Home:
- Planner Detail:
- MyPage:
- Issues found:
