import { HttpError } from "@/lib/httpErrors";
import {
  getMentorTaskById,
  updateMentorTaskStatus,
} from "@/repositories/mentorTasksRepository";
import { getProfileById } from "@/repositories/profilesRepository";
import { createTaskSubmission } from "@/repositories/taskSubmissionsRepository";

export async function createMenteeTaskSubmission(
  taskId: string,
  menteeId: string,
  note: string | null
) {
  const profile = await getProfileById(menteeId);

  if (!profile) {
    throw new HttpError(404, "Mentee profile not found.");
  }

  if (profile.role !== "mentee") {
    throw new HttpError(403, "Profile is not a mentee.");
  }

  const task = await getMentorTaskById(taskId);

  if (!task) {
    throw new HttpError(404, "Mentor task not found.");
  }

  if (task.mentee_id !== menteeId) {
    throw new HttpError(403, "Task does not belong to mentee.");
  }

  if (task.status === "feedback_completed") {
    throw new HttpError(409, "Task feedback already completed.");
  }

  const submission = await createTaskSubmission(taskId, menteeId, note);

  if (task.status !== "submitted") {
    await updateMentorTaskStatus(taskId, "submitted");
  }

  return {
    submission: {
      id: submission.id,
      taskId: submission.task_id,
      menteeId: submission.mentee_id,
      submittedAt: submission.submitted_at,
      note: submission.note,
    },
    taskStatus: "submitted",
  };
}
