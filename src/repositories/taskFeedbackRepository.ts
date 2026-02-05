import { supabaseServer } from "@/lib/supabaseServer";

export type TaskFeedbackRow = {
  id: string;
  task_id: string;
  mentor_id: string;
  comment: string | null;
  rating: number | null;
  status: "pending" | "reviewed";
  created_at: string;
};

export async function listTaskFeedbackByTaskId(taskId: string) {
  const { data, error } = await supabaseServer
    .from("task_feedback")
    .select("id, task_id, mentor_id, comment, rating, status, created_at")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TaskFeedbackRow[];
}
