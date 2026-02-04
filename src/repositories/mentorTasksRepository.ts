import { supabaseServer } from "@/lib/supabaseServer";

export type MentorTaskRow = {
  id: string;
  mentor_id: string;
  mentee_id: string;
  subject_id: string | null;
  title: string;
  description: string | null;
  status: "pending" | "submitted" | "feedback_completed";
  deadline: string | null;
  badge_color: string | null;
  created_at: string;
  subjects: {
    id: string;
    name: string;
    color: string | null;
    text_color: string | null;
  } | null;
  task_submissions: {
    id: string;
    submitted_at: string;
    note: string | null;
  }[] | null;
  task_feedback: {
    id: string;
    comment: string | null;
    rating: number | null;
    status: "pending" | "reviewed";
    created_at: string;
  }[] | null;
};

export async function listMentorTasksByMenteeId(menteeId: string) {
  const { data, error } = await supabaseServer
    .from("mentor_tasks")
    .select(
      `
      id,
      mentor_id,
      mentee_id,
      subject_id,
      title,
      description,
      status,
      deadline,
      badge_color,
      created_at,
      subjects (
        id,
        name,
        color,
        text_color
      ),
      task_submissions (
        id,
        submitted_at,
        note
      ),
      task_feedback (
        id,
        comment,
        rating,
        status,
        created_at
      )
    `
    )
    .eq("mentee_id", menteeId)
    .order("deadline", { ascending: true })
    .order("submitted_at", {
      foreignTable: "task_submissions",
      ascending: false,
    })
    .order("created_at", {
      foreignTable: "task_feedback",
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MentorTaskRow[];
}
