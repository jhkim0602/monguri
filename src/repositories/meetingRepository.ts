import { supabaseServer } from "@/lib/supabaseServer";
import type { SupabaseClient } from "@supabase/supabase-js";

export type UpcomingMeetingRow = {
  id: string;
  studentName: string;
  topic: string;
  confirmed_time: string;
  zoom_link: string | null;
  mentor_note: string | null;
  source: "request" | "scheduled";
};

type MentorScheduledMeetingRawRow = {
  id: string;
  mentee_id: string;
  topic: string | null;
  confirmed_time: string;
  zoom_link: string | null;
  mentor_note: string | null;
};

export type MentorMeetingRequestStatus = "PENDING" | "CONFIRMED" | "REJECTED";

export type MentorMeetingRequestRow = {
  id: string;
  mentor_mentee_id: string;
  requestor_id: string;
  studentName: string;
  topic: string;
  preferred_times: string[];
  status: MentorMeetingRequestStatus;
  confirmed_time: string | null;
  zoom_link: string | null;
  mentor_note: string | null;
  created_at: string;
};

export type MeetingQueryClient = Pick<SupabaseClient<any, any, any>, "from">;

export async function listMeetingRequestsByMentorId(
  mentorId: string,
  queryClient: MeetingQueryClient = supabaseServer
): Promise<MentorMeetingRequestRow[]> {
  const { data, error } = await queryClient
    .from("meeting_requests")
    .select(
      `
      id,
      mentor_mentee_id,
      requestor_id,
      topic,
      preferred_times,
      status,
      confirmed_time,
      zoom_link,
      mentor_note,
      created_at,
      mentor_mentee:mentor_mentee!inner(
        mentor_id
      )
    `
    )
    .eq("mentor_mentee.mentor_id", mentorId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) return [];

  const requestorIds = Array.from(
    new Set(data.map((row: any) => row.requestor_id).filter(Boolean))
  );

  if (requestorIds.length === 0) {
    return data.map((row: any) => ({
      id: row.id,
      mentor_mentee_id: row.mentor_mentee_id,
      requestor_id: row.requestor_id,
      studentName: "알 수 없음",
      topic: row.topic || "",
      preferred_times: Array.isArray(row.preferred_times)
        ? row.preferred_times
        : [],
      status: row.status,
      confirmed_time: row.confirmed_time ?? null,
      zoom_link: row.zoom_link ?? null,
      mentor_note: row.mentor_note ?? null,
      created_at: row.created_at,
    }));
  }

  const { data: profiles, error: profileError } = await queryClient
    .from("profiles")
    .select("id, name")
    .in("id", requestorIds);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const profileMap = new Map(
    profiles?.map((profile: any) => [profile.id, profile.name]) || []
  );

  return data.map((row: any) => ({
    id: row.id,
    mentor_mentee_id: row.mentor_mentee_id,
    requestor_id: row.requestor_id,
    studentName: profileMap.get(row.requestor_id) || "알 수 없음",
    topic: row.topic || "",
    preferred_times: Array.isArray(row.preferred_times)
      ? row.preferred_times
      : [],
    status: row.status,
    confirmed_time: row.confirmed_time ?? null,
    zoom_link: row.zoom_link ?? null,
    mentor_note: row.mentor_note ?? null,
    created_at: row.created_at,
  }));
}

export async function listScheduledMeetingsByMentorId(
  mentorId: string,
  queryClient: MeetingQueryClient = supabaseServer,
): Promise<UpcomingMeetingRow[]> {
  const { data, error } = await queryClient
    .from("mentor_meetings")
    .select("id, mentee_id, topic, confirmed_time, zoom_link, mentor_note")
    .eq("mentor_id", mentorId)
    .order("confirmed_time", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as MentorScheduledMeetingRawRow[];
  if (rows.length === 0) return [];

  const menteeIds = Array.from(new Set(rows.map((row) => row.mentee_id)));
  const { data: profiles, error: profileError } = await queryClient
    .from("profiles")
    .select("id, name")
    .in("id", menteeIds);

  if (profileError) {
    throw new Error(profileError.message);
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile: any) => [profile.id, profile.name]),
  );

  return rows.map((row) => ({
    id: row.id,
    studentName: profileMap.get(row.mentee_id) || "알 수 없음",
    topic: row.topic ?? "",
    confirmed_time: row.confirmed_time,
    zoom_link: row.zoom_link ?? null,
    mentor_note: row.mentor_note ?? null,
    source: "scheduled",
  }));
}
