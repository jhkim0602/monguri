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
      mentor:profiles!mentor_mentee_mentor_id_fkey(
        id,
        role,
        name,
        avatar_url,
        intro
      )
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
      mentee:profiles!mentor_mentee_mentee_id_fkey(
        id,
        role,
        name,
        avatar_url,
        intro,
        goal,
        target_exam,
        target_date,
        grade
      )
    `,
    )
    .eq("mentor_id", mentorId)
    .eq("status", "active")
    .order("started_at", { ascending: false });

  if (error) {
    // If error is due to missing columns, try without new fields
    if (error.message.includes("goal") || error.message.includes("target_")) {
      const { data: fallbackData, error: fallbackError } = await supabaseServer
        .from("mentor_mentee")
        .select(
          `
          id,
          mentor_id,
          mentee_id,
          status,
          started_at,
          mentee:profiles!mentor_mentee_mentee_id_fkey(
            id,
            role,
            name,
            avatar_url,
            intro
          )
        `,
        )
        .eq("mentor_id", mentorId)
        .eq("status", "active")
        .order("started_at", { ascending: false });

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return (fallbackData ?? []) as unknown as (Omit<MentorMenteeRow, "mentor"> & {
        mentee: {
          id: string;
          role: "mentor" | "mentee" | "admin";
          name: string | null;
          avatar_url: string | null;
          intro: string | null;
          goal?: string | null;
          target_exam?: string | null;
          target_date?: string | null;
          grade?: string | null;
        } | null;
      })[];
    }
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as (Omit<MentorMenteeRow, "mentor"> & {
    mentee: {
      id: string;
      role: "mentor" | "mentee" | "admin";
      name: string | null;
      avatar_url: string | null;
      intro: string | null;
      goal?: string | null;
      target_exam?: string | null;
      target_date?: string | null;
      grade?: string | null;
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

  // Backward compatible mapping with new profile fields
  return {
    id: data.id,
    role: data.role,
    name: data.name,
    avatar_url: data.avatar_url,
    intro: data.intro,
    goal: data.goal ?? null,
    target_exam: data.target_exam ?? null,
    target_date: data.target_date ?? null,
    grade: data.grade ?? null,
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
