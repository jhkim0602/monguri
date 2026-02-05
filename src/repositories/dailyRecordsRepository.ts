import { supabaseServer } from "@/lib/supabaseServer";

export type DailyRecordRow = {
  id: string;
  mentee_id: string;
  date: string;
  study_time_min: number;
  mood: "best" | "good" | "normal" | "bad" | "worst" | null;
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
    .select("id, mentee_id, date, study_time_min, mood")
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
