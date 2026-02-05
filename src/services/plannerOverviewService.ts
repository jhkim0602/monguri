import { HttpError } from "@/lib/httpErrors";
import { listDailyRecordsByMenteeId } from "@/repositories/dailyRecordsRepository";
import { getProfileById } from "@/repositories/profilesRepository";
import { listWeeklyScheduleEventsByMenteeId } from "@/repositories/weeklyScheduleEventsRepository";

const ensureMenteeProfile = async (menteeId: string) => {
  const profile = await getProfileById(menteeId);
  if (!profile) {
    throw new HttpError(404, "Mentee profile not found.");
  }
  if (profile.role !== "mentee") {
    throw new HttpError(403, "Profile is not a mentee.");
  }
  return profile;
};

type PlannerOverviewSubject = {
  id: string;
  slug: string;
  name: string;
  colorHex: string | null;
  textColorHex: string | null;
};

type PlannerOverviewEvent = {
  id: string;
  menteeId: string;
  subject: PlannerOverviewSubject | null;
  title: string;
  date: string;
};

type PlannerDailyRecord = {
  id: string;
  menteeId: string;
  date: string;
  studyTimeMin: number;
  mood: "best" | "good" | "normal" | "bad" | "worst" | null;
};

type PlannerOverviewFilters = {
  from?: string;
  to?: string;
};

const mapSubject = (subject: {
  id: string;
  slug: string;
  name: string;
  color_hex: string | null;
  text_color_hex: string | null;
} | null): PlannerOverviewSubject | null => {
  if (!subject) return null;
  return {
    id: subject.id,
    slug: subject.slug,
    name: subject.name,
    colorHex: subject.color_hex,
    textColorHex: subject.text_color_hex,
  };
};

export async function getPlannerOverview(
  menteeId: string,
  filters: PlannerOverviewFilters = {}
) {
  await ensureMenteeProfile(menteeId);

  const [events, dailyRecords] = await Promise.all([
    listWeeklyScheduleEventsByMenteeId(menteeId, filters),
    listDailyRecordsByMenteeId(menteeId, filters),
  ]);

  const mappedEvents: PlannerOverviewEvent[] = events.map((event) => ({
    id: event.id,
    menteeId: event.mentee_id,
    subject: mapSubject(event.subjects),
    title: event.title,
    date: event.date,
  }));

  const mappedRecords: PlannerDailyRecord[] = dailyRecords.map((record) => ({
    id: record.id,
    menteeId: record.mentee_id,
    date: record.date,
    studyTimeMin: record.study_time_min,
    mood: record.mood,
  }));

  return {
    menteeId,
    scheduleEvents: mappedEvents,
    dailyRecords: mappedRecords,
  };
}
