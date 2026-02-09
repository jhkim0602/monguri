import { supabaseServer } from "@/lib/supabaseServer";

export type TaskFeedbackRow = {
  id: string;
  task_id: string;
  mentor_id: string;
  comment: string | null;
  rating: number | null;
  status: "pending" | "reviewed";
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export async function listTaskFeedbackByTaskId(taskId: string) {
  const { data, error } = await supabaseServer
    .from("task_feedback")
    .select(
      "id, task_id, mentor_id, comment, rating, status, is_read, read_at, created_at",
    )
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TaskFeedbackRow[];
}

export async function markTaskFeedbackAsReadByTaskId(taskId: string) {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseServer
    .from("task_feedback")
    .update({
      is_read: true,
      read_at: nowIso,
    })
    .eq("task_id", taskId)
    .eq("is_read", false)
    .select("id");

  if (error) {
    throw new Error(error.message);
  }

  return {
    updatedCount: (data ?? []).length,
    readAt: nowIso,
  };
}
