import { revalidateTag, unstable_cache } from "next/cache";

import { supabaseServer } from "@/lib/supabaseServer";
import { getMenteeProfile } from "@/services/menteeService";
import { getMenteeMentorTasks } from "@/services/mentorTasksService";
import { getPlannerOverview } from "@/services/plannerOverviewService";
import { getPlannerTasksForMentee } from "@/services/plannerTasksService";
import { getSubjects } from "@/services/subjectsService";

export const MENTEE_HOME_SERVER_CACHE_TTL_SEC = 60;

const MENTEE_HOME_CACHE_TAG_PREFIX = "mentee-home";

export type MenteeHomeServerPayload = {
  menteeId: string;
  from: string;
  to: string;
  mentorTasks: Awaited<ReturnType<typeof getMenteeMentorTasks>>["tasks"];
  plannerTasks: Awaited<ReturnType<typeof getPlannerTasksForMentee>>["tasks"];
  scheduleEvents: Awaited<ReturnType<typeof getPlannerOverview>>["scheduleEvents"];
  dailyRecords: Awaited<ReturnType<typeof getPlannerOverview>>["dailyRecords"];
  profile: Awaited<ReturnType<typeof getMenteeProfile>>;
  subjects: Awaited<ReturnType<typeof getSubjects>>;
  columns: {
    id: string;
    title: string;
    subtitle: string | null;
    slug: string;
    series_id: string | null;
    cover_image_url: string | null;
    created_at: string;
    published_at: string | null;
    author_id: string | null;
  }[];
};

export const getMenteeHomeCacheTag = (menteeId: string) =>
  `${MENTEE_HOME_CACHE_TAG_PREFIX}:${menteeId}`;

export const getMenteeHomeRangeCacheTag = (
  menteeId: string,
  from: string,
  to: string,
) => `${MENTEE_HOME_CACHE_TAG_PREFIX}:${menteeId}:${from}:${to}`;

export function revalidateMenteeHomeCacheByMenteeId(menteeId: string) {
  revalidateTag(getMenteeHomeCacheTag(menteeId));
}

async function listPublishedColumns() {
  const { data, error } = await supabaseServer
    .from("columns")
    .select(
      "id, title, subtitle, slug, series_id, cover_image_url, created_at, published_at, author_id",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching columns:", error);
    return [];
  }

  return (data ?? []) as MenteeHomeServerPayload["columns"];
}

export async function getCachedMenteeHomeData(
  menteeId: string,
  from: string,
  to: string,
): Promise<MenteeHomeServerPayload> {
  const cachedLoader = unstable_cache(
    async () => {
      const [mentorTasksResult, profile, plannerTasksResult, overviewResult, subjects, columns] =
        await Promise.all([
          getMenteeMentorTasks(menteeId),
          getMenteeProfile(menteeId),
          getPlannerTasksForMentee(menteeId, { from, to }),
          getPlannerOverview(menteeId, { from, to }),
          getSubjects(),
          listPublishedColumns(),
        ]);

      return {
        menteeId,
        from,
        to,
        mentorTasks: mentorTasksResult.tasks,
        plannerTasks: plannerTasksResult.tasks,
        scheduleEvents: overviewResult.scheduleEvents,
        dailyRecords: overviewResult.dailyRecords,
        profile,
        subjects,
        columns,
      };
    },
    ["mentee-home", menteeId, from, to],
    {
      revalidate: MENTEE_HOME_SERVER_CACHE_TTL_SEC,
      tags: [
        getMenteeHomeCacheTag(menteeId),
        getMenteeHomeRangeCacheTag(menteeId, from, to),
      ],
    },
  );

  return cachedLoader();
}
