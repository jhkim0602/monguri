import { HttpError } from "@/lib/httpErrors";
import {
  getDailyRecordByMenteeIdAndDate,
  upsertDailyRecordMemoByDate,
} from "@/repositories/dailyRecordsRepository";
import { getProfileById } from "@/repositories/profilesRepository";

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

type PlannerDailyRecordResponse = {
  id: string | null;
  menteeId: string;
  date: string;
  studyTimeMin: number;
  mood: "best" | "good" | "normal" | "bad" | "worst" | null;
  memo: string;
};

const mapDailyRecord = (
  menteeId: string,
  date: string,
  record: {
    id: string;
    study_time_min: number;
    mood: "best" | "good" | "normal" | "bad" | "worst" | null;
    memo?: string | null;
    comment?: string | null;
    daily_goal?: string | null;
    daily_note?: string | null;
    note?: string | null;
  } | null
): PlannerDailyRecordResponse => ({
  id: record?.id ?? null,
  menteeId,
  date,
  studyTimeMin: record?.study_time_min ?? 0,
  mood: record?.mood ?? null,
  memo:
    record?.memo ??
    record?.comment ??
    record?.daily_goal ??
    record?.daily_note ??
    record?.note ??
    "",
});

export async function getPlannerDailyRecordForMentee(
  menteeId: string,
  date: string
) {
  await ensureMenteeProfile(menteeId);
  const record = await getDailyRecordByMenteeIdAndDate(menteeId, date);
  return mapDailyRecord(menteeId, date, record);
}

export async function updatePlannerDailyRecordMemoForMentee(
  menteeId: string,
  date: string,
  memo: string | null | undefined
) {
  await ensureMenteeProfile(menteeId);

  const trimmedMemo = (memo ?? "").trim();
  const updated = await upsertDailyRecordMemoByDate(menteeId, date, trimmedMemo);

  if (!updated) {
    throw new HttpError(500, "Failed to update daily memo.");
  }

  return mapDailyRecord(menteeId, date, updated);
}
