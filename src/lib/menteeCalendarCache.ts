import type {
  DailyRecordLike,
  MentorTaskLike,
  PlannerTaskLike,
  ScheduleEventLike,
} from "@/lib/menteeAdapters";

export type MenteeCalendarCacheData = {
  mentorTasks: MentorTaskLike[];
  plannerTasks: PlannerTaskLike[];
  planEvents: ScheduleEventLike[];
  dailyRecords: DailyRecordLike[];
};

type CacheEntry = {
  data: MenteeCalendarCacheData;
  fetchedAt: number;
};

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function readMenteeCalendarCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.fetchedAt;
  return {
    data: entry.data,
    stale: age > CACHE_TTL_MS,
  };
}

export function writeMenteeCalendarCache(
  key: string,
  data: MenteeCalendarCacheData,
) {
  cache.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}
