import type { MentorMentee, MentorTask } from "@/types/mentor";

export type MentorDashboardCacheData = {
  mentorName: string;
  mentees: MentorMentee[];
  recentActivity: MentorTask[];
  recentChats: {
    id: string;
    menteeName: string;
    menteeAvatarUrl: string | null;
    lastMessage: string;
    lastMessageAt: string | null;
    unreadCount: number;
  }[];
  recentFeedback: {
    id: string;
    type: "task" | "plan" | "self";
    title: string;
    subtitle: string;
    studentName: string;
    studentAvatarUrl: string | null;
    date: string;
    status: "pending" | "completed" | "reviewed" | "submitted";
  }[];
  stats: {
    totalMentees: number;
    pendingFeedback: number;
    activeAlerts: number;
  };
};

type CacheEntry = {
  data: MentorDashboardCacheData;
  fetchedAt: number;
};

const CACHE_TTL_MS = 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function readMentorDashboardCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.fetchedAt;
  return {
    data: entry.data,
    stale: age > CACHE_TTL_MS,
  };
}

export function writeMentorDashboardCache(
  key: string,
  data: MentorDashboardCacheData,
) {
  cache.set(key, {
    data,
    fetchedAt: Date.now(),
  });
}
