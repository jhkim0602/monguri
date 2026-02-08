import type { UiProfile } from "@/lib/menteeAdapters";

type MenteeMyPageCacheData = {
  profile: UiProfile;
};

type CacheEntry = {
  data: MenteeMyPageCacheData;
  fetchedAt: number;
};

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function readMenteeMyPageCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.fetchedAt;
  return {
    data: entry.data,
    stale: age > CACHE_TTL_MS,
  };
}

export function writeMenteeMyPageCache(
  key: string,
  data: MenteeMyPageCacheData,
) {
  cache.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}
