import { supabaseServer } from "@/lib/supabaseServer";

export type UpcomingMeetingRow = {
  id: string;
  studentName: string;
  topic: string;
  confirmed_time: string;
  zoom_link: string | null;
};

export async function getUpcomingMeetingsByMentorId(
  mentorId: string,
  limit = 5
): Promise<UpcomingMeetingRow[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabaseServer
    .from("meeting_requests")
    .select(
      `
      id,
      topic,
      confirmed_time,
      zoom_link,
      requestor_id,
      mentor_mentee:mentor_mentee!inner(
        mentor_id
      )
    `
    )
    .eq("mentor_mentee.mentor_id", mentorId)
    .eq("status", "CONFIRMED")
    .not("confirmed_time", "is", null)
    .gte("confirmed_time", now)
    .order("confirmed_time", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) return [];

  const requestorIds = Array.from(
    new Set(data.map((r: any) => r.requestor_id))
  );

  const { data: profiles, error: profileError } = await supabaseServer
    .from("profiles")
    .select("id, name")
    .in("id", requestorIds);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const profileMap = new Map(
    profiles?.map((p: any) => [p.id, p.name]) || []
  );

  return data.map((row: any) => ({
    id: row.id,
    studentName: profileMap.get(row.requestor_id) || "알 수 없음",
    topic: row.topic || "",
    confirmed_time: row.confirmed_time,
    zoom_link: row.zoom_link,
  }));
}
