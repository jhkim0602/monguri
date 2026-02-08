# AI Handover Document - Monguri Project
## Branch: feature/mentor-api-material-ui-fixes
## Date: 2025-02-08

---

# SUMMARY OF CHANGES

This branch contains significant changes to the mentee profile system, mentor dashboard, and various UI improvements. The main feature is the **Profile Update System** that allows mentees to edit their profile including goals and D-Day settings.

**CRITICAL: RLS (Row Level Security) policies on the `profiles` table have been manually relaxed to allow profile updates. This was done outside of code changes.**

---

# 1. DATABASE SCHEMA CHANGES

## Migration File: `supabase/migrations/20260208_add_profile_goal_dday.sql`

New columns added to `profiles` table:
```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS goal TEXT,           -- Learning goal (e.g., "서울대 경영학과")
ADD COLUMN IF NOT EXISTS target_exam TEXT,    -- Target exam name (e.g., "2026 수능")
ADD COLUMN IF NOT EXISTS target_date DATE,    -- D-Day target date
ADD COLUMN IF NOT EXISTS grade TEXT;          -- Student grade (e.g., "고3", "N수")
```

**IMPORTANT FOR MERGE**: If main branch doesn't have these columns, you MUST run this migration first before deploying.

---

# 2. BACKEND API CHANGES

## 2.1 New PATCH Endpoint: `/api/mentee/profile`

**File**: `src/app/api/mentee/profile/route.ts`

Added new PATCH method for updating mentee profiles:
- Accepts: `profileId`, `name`, `intro`, `avatar_url`, `goal`, `target_exam`, `target_date`, `grade`
- Uses Zod validation via `profileUpdateBodySchema`
- Returns updated profile

```typescript
export async function PATCH(request: Request) {
  const body = await request.json();
  const parsed = profileUpdateBodySchema.safeParse(body);
  // ... validation and update logic
  const { profileId, ...updates } = parsed.data;
  const profile = await updateMenteeProfile(profileId, updates);
  return NextResponse.json({ success: true, profile });
}
```

## 2.2 Validator Schema

**File**: `src/lib/validators/mentee.ts`

Added `profileUpdateBodySchema`:
- `profileId`: UUID (required)
- `name`: string, 1-100 chars (optional)
- `intro`: string, max 500 chars (optional, nullable)
- `avatar_url`: URL, max 500 chars (optional, nullable)
- `goal`: string, max 200 chars (optional, nullable)
- `target_exam`: string, max 100 chars (optional, nullable)
- `target_date`: date string (optional, nullable)
- `grade`: string, max 50 chars (optional, nullable)

Validation ensures at least one field is provided for update.

## 2.3 Service Layer

**File**: `src/services/menteeService.ts`

Added `updateMenteeProfile(profileId, updates)`:
- Verifies profile exists and is a mentee
- Calls `updateProfileById` from repository
- Returns updated profile

## 2.4 Repository Layer

**File**: `src/repositories/profilesRepository.ts`

### Extended `ProfileRow` type with new fields:
```typescript
export type ProfileRow = {
  id: string;
  role: "mentor" | "mentee" | "admin";
  name: string | null;
  avatar_url: string | null;
  intro: string | null;
  goal: string | null;        // NEW
  target_exam: string | null; // NEW
  target_date: string | null; // NEW
  grade: string | null;       // NEW
  created_at: string;
};
```

### Added `ProfileUpdateInput` type

### Added `updateProfileById(profileId, updates)` function:
- Filters undefined values before update
- Includes **BACKWARD COMPATIBILITY** fallback logic
- If query fails due to missing new columns, falls back to basic fields only
- This ensures the app works even if migration hasn't been applied

### Modified `getProfileById(profileId)`:
- Now fetches new fields (goal, target_exam, target_date, grade)
- Has **BACKWARD COMPATIBILITY** fallback - if columns don't exist, returns nulls for new fields

---

# 3. FRONTEND CHANGES

## 3.1 Mentee MyPage

**File**: `src/app/(mentee)/mypage/page.tsx`

### Major Refactoring:
- Consolidated profile state into single `UiProfile` object
- Added `userId` state for API calls
- Removed separate temp states for modal

### New Features:
- Profile edit modal integration
- Goal & D-Day display card
- D-Day calculation and display (D-X, D-Day, D+X formats)

### Profile Save Handler:
```typescript
const handleSaveProfile = async (data: ProfileEditData) => {
  const response = await fetch("/api/mentee/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      profileId: userId,
      name: data.name,
      intro: data.intro,
      avatar_url: data.avatar,
      goal: data.goal,
      target_exam: data.targetExam,
      target_date: data.targetDate,
      grade: data.grade,
    }),
  });
  // ... error handling and state update
};
```

## 3.2 Profile Edit Modal (NEW FILE)

**File**: `src/components/mentee/mypage/ProfileEditModal.tsx`

Fully new component for profile editing:
- **Avatar Section**: DiceBear avatar generator with 8 style options
- **Basic Info**: Name, Grade (dropdown), Intro
- **Goal Section**: Target university/major input
- **D-Day Section**: Exam type (dropdown), Exam date picker

### Features:
- Shuffle button for random avatar generation
- Form validation
- Loading state during save
- Mobile-friendly bottom sheet design

### Avatar Styles Supported:
`notionists`, `avataaars`, `lorelei`, `micah`, `adventurer`, `big-smile`, `bottts`, `thumbs`

### Grade Options:
고1, 고2, 고3, N수, 중3

### Exam Options:
2026 수능, 2025 수능, 6월 모의고사, 9월 모의고사, 내신 시험, 기타

## 3.3 Mentee Adapters

**File**: `src/lib/menteeAdapters.ts`

### Extended `ApiProfile` type with new fields

### Extended `UiProfile` type:
```typescript
export type UiProfile = {
  name: string;
  role: string;
  dDay: number | null;  // Calculated from target_date
  avatar: string;
  intro: string;
  goal: string;
  targetExam: string;
  targetDate: string | null;
  grade: string;
};
```

### Added `calculateDDay(targetDate)` function:
- Returns positive number for future dates (D-X)
- Returns 0 for today (D-Day)
- Returns negative number for past dates (D+X)
- Returns null if no target date

### Updated `adaptProfileToUi(profile)`:
- Maps all new fields from API to UI format
- Calculates D-Day automatically

---

# 4. MENTOR-SIDE CHANGES

## 4.1 Mentor Types

**File**: `src/features/mentor/types.ts`

Extended `MentorMentee` type:
```typescript
export type MentorMentee = {
  // ... existing fields
  targetExam?: string;      // NEW
  targetDate?: string | null; // NEW
  dDay?: number | null;     // NEW (calculated)
  // ...
};
```

## 4.2 Mentor Adapters

**File**: `src/lib/mentorAdapters.ts`

### Added `calculateDDay(targetDate)` function (same logic as mentee)

### Updated `adaptMenteeToUi(row)`:
- Maps new profile fields (goal, grade, target_exam, target_date)
- Calculates D-Day for each mentee
- Goal now uses `mentee?.goal` instead of `mentee?.intro`

## 4.3 Mentor-Mentee Repository

**File**: `src/repositories/mentorMenteeRepository.ts`

### Updated `getMenteesByMentorId(mentorId)`:
- Now fetches new profile fields (goal, target_exam, target_date, grade)
- Has **BACKWARD COMPATIBILITY** fallback if columns don't exist

### Updated `getMenteeDetailById(menteeId)`:
- Now uses `select("*")` to get all profile fields
- Returns backward-compatible structure with new fields defaulting to null

---

# 5. SCHEDULE PAGE IMPROVEMENTS

**File**: `src/app/(mentor)/schedule/page.tsx`

### New Features:
- Added `confirmedRequests` state to track confirmed meetings with full details
- Extended `Request` type with `confirmed_time` and `zoom_link` fields
- Added icons: Video, Calendar, MapPin, AlertCircle, Info
- Realtime subscription for schedule updates

### Data Flow Changes:
- Separates PENDING and CONFIRMED requests
- Stores full request objects for confirmed meetings (not just events)
- Enables displaying Zoom links and meeting details

---

# 6. COLUMNS PAGE IMPROVEMENTS

**File**: `src/app/(mentee)/columns/page.tsx`

### Major Refactoring:
- Migrated from static `COLUMN_ARTICLES` constant to **Supabase database**
- Added `Column` type definition
- Added `fetchColumns()` and `fetchBookmarks()` async functions
- Uses `supabase` client for real-time data

### Database Query:
```typescript
const { data } = await supabase
  .from("columns")
  .select(`
    id, title, subtitle, slug, series_id,
    cover_image_url, created_at,
    author:author_id (name)
  `)
  .eq("status", "published")
  .order("created_at", { ascending: false });
```

---

# 7. COMMON MODAL IMPROVEMENTS

**File**: `src/components/ui/CommonModal.tsx`

### Added:
- New modal type: `"default"`
- Responsive sizing for `2xl` and `full` sizes
- Removed padding and centered styling for large modals
- Z-index on close button for visibility

---

# 8. OTHER MODIFIED FILES

| File | Change Summary |
|------|----------------|
| `src/app/(mentee)/chat/page.tsx` | Minor UI adjustments |
| `src/app/(mentee)/column/[slug]/page.tsx` | Refactored for Supabase integration |
| `src/app/(mentee)/home/page.tsx` | UI tweaks |
| `src/app/(mentee)/planner/page.tsx` | UX improvements |
| `src/app/(mentor)/chat-mentor/page.tsx` | Chat path adjustments |
| `src/app/(mentor)/students/[id]/StudentDetailClient.tsx` | Updated for new profile fields |
| `src/components/mentor/layout/Sidebar.tsx` | Minor updates |

---

# 9. NEW DIRECTORIES/FILES (UNTRACKED)

These are NEW and not yet committed:
```
docs/12                          # Documentation
src/app/(mentor)/mentor/          # New mentor routes
src/components/common/chat/       # Chat components
src/components/common/editor/     # Editor components
src/components/common/viewer/     # Viewer components
supabase/                         # Supabase config and migrations
```

---

# 10. PACKAGE DEPENDENCIES

**File**: `package.json`

New dependencies likely added (check package.json diff for specifics). Notable ones may include:
- Date formatting libraries (date-fns if not already present)
- Any new UI component libraries

---

# 11. MERGE CONFLICT RESOLUTION GUIDE

## Priority: KEEP FEATURE BRANCH CHANGES for these files:
1. `src/repositories/profilesRepository.ts` - Contains new update logic
2. `src/app/api/mentee/profile/route.ts` - Contains new PATCH endpoint
3. `src/services/menteeService.ts` - Contains new update service
4. `src/lib/validators/mentee.ts` - Contains new schema
5. `src/lib/menteeAdapters.ts` - Contains extended UiProfile
6. `src/lib/mentorAdapters.ts` - Contains D-Day calculation
7. `src/components/mentee/mypage/ProfileEditModal.tsx` - Entirely new file
8. `src/app/(mentee)/mypage/page.tsx` - Major refactoring

## Check for Type Conflicts:
- `src/features/mentor/types.ts` - May conflict if main has different type definitions
- `src/repositories/mentorMenteeRepository.ts` - Extended return types

## Database:
- **MUST apply migration** `supabase/migrations/20260208_add_profile_goal_dday.sql` before deploying
- **RLS policies have been manually relaxed** - ensure this is applied in production

---

# 12. TESTING CHECKLIST

After merge, verify:
- [ ] Mentee can view their profile on /mypage
- [ ] Mentee can click "프로필 수정" and open modal
- [ ] Avatar style change works
- [ ] Avatar shuffle (random seed) works
- [ ] Name, Grade, Intro fields save correctly
- [ ] Goal field saves correctly
- [ ] Target Exam dropdown works
- [ ] Target Date picker works
- [ ] D-Day displays correctly after save
- [ ] Mentor can see mentee's goal and D-Day on students page
- [ ] Columns page loads from database
- [ ] Schedule page shows confirmed meetings with details

---

# 13. KNOWN ISSUES / TODO

1. **RLS Policy**: Was manually modified to allow profile updates. Document the exact policy changes needed.
2. **Avatar Upload**: Currently uses DiceBear only, no file upload support.
3. **Stats Aggregation**: `stats.studyHours`, `attendanceRate`, `tasksCompleted` are still hardcoded to 0/default values.

---

# 14. ENVIRONMENT NOTES

- Branch: `feature/mentor-api-material-ui-fixes`
- Framework: Next.js (App Router)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth
- State: React useState/useEffect (no external state management)

---

# 15. FILE CHANGE SUMMARY (22 files modified)

```
 .claude/settings.local.json                        |   8 changes
 package-lock.json                                  | 895 changes (deps)
 package.json                                       |   8 changes
 src/app/(mentee)/chat/page.tsx                     |  14 changes
 src/app/(mentee)/column/[slug]/page.tsx            | 475 changes
 src/app/(mentee)/columns/page.tsx                  | 237 changes
 src/app/(mentee)/home/page.tsx                     |  88 changes
 src/app/(mentee)/mypage/page.tsx                   | 183 changes
 src/app/(mentee)/planner/page.tsx                  |  28 changes
 src/app/(mentor)/chat-mentor/page.tsx              |  26 changes
 src/app/(mentor)/schedule/page.tsx                 | 692 changes
 src/app/(mentor)/students/[id]/StudentDetailClient |  15 changes
 src/app/api/mentee/profile/route.ts                |  31 changes
 src/components/mentor/layout/Sidebar.tsx           |   2 changes
 src/components/ui/CommonModal.tsx                  |  49 changes
 src/features/mentor/types.ts                       |   3 changes
 src/lib/menteeAdapters.ts                          |  31 changes
 src/lib/mentorAdapters.ts                          |  39 changes
 src/lib/validators/mentee.ts                       |  23 changes
 src/repositories/mentorMenteeRepository.ts         |  77 changes
 src/repositories/profilesRepository.ts             |  96 changes
 src/services/menteeService.ts                      |  19 changes
```

Total: +2268 lines added, -771 lines removed

---

# 16. COMMIT HISTORY ON THIS BRANCH

```
b2499e6 Merge branch 'feature/mentor-api-material-ui-fixes'
456537d 채팅방에서 미팅을정해요.
2e5940f 루트 page 중복 빌드 오류 수정
a80ffc9 빌드 오류 해결
86aa709 feat: 멘토 과제 자료 및 멘티 과제 제출에 파일 첨부 기능 추가
aac42b1 feat: sync mentor dashboard/feedback data and fix planner UX
0784948 채팅 경로 변경
bd5b385 ui 수정
0012580 feat: align mentor backend flows and improve material selection UI
6091f14 Merge remote-tracking branch 'origin/hubal'
5e1c90a .
8a4f809 멘토 학생관리, 과제 부여, 피드백
```

---

END OF HANDOVER DOCUMENT
