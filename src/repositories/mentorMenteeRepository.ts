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
    `
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
