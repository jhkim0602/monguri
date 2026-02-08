import type { FeedbackItem } from "@/services/mentorFeedbackService";

type MentorFeedbackCacheData = {
  items: FeedbackItem[];
};

type CacheEntry = {
  data: MentorFeedbackCacheData;
  fetchedAt: number;
};

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function readMentorFeedbackCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.fetchedAt;
  return {
    data: entry.data,
    stale: age > CACHE_TTL_MS,
  };
}

export function writeMentorFeedbackCache(
  key: string,
  data: MentorFeedbackCacheData,
) {
  cache.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}
