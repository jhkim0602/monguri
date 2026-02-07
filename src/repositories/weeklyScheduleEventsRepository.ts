import { supabaseServer } from "@/lib/supabaseServer";

type WeeklyScheduleSubjectRow = {
  id: string;
  slug: string;
  name: string;
  color_hex: string | null;
  text_color_hex: string | null;
};

export type WeeklyScheduleEventRow = {
  id: string;
  mentee_id: string;
  subject_id: string | null;
  title: string;
  date: string;
  subjects: WeeklyScheduleSubjectRow | null;
};

type ScheduleFilters = {
  from?: string;
  to?: string;
};

export async function listWeeklyScheduleEventsByMenteeId(
  menteeId: string,
  filters: ScheduleFilters = {},
) {
  let query = supabaseServer
    .from("weekly_schedule_events")
    .select(
      `
      id,
      mentee_id,
      subject_id,
      title,
      date,
      subjects (
        id,
        slug,
        name,
        color_hex,
        text_color_hex
      )
    `,
    )
    .eq("mentee_id", menteeId);

  if (filters.from) {
    query = query.gte("date", filters.from);
  }
  if (filters.to) {
    query = query.lte("date", filters.to);
  }

  const { data, error } = await query
    .order("date", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rawData = (data ?? []) as any[];

  return rawData.map((row) => ({
    ...row,
    subjects: Array.isArray(row.subjects)
      ? row.subjects[0] || null
      : row.subjects,
  })) as WeeklyScheduleEventRow[];
}
