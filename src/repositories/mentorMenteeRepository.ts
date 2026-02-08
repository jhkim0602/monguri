import { supabaseServer } from "@/lib/supabaseServer";

export type MentorMenteeRow = {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: "active" | "inactive";
  started_at: string;
  mentor: {
    id: string;
    role: "mentor" | "mentee" | "admin";
    name: string | null;
    avatar_url: string | null;
    intro: string | null;
    d_day_date?: string | null;
    d_day_target_date?: string | null;
    dday_date?: string | null;
    target_date?: string | null;
    exam_date?: string | null;
    d_day_label?: string | null;
    d_day_name?: string | null;
    dday_label?: string | null;
    dday_name?: string | null;
    target_label?: string | null;
    exam_label?: string | null;
  } | null;
};

export async function getMentorByMenteeId(menteeId: string) {
  const { data, error } = await supabaseServer
    .from("mentor_mentee")
    .select(
      `
      id,
      mentor_id,
      mentee_id,
      status,
      started_at,
      mentor:profiles!mentor_mentee_mentor_id_fkey(*)
    `,
    )
    .eq("mentee_id", menteeId)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as MentorMenteeRow | null;
}

export async function getMenteesByMentorId(mentorId: string) {
  const { data, error } = await supabaseServer
    .from("mentor_mentee")
    .select(
      `
      id,
      mentor_id,
      mentee_id,
      status,
      started_at,
      mentee:profiles!mentor_mentee_mentee_id_fkey(*)
    `,
    )
    .eq("mentor_id", mentorId)
    .eq("status", "active")
    .order("started_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Map the nested 'mentee' object to a top-level 'mentee' property consistent with MentorMenteeRow structure if needed,
  // or acturally we need to return a type that includes mentee profile info.
  // Let's adjust the return type or just return the raw data which is close enough to what we need.
  return (data ?? []) as unknown as (Omit<MentorMenteeRow, "mentor"> & {
    mentee: {
      id: string;
      role: "mentor" | "mentee" | "admin";
      name: string | null;
      avatar_url: string | null;
      intro: string | null;
      d_day_date?: string | null;
      d_day_target_date?: string | null;
      dday_date?: string | null;
      target_date?: string | null;
      exam_date?: string | null;
      d_day_label?: string | null;
      d_day_name?: string | null;
      dday_label?: string | null;
      dday_name?: string | null;
      target_label?: string | null;
      exam_label?: string | null;
    } | null;
  })[];
}

export async function getMenteeDetailById(menteeId: string) {
  const { data, error } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("id", menteeId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // TODO: Aggregate stats from other tables (study_records, etc.)
  return {
    ...data,
    stats: {
      studyHours: 0,
      attendanceRate: "0%",
      tasksCompleted: 0,
    },
  };
}

export async function getMentorMenteeRelationship(menteeId: string) {
  const { data, error } = await supabaseServer
    .from("mentor_mentee")
    .select("id, mentor_id, mentee_id, status, started_at")
    .eq("mentee_id", menteeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as {
    id: string;
    mentor_id: string;
    mentee_id: string;
    status: "active" | "inactive";
    started_at: string;
  } | null;
}

export async function getMentorMenteeRelationshipByMentorAndMentee(
  mentorId: string,
  menteeId: string,
) {
  const { data, error } = await supabaseServer
    .from("mentor_mentee")
    .select("id, mentor_id, mentee_id, status, started_at")
    .eq("mentor_id", mentorId)
    .eq("mentee_id", menteeId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as {
    id: string;
    mentor_id: string;
    mentee_id: string;
    status: "active" | "inactive";
    started_at: string;
  } | null;
}
