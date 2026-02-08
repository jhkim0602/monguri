import type { MentorTaskLike, PlannerTaskLike } from "@/lib/menteeAdapters";

export type MenteeFeedbackCacheData = {
  mentorTasks: MentorTaskLike[];
  plannerTasks: PlannerTaskLike[];
};

type CacheEntry = {
  data: MenteeFeedbackCacheData;
  fetchedAt: number;
};

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function readMenteeFeedbackCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.fetchedAt;
  return {
    data: entry.data,
    stale: age > CACHE_TTL_MS,
  };
}

export function writeMenteeFeedbackCache(
  key: string,
  data: MenteeFeedbackCacheData,
) {
  cache.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}
