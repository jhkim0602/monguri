import { supabaseServer } from "@/lib/supabaseServer";

export type TaskSubmissionRow = {
  id: string;
  task_id: string;
  mentee_id: string;
  submitted_at: string;
  note: string | null;
};

export type TaskSubmissionFileRow = {
  id: string;
  submission_id: string;
  file_id: string;
  created_at: string;
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

export async function createTaskSubmissionFiles(
  submissionId: string,
  fileIds: string[]
) {
  if (fileIds.length === 0) return [];

  const payload = fileIds.map((fileId) => ({
    submission_id: submissionId,
    file_id: fileId,
  }));

  const { data, error } = await supabaseServer
    .from("task_submission_files")
    .insert(payload)
    .select("id, submission_id, file_id, created_at");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as TaskSubmissionFileRow[];
}
