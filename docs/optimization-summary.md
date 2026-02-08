# Optimization Summary (Caching + Techniques)

## Goal
Improve perceived page transitions and reduce repeated network work without changing DB schema or API structure.

## Core Caching Pattern
**In-memory Map cache + TTL + stale-while-revalidate**
- Data is cached in memory per browser session/tab.
- If cache exists:
  - Render immediately from cache.
  - If stale, refetch in background and update state + cache.
- If cache is fresh: skip network fetch.

**Cache TTL**
- Page-level caches: **60s**
- Chat message caches: **30s**
- Signed URL cache: **5 minutes** (with safety window)

## Where It’s Applied
### Mentee
- Home: `src/lib/menteeHomeCache.ts`
- Planner: `src/lib/menteePlannerCache.ts`
- Calendar: `src/lib/menteeCalendarCache.ts`
- Feedback: `src/lib/menteeFeedbackCache.ts`
- MyPage: `src/lib/menteeMyPageCache.ts`
- Chat: `src/lib/menteeChatCache.ts` (messages + signed URLs)

### Mentor
- Dashboard: `src/lib/mentorDashboardCache.ts`
- Students: `src/lib/mentorStudentsCache.ts`
- Feedback: `src/lib/mentorFeedbackCache.ts`
- Chat: `src/lib/mentorChatCache.ts` (messages + signed URLs)

## Realtime Strategy (Cache Invalidation)
**Supabase Realtime + debounce refresh**
- Realtime events trigger a soft refresh instead of immediate refetch spam.
- Debounce window: **250ms**
- Used on mentee pages: home/planner/calendar/feedback.
- Tables subscribed (as configured): `mentor_tasks`, `planner_tasks`, `weekly_schedule_events`, `daily_records`, `task_submissions`.

## Query/Request Optimizations
- **Auth call split**: `supabase.auth.getUser()` only once per page, not per fetch.
- **Duplicate queries removed**: e.g., mentor dashboard no longer runs client-side chat query.
- **Avoid large payloads where UI doesn’t need them**: dashboard removed heavy task list fetch since UI doesn’t render it.

## Chat-Specific Optimizations
**Pagination**
- Initial load pulls latest N (N=50).
- Older messages loaded when scrolling up.
- Scroll position preserved during prepend.

**Signed URL cache**
- Prevents repeated `createSignedUrl` calls for same attachment path.

**Realtime insert handling**
- Uses payload directly instead of refetching by ID.

## Notes / Limitations
- In-memory cache is per-tab (clears on refresh).
- Realtime does not guarantee full consistency; we refetch after events to reconcile.
- No DB migrations added for caching (all client-side).
