import { HttpError } from "@/lib/httpErrors";
import { getMentorTaskById } from "@/repositories/mentorTasksRepository";
import { getProfileById } from "@/repositories/profilesRepository";
import { listTaskFeedbackByTaskId } from "@/repositories/taskFeedbackRepository";

export async function getTaskFeedbackForMentee(
  taskId: string,
  menteeId: string
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

  const feedback = await listTaskFeedbackByTaskId(taskId);

  return {
    feedback: feedback.map((item) => ({
      id: item.id,
      taskId: item.task_id,
      mentorId: item.mentor_id,
      comment: item.comment,
      rating: item.rating,
      status: item.status,
      createdAt: item.created_at,
    })),
  };
}
