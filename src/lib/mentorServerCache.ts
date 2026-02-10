import { revalidateTag, unstable_cache } from "next/cache";

import { getMentorByMenteeId } from "@/repositories/mentorMenteeRepository";
import { getPendingFeedbackItems } from "@/services/mentorFeedbackService";
import { getMentorStudentsList } from "@/services/mentorStudentService";

export const MENTOR_SERVER_CACHE_TTL_SEC = 60;

const MENTOR_DASHBOARD_CACHE_TAG_PREFIX = "mentor-dashboard";
const MENTOR_FEEDBACK_CACHE_TAG_PREFIX = "mentor-feedback";
const MENTOR_STUDENTS_CACHE_TAG_PREFIX = "mentor-students";

export const getMentorDashboardCacheTag = (mentorId: string) =>
  `${MENTOR_DASHBOARD_CACHE_TAG_PREFIX}:${mentorId}`;

export const getMentorFeedbackCacheTag = (mentorId: string) =>
  `${MENTOR_FEEDBACK_CACHE_TAG_PREFIX}:${mentorId}`;

export const getMentorStudentsCacheTag = (mentorId: string) =>
  `${MENTOR_STUDENTS_CACHE_TAG_PREFIX}:${mentorId}`;

export function revalidateMentorDashboardCacheByMentorId(mentorId: string) {
  revalidateTag(getMentorDashboardCacheTag(mentorId));
}

export function revalidateMentorFeedbackCacheByMentorId(mentorId: string) {
  revalidateTag(getMentorFeedbackCacheTag(mentorId));
}

export function revalidateMentorStudentsCacheByMentorId(mentorId: string) {
  revalidateTag(getMentorStudentsCacheTag(mentorId));
}

export function revalidateMentorSurfaceCachesByMentorId(mentorId: string) {
  revalidateMentorDashboardCacheByMentorId(mentorId);
  revalidateMentorFeedbackCacheByMentorId(mentorId);
  revalidateMentorStudentsCacheByMentorId(mentorId);
}

export async function revalidateMentorSurfaceCachesByMenteeId(menteeId: string) {
  const mentorMentee = await getMentorByMenteeId(menteeId);
  const mentorId = mentorMentee?.mentor_id ?? null;
  if (!mentorId) return;

  revalidateMentorSurfaceCachesByMentorId(mentorId);
}

export async function getCachedMentorFeedbackItems(mentorId: string) {
  const cachedLoader = unstable_cache(
    async () => getPendingFeedbackItems(mentorId),
    ["mentor-feedback", mentorId],
    {
      revalidate: MENTOR_SERVER_CACHE_TTL_SEC,
      tags: [getMentorFeedbackCacheTag(mentorId)],
    },
  );

  return cachedLoader();
}

export async function getCachedMentorStudents(mentorId: string) {
  const cachedLoader = unstable_cache(
    async () => getMentorStudentsList(mentorId),
    ["mentor-students", mentorId],
    {
      revalidate: MENTOR_SERVER_CACHE_TTL_SEC,
      tags: [getMentorStudentsCacheTag(mentorId)],
    },
  );

  return cachedLoader();
}
