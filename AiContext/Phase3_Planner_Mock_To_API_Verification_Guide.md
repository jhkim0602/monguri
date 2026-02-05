# Phase 3 (Planner) Mock → API Verification Guide

## Goal
Verify that **planner-related UI** (planner page, calendar, home widgets, planner detail) is now fully backed by real Supabase data, and that the UI remains unchanged while data sources are swapped from mock constants to API responses.
This guide is exhaustive and includes **Supabase MCP cross-check steps**.

---

## 0) Preconditions
- App runs locally: `npm run dev`
- Supabase MCP is connected to the `monguri-seoul_study` project
- A valid **mentee** user exists in Supabase
- Use absolute dates. Today is **2026-02-05**.

---

## 1) Supabase MCP Cross-Verification (Source of Truth)
Use MCP to validate what the UI and API should show.

### A. Identify a mentee user
Table: `public.profiles`
Filter: `role = 'mentee'`
Store `id` as `menteeId`

### B. Planner tasks (멘티 자율 플래너)
Table: `public.planner_tasks`
Filter: `mentee_id = <menteeId>`
Fields to compare:
- `id`, `title`, `date`, `completed`, `time_spent_sec`, `subject_id`

### C. Weekly schedule events (자율 플래너 일정)
Table: `public.weekly_schedule_events`
Filter: `mentee_id = <menteeId>`
Fields to compare:
- `id`, `title`, `date`, `subject_id`

### D. Daily records (일별 기록)
Table: `public.daily_records`
Filter: `mentee_id = <menteeId>`
Fields to compare:
- `id`, `date`, `study_time_min`, `mood`

### E. Subjects (색상/슬러그)
Table: `public.subjects`
Fields:
- `id`, `slug`, `name`, `color_hex`, `text_color_hex`

---

## 2) API Verification (Actual Responses)
All endpoints expect UUIDs and `YYYY-MM-DD` date strings.

### A. Planner tasks (list)
Endpoint: `GET /api/mentee/planner/tasks?menteeId=<menteeId>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>`
Expected:
- `tasks[]` only for the given date range
- Each task has: `id`, `title`, `date`, `completed`, `timeSpentSec`, `subject{slug,name,colorHex,textColorHex}`
- Values match MCP `planner_tasks` + `subjects`

### B. Planner tasks (single)
Endpoint: `GET /api/mentee/planner/tasks/<taskId>?menteeId=<menteeId>`
Expected:
- `task` fields match MCP `planner_tasks` row
- `subject` matches MCP `subjects`

### C. Planner tasks (create)
Endpoint: `POST /api/mentee/planner/tasks`
Body:
```json
{
  "menteeId": "<menteeId>",
  "title": "Test Planner Task",
  "date": "2026-02-05",
  "subjectSlug": "math",
  "completed": false,
  "timeSpentSec": 0
}
```
Expected:
- Response `task` exists with same fields
- MCP `planner_tasks` has new row
- `subject_id` matches `subjects.slug = subjectSlug`

### D. Planner tasks (update)
Endpoint: `PATCH /api/mentee/planner/tasks/<taskId>`
Body (example):
```json
{
  "menteeId": "<menteeId>",
  "completed": true,
  "timeSpentSec": 1200
}
```
Expected:
- Response `task.completed` reflects change
- MCP `planner_tasks.completed` updated
- `time_spent_sec` updated

### E. Planner tasks (delete)
Endpoint: `DELETE /api/mentee/planner/tasks/<taskId>?menteeId=<menteeId>`
Expected:
- Response `{ "id": "<taskId>" }`
- MCP `planner_tasks` row deleted

### F. Planner overview (schedule + daily records)
Endpoint: `GET /api/mentee/planner/overview?menteeId=<menteeId>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>`
Expected:
- `scheduleEvents[]` matches MCP `weekly_schedule_events` for range
- `dailyRecords[]` matches MCP `daily_records` for range
- `scheduleEvents[].subject` matches MCP `subjects`

---

## 3) UI Verification (Mock → API Replacement)
Verify **UI layout unchanged**, data updated from API.

### A. Home (`/home`)
Expected:
- **WeeklyCalendar** keywords come from API schedule events + tasks (not mock)
- **HomeProgress** daily list uses API schedule events + mentor tasks
- If logged out: fallback to mock (no crashes)

### B. Planner main (`/planner`)
Expected:
- Task list uses API data for the selected date
- Mentee-created tasks created via API persist on refresh
- Mentor tasks for the selected date are from API
- Subject colors match `subjects` table (slug-based)
- Toggle completion on **mentee tasks only** updates API

### C. Planner detail (`/planner/[id]`)
Expected:
- If `id` belongs to planner task: loads from `GET /api/mentee/planner/tasks/<id>`
- If `id` belongs to mentor task: loads from `GET /api/mentee/tasks?menteeId=...`
- If neither: fallback task renders without crash

### D. Calendar (`/calendar`)
Expected:
- Month view keywords use **API-derived scheduleEvents**
- Planner collection view uses **API** for:
  - mentor tasks
  - planner tasks
  - daily records
  - schedule events
- Modal detail uses **API** data for selected date

---

## 4) Error/Permission Cases (Backend Logic Checks)

### A. Invalid UUID
- Any endpoint with invalid UUID should return `400`

### B. Non-mentee profile
- Use `menteeId` of a mentor
Expected:
- `/api/mentee/planner/tasks` → `403`
- `/api/mentee/planner/tasks/<taskId>` → `403`
- `/api/mentee/planner/overview` → `403`

### C. Task ownership mismatch
- Use `taskId` of another mentee
Expected:
- `/api/mentee/planner/tasks/<taskId>` → `403`

### D. Task not found
- Random UUID not in `planner_tasks`
Expected:
- `/api/mentee/planner/tasks/<taskId>` → `404`

### E. Subject slug not found
- Use invalid `subjectSlug`
Expected:
- POST/PATCH returns `400` (“Subject not found.”)

---

## 5) Fallback Behavior

### A. Logged-out state
- UI falls back to mock data (no crash)

### B. API error/empty response
- UI remains stable
- Empty states shown or fallback mock used

---

## 6) Notes Template
- Date:
- MenteeId:
- MCP snapshot:
- API verification:
- UI verification:
- Issues:
