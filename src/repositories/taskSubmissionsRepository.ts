import { supabaseServer } from "@/lib/supabaseServer";

export type TaskSubmissionRow = {
  id: string;
  task_id: string;
  mentee_id: string;
  submitted_at: string;
  note: string | null;
};

export async function createTaskSubmission(
  taskId: string,
  menteeId: string,
  note: string | null
) {
  const { data, error } = await supabaseServer
    .from("task_submissions")
    .insert({
      task_id: taskId,
      mentee_id: menteeId,
      note,
    })
    .select("id, task_id, mentee_id, submitted_at, note")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as TaskSubmissionRow;
}
