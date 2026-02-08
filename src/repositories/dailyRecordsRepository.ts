import { supabaseServer } from "@/lib/supabaseServer";

export type DailyRecordRow = {
  id: string;
  mentee_id: string;
  date: string;
  study_time_min: number;
  mood: "best" | "good" | "normal" | "bad" | "worst" | null;
  memo?: string | null;
  comment?: string | null;
  daily_goal?: string | null;
  daily_note?: string | null;
  note?: string | null;
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
    .select("*")
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

export async function getDailyRecordByMenteeIdAndDate(
  menteeId: string,
  date: string
) {
  const { data, error } = await supabaseServer
    .from("daily_records")
    .select("*")
    .eq("mentee_id", menteeId)
    .eq("date", date)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as DailyRecordRow | null;
}

const isMissingColumnError = (message: string, columnName: string) =>
  message.toLowerCase().includes(`column`) &&
  message.toLowerCase().includes(columnName.toLowerCase());

const DAILY_MEMO_COLUMNS = [
  "memo",
  "comment",
  "daily_goal",
  "daily_note",
  "note",
] as const;

type DailyMemoColumn = (typeof DAILY_MEMO_COLUMNS)[number];

const saveMemoByColumn = async (
  columnName: DailyMemoColumn,
  payload: {
    existingId?: string;
    mentee_id: string;
    date: string;
    study_time_min: number;
    mood: DailyRecordRow["mood"];
    text: string;
  }
) => {
  const nextPayload: Record<string, unknown> = {
    mentee_id: payload.mentee_id,
    date: payload.date,
    study_time_min: payload.study_time_min,
    mood: payload.mood,
    [columnName]: payload.text,
  };

  if (!payload.existingId) {
    nextPayload.id = crypto.randomUUID();
  }

  const query = payload.existingId
    ? supabaseServer
        .from("daily_records")
        .update(nextPayload)
        .eq("id", payload.existingId)
    : supabaseServer
        .from("daily_records")
        .insert(nextPayload);

  const { data, error } = await query.select("*").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as DailyRecordRow | null;
};

export async function upsertDailyRecordMemoByDate(
  menteeId: string,
  date: string,
  memo: string
) {
  const existing = await getDailyRecordByMenteeIdAndDate(menteeId, date);
  const basePayload = {
    existingId: existing?.id,
    mentee_id: menteeId,
    date,
    study_time_min: existing?.study_time_min ?? 0,
    mood: existing?.mood ?? "normal",
    text: memo,
  };

  let lastMissingColumnError: Error | null = null;

  for (const columnName of DAILY_MEMO_COLUMNS) {
    try {
      return await saveMemoByColumn(columnName, basePayload);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      if (isMissingColumnError(message, columnName)) {
        lastMissingColumnError =
          error instanceof Error ? error : new Error(message);
        continue;
      }
      throw error;
    }
  }

  throw (
    lastMissingColumnError ??
    new Error("Could not find a writable memo column in daily_records.")
  );
}
