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

export type PendingDailyCommentRow = {
  id: string;
  mentee_id: string;
  date: string;
  mentee_comment: string;
  mentor_reply: string | null;
  mentor_reply_at: string | null;
  mentee: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
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

export async function listPendingDailyCommentsByMentorId(mentorId: string) {
  const { data: mentorMenteeRows, error: mentorMenteeError } = await supabaseServer
    .from("mentor_mentee")
    .select("mentee_id")
    .eq("mentor_id", mentorId)
    .eq("status", "active");

  if (mentorMenteeError) {
    throw new Error(mentorMenteeError.message);
  }

  const menteeIds = mentorMenteeRows?.map((row) => row.mentee_id) ?? [];
  if (menteeIds.length === 0) {
    return [] as PendingDailyCommentRow[];
  }

  const { data: records, error: recordsError } = await supabaseServer
    .from("daily_records")
    .select(
      "id, mentee_id, date, mentee_comment, mentor_reply, mentor_reply_at",
    )
    .in("mentee_id", menteeIds)
    .is("mentor_reply", null)
    .not("mentee_comment", "is", null)
    .order("date", { ascending: false });

  if (recordsError) {
    throw new Error(recordsError.message);
  }

  const filteredRecords = (records ?? []).filter((row: any) => {
    const comment = typeof row?.mentee_comment === "string"
      ? row.mentee_comment.trim()
      : "";
    return comment.length > 0;
  });

  if (filteredRecords.length === 0) {
    return [] as PendingDailyCommentRow[];
  }

  const { data: profiles, error: profilesError } = await supabaseServer
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", Array.from(new Set(filteredRecords.map((row: any) => row.mentee_id))));

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile: any) => [profile.id, profile]),
  );

  return filteredRecords.map((row: any) => ({
    id: row.id,
    mentee_id: row.mentee_id,
    date: row.date,
    mentee_comment: String(row.mentee_comment ?? "").trim(),
    mentor_reply: row.mentor_reply ?? null,
    mentor_reply_at: row.mentor_reply_at ?? null,
    mentee: profileMap.get(row.mentee_id) ?? null,
  })) as PendingDailyCommentRow[];
}
