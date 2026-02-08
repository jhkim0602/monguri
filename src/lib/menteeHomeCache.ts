import type {
  MentorTaskLike,
  PlannerTaskLike,
  ScheduleEventLike,
  UiProfile,
} from "@/lib/menteeAdapters";

export type MenteeHomeCacheData = {
  mentorTasks: MentorTaskLike[];
  plannerTasks: PlannerTaskLike[];
  planEvents: ScheduleEventLike[];
  profile: UiProfile | null;
};

type CacheEntry = {
  data: MenteeHomeCacheData;
  fetchedAt: number;
};

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function readMenteeHomeCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.fetchedAt;
  return {
    data: entry.data,
    stale: age > CACHE_TTL_MS,
  };
}

export function writeMenteeHomeCache(key: string, data: MenteeHomeCacheData) {
  cache.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}
