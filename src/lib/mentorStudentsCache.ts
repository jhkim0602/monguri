import type { MentorMentee } from "@/types/mentor";

type MentorStudentsCacheData = {
  mentees: MentorMentee[];
};

type CacheEntry = {
  data: MentorStudentsCacheData;
  fetchedAt: number;
};

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function readMentorStudentsCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.fetchedAt;
  return {
    data: entry.data,
    stale: age > CACHE_TTL_MS,
  };
}

export function writeMentorStudentsCache(
  key: string,
  data: MentorStudentsCacheData,
) {
  cache.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}
