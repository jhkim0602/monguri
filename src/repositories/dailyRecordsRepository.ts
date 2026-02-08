import { supabaseServer } from "@/lib/supabaseServer";

export type DailyRecordRow = {
  id: string;
  mentee_id: string;
  date: string;
  study_time_min: number;
  mood: "best" | "good" | "normal" | "bad" | "worst" | null;
  mentee_comment: string | null;
  mentor_reply: string | null;
  mentor_reply_at: string | null;
};

type RecordFilters = {
  from?: string;
  to?: string;
};

export async function listDailyRecordsByMenteeId(
  menteeId: string,
  filters: RecordFilters = {}
) {
  let query = supabaseServer
    .from("daily_records")
    .select("id, mentee_id, date, study_time_min, mood, mentee_comment, mentor_reply, mentor_reply_at")
    .eq("mentee_id", menteeId);

  if (filters.from) {
    query = query.gte("date", filters.from);
  }
  if (filters.to) {
    query = query.lte("date", filters.to);
  }

  const { data, error } = await query.order("date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DailyRecordRow[];
}

export async function getDailyRecordByDate(menteeId: string, date: string) {
  const { data, error } = await supabaseServer
    .from("daily_records")
    .select("id, mentee_id, date, study_time_min, mood, mentee_comment, mentor_reply, mentor_reply_at")
    .eq("mentee_id", menteeId)
    .eq("date", date)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as DailyRecordRow | null;
}

export async function upsertDailyRecord(
  menteeId: string,
  date: string,
  updates: {
    studyTimeMin?: number;
    mood?: "best" | "good" | "normal" | "bad" | "worst" | null;
    menteeComment?: string | null;
    mentorReply?: string | null;
  }
) {
  const payload: {
    mentee_id: string;
    date: string;
    study_time_min?: number;
    mood?: "best" | "good" | "normal" | "bad" | "worst" | null;
    mentee_comment?: string | null;
    mentor_reply?: string | null;
    mentor_reply_at?: string | null;
  } = {
    mentee_id: menteeId,
    date,
  };

  if (updates.studyTimeMin !== undefined) {
    payload.study_time_min = updates.studyTimeMin;
  }
  if (updates.mood !== undefined) {
    payload.mood = updates.mood;
  }
  if (updates.menteeComment !== undefined) {
    payload.mentee_comment = updates.menteeComment;
  }
  if (updates.mentorReply !== undefined) {
    payload.mentor_reply = updates.mentorReply;
    payload.mentor_reply_at = new Date().toISOString();
  }

  const { data, error } = await supabaseServer
    .from("daily_records")
    .upsert(payload, { onConflict: "mentee_id,date" })
    .select("id, mentee_id, date, study_time_min, mood, mentee_comment, mentor_reply, mentor_reply_at")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as DailyRecordRow | null;
}

export async function updateMentorReply(
  menteeId: string,
  date: string,
  mentorReply: string
) {
  const { data, error } = await supabaseServer
    .from("daily_records")
    .update({
      mentor_reply: mentorReply,
      mentor_reply_at: new Date().toISOString(),
    })
    .eq("mentee_id", menteeId)
    .eq("date", date)
    .select("id, mentee_id, date, study_time_min, mood, mentee_comment, mentor_reply, mentor_reply_at")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as DailyRecordRow | null;
}
