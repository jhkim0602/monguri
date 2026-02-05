# Mock → API Verification Guide (Supabase-backed, English)

## Goal
Confirm that **all backend API logic already implemented** is working with real Supabase data (not mocks), and that UI screens that were switched to API data are rendering correctly. UI layout/structure should remain unchanged. This is intended as AI handoff context.

---

## 1) Preconditions
- App runs locally: `npm run dev`
- Supabase MCP is connected to the `monguri-seoul_study` project
- A valid **mentee** user exists in Supabase

---

## 2) Supabase MCP Cross-Verification (Source of Truth)

### A. Identify a mentee user
Table: `public.profiles`
Filter: `role = 'mentee'`
Store `id` as `menteeId`

### B. Mentor tasks for this mentee
Table: `public.mentor_tasks`
Filter: `mentee_id = <menteeId>`
Fields to compare in UI/API:
- `title`, `status`, `deadline`, `subject_id`

### C. Submissions
Table: `public.task_submissions`
Filter: `mentee_id = <menteeId>`
Fields to compare:
- `task_id`, `submitted_at`, `note`

### D. Feedback
Table: `public.task_feedback`
Filter: `task_id IN (mentor_tasks ids)`
Fields to compare:
- `comment`, `rating`, `status`, `created_at`

### E. Subjects (Hex + slug normalization)
Table: `public.subjects`
Fields:
- `id`, `slug`, `name`, `color_hex`, `text_color_hex`

---

## 3) API Verification (Actual Responses)

### A. Mentor tasks (Phase 1)
Endpoint: `GET /api/mentee/tasks?menteeId=<menteeId>`
Expected:
- `tasks[].title/status/deadline` match MCP `mentor_tasks`
- `tasks[].subject.slug/name/colorHex/textColorHex` match MCP `subjects`
- `tasks[].latestSubmission` equals latest MCP `task_submissions` per task
- `tasks[].latestFeedback` equals latest MCP `task_feedback` per task
- `hasMentorResponse` matches feedback presence
 - `summary.total/pending/submitted/feedbackCompleted` matches derived counts from MCP

### B. Mentee profile (Phase 0)
Endpoint: `GET /api/mentee/profile?profileId=<menteeId>`
Expected:
- `profile.name/avatar_url/role` match MCP `profiles`

### C. Mentor relation (Phase 0)
Endpoint: `GET /api/mentee/mentor?menteeId=<menteeId>`
Expected:
- Mentor relation matches MCP `mentor_mentee`
- Mentor profile matches MCP `profiles`

### D. Subjects (Hex + slug)
Endpoint: `GET /api/subjects`
Expected:
- Contains `slug`, `colorHex`, `textColorHex`
- Matches MCP `subjects`

### E. Submission write (Phase 2)
Endpoint: `POST /api/mentee/tasks/<taskId>/submissions`
Body:
```json
{ "menteeId": "<menteeId>", "note": "Test submission" }
```
Expected:
- Response `submission` matches request
- MCP `task_submissions` has a new row
- Related `mentor_tasks.status` becomes `submitted`

### F. Feedback read (Phase 2)
Endpoint: `GET /api/mentee/tasks/<taskId>/feedback?menteeId=<menteeId>`
Expected:
- Matches MCP `task_feedback` for the task
- Empty array if none

---

## 4) Backend Logic Checks (Error/Permission Cases)

These validate the **service/repository logic** beyond just happy paths.

### A. Invalid UUID format
- Call any endpoint with invalid UUID (`menteeId` or `taskId`)
Expected: `400` with validation error

### B. Non-mentee profile
- Use a `profileId` or `menteeId` that is `role = 'mentor'`
Expected:
  - `/api/mentee/profile` → `403`
  - `/api/mentee/tasks` → `403`
  - `/api/mentee/mentor` → `403`

### C. Task ownership mismatch
- Pick a `taskId` that belongs to a different mentee
Expected:
  - `/api/mentee/tasks/<taskId>/feedback` → `403`
  - `/api/mentee/tasks/<taskId>/submissions` → `403`

### D. Task not found
- Use a random UUID not in `mentor_tasks`
Expected: `404` for feedback/submission endpoints

### E. Feedback already completed
- Use a `taskId` where `mentor_tasks.status = feedback_completed`
Expected: `/submissions` returns `409`

---

## 5) UI Verification (Mock → API Replacement)

### A. Home (`/home`)
Expected:
- Profile name/avatar from MCP
- “Arrived Feedback” list from MCP feedback
- Task titles/status/deadlines from MCP mentor_tasks

### B. MyPage (`/mypage`)
Expected:
- Subject stats reflect MCP mentor_tasks data
- Profile info matches MCP

### C. Planner detail (`/planner/[id]`)
Expected:
- Task loads via API even if not in mock
- Deadline rendered correctly (no invalid date)

---

## 6) Fallback Behavior

### A. Logged-out state
- UI should fall back to mock data
- No crashes or layout changes

### B. API error/empty response
- UI remains stable
- Mock fallback or empty state only

---

## 7) Notes Template
- Date:
- MenteeId:
- MCP snapshot:
- API verification:
- UI verification:
- Issues:
