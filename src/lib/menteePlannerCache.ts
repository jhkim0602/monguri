import type { MentorTaskLike, PlannerTaskLike } from "@/lib/menteeAdapters";

export type PlannerCategory = {
  id: string;
  name: string;
  colorHex: string;
  textColorHex: string;
};

export type MenteePlannerCacheData = {
  tasks: Array<MentorTaskLike | PlannerTaskLike>;
  categories: PlannerCategory[];
  selectedCategoryId: string;
};

type CacheEntry = {
  data: MenteePlannerCacheData;
  fetchedAt: number;
};

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function readMenteePlannerCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.fetchedAt;
  return {
    data: entry.data,
    stale: age > CACHE_TTL_MS,
  };
}

export function writeMenteePlannerCache(
  key: string,
  data: MenteePlannerCacheData,
) {
  cache.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}
