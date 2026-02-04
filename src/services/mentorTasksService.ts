import { HttpError } from "@/lib/httpErrors";
import { listMentorTasksByMenteeId } from "@/repositories/mentorTasksRepository";
import { getProfileById } from "@/repositories/profilesRepository";

type TaskSummary = {
  total: number;
  pending: number;
  submitted: number;
  feedbackCompleted: number;
};

function pickLatest<T>(items: T[] | null | undefined, dateKey: keyof T) {
  if (!items || items.length === 0) return null;

  return [...items].sort((a, b) => {
    const aTime = new Date(String(a[dateKey])).getTime();
    const bTime = new Date(String(b[dateKey])).getTime();
    return bTime - aTime;
  })[0];
}

export async function getMenteeMentorTasks(menteeId: string) {
  const profile = await getProfileById(menteeId);

  if (!profile) {
    throw new HttpError(404, "Mentee profile not found.");
  }

  if (profile.role !== "mentee") {
    throw new HttpError(403, "Profile is not a mentee.");
  }

  const tasks = await listMentorTasksByMenteeId(menteeId);

  const mappedTasks = tasks.map((task) => {
    const latestSubmission = pickLatest(task.task_submissions, "submitted_at");
    const latestFeedback = pickLatest(task.task_feedback, "created_at");

    return {
      id: task.id,
      mentorId: task.mentor_id,
      menteeId: task.mentee_id,
      subject: task.subjects
        ? {
            id: task.subjects.id,
            name: task.subjects.name,
            color: task.subjects.color,
            textColor: task.subjects.text_color,
          }
        : null,
      title: task.title,
      description: task.description,
      status: task.status,
      deadline: task.deadline,
      badgeColor: task.badge_color,
      createdAt: task.created_at,
      latestSubmission: latestSubmission
        ? {
            id: latestSubmission.id,
            submittedAt: latestSubmission.submitted_at,
            note: latestSubmission.note,
          }
        : null,
      latestFeedback: latestFeedback
        ? {
            id: latestFeedback.id,
            comment: latestFeedback.comment,
            rating: latestFeedback.rating,
            status: latestFeedback.status,
            createdAt: latestFeedback.created_at,
          }
        : null,
      hasMentorResponse: Boolean(latestFeedback),
    };
  });

  const summary = mappedTasks.reduce<TaskSummary>(
    (acc, task) => {
      acc.total += 1;
      if (task.status === "pending") acc.pending += 1;
      if (task.status === "submitted") acc.submitted += 1;
      if (task.status === "feedback_completed") acc.feedbackCompleted += 1;
      return acc;
    },
    { total: 0, pending: 0, submitted: 0, feedbackCompleted: 0 }
  );

  return {
    menteeId,
    summary,
    tasks: mappedTasks,
  };
}
