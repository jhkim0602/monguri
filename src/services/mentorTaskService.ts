import {
  createMentorTask,
  createTaskFeedback,
  getMentorTaskById,
  getTasksWithSubmissionsByMentorId,
  createMentorTaskMaterials,
} from "@/repositories/mentorTasksRepository";
import {
  getPlannerTaskById,
  listPlannerTasksByMenteeId,
  updatePlannerTask,
} from "@/repositories/plannerTasksRepository";
import { getMenteesByMentorId } from "@/repositories/mentorMenteeRepository";
import { getProfileById } from "@/repositories/profilesRepository";
import { getSubjectBySlug } from "@/repositories/subjectsRepository";
import { createNotification } from "@/repositories/notificationsRepository";
import { createFile } from "@/repositories/filesRepository";
import { HttpError } from "@/lib/httpErrors";
import { adaptMentorTaskToUi } from "@/lib/mentorAdapters";
import {
  ensureMenteeAssignedToMentor,
  ensureMentorProfile,
} from "@/services/mentorAccessService";

type CreateMentorTaskInput = {
  menteeId: string;
  title: string;
  description?: string | null;
  subjectSlug?: string | null;
  deadline: string;
  materials?: {
    title: string;
    type: "link" | "pdf" | "image";
    url?: string | null;
    fileId?: string | null;
    sourceMaterialId?: string | null;
    file?: {
      bucket: string;
      path: string;
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      checksum?: string | null;
    };
  }[];
};

export async function getPendingFeedbackTasks(mentorId: string) {
  await ensureMentorProfile(mentorId);

  // 1. Fetch Mentor Tasks with submissions
  const mentorTasks = await getTasksWithSubmissionsByMentorId(mentorId);

  // 2. Fetch Mentees to get their IDs for planner tasks
  const mentees = await getMenteesByMentorId(mentorId);
  const menteeIds = mentees.map((m) => m.mentee_id);

  // 3. Fetch Planner Tasks (Self-Study) for all mentees
  // Note: This might be inefficient if loop, but for hackathon ok.
  // Ideally repository should support "list tasks for multiple mentees".
  // implementing loop for now.
  const plannerTasksPromises = menteeIds.map((id) =>
    listPlannerTasksByMenteeId(id),
  );
  const plannerTasksResults = await Promise.all(plannerTasksPromises);
  const allPlannerTasks = plannerTasksResults.flat();

  // 4. Adapt and Filter
  const adaptedMentorTasks = mentorTasks
    .map((t) => {
      const uiTask = adaptMentorTaskToUi(t);
      return {
        ...uiTask,
        type: "mentor_task",
        raw: t,
      };
    })
    .filter((t) => t.status === "submitted"); // Only submitted mentor tasks need feedback

  // For planner tasks, we treat "completed: true" and "mentorComment: null" as pending feedback?
  // Or just list them?
  // Let's assume we want to review completed planner tasks that don't have feedback yet.
  const adaptedPlannerTasks = allPlannerTasks
    .filter((t) => t.completed && !(t as any).mentor_comment)
    .map((t) => ({
      id: t.id,
      title: t.title,
      status: "submitted",
      menteeId: t.mentee_id,
      menteeName:
        mentees.find((m) => m.mentee_id === t.mentee_id)?.mentee?.name ||
        "Unknown",
      menteeAvatarUrl: mentees.find((m) => m.mentee_id === t.mentee_id)?.mentee
        ?.avatar_url,
      deadline: t.date, // Use date as deadline for planner task
      type: "planner_task",
      raw: t,
    }));

  return {
    mentorTasks: adaptedMentorTasks,
    plannerTasks: adaptedPlannerTasks,
    allPending: [...adaptedMentorTasks, ...adaptedPlannerTasks],
  };
}

export async function submitTaskFeedback(
  taskId: string,
  mentorId: string,
  comment: string,
  rating: number,
) {
  const mentorProfile = await ensureMentorProfile(mentorId);

  if (rating < 1 || rating > 5) {
    throw new HttpError(400, "Rating must be between 1 and 5.");
  }

  const task = await getMentorTaskById(taskId);
  if (!task) {
    throw new HttpError(404, "Mentor task not found.");
  }
  if (task.mentor_id !== mentorId) {
    throw new HttpError(403, "Task does not belong to mentor.");
  }

  const result = await createTaskFeedback(taskId, mentorId, { comment, rating });

  try {
    const menteeName = "멘티";
    const mentorName = mentorProfile.name || "멘토";
    await createNotification({
      recipientId: task.mentee_id,
      recipientRole: "mentee",
      type: "feedback_posted",
      refType: "mentor_task",
      refId: task.id,
      title: `${mentorName} 피드백 도착`,
      message: task.title || `${menteeName} 과제`,
      actionUrl: "/feedback",
      actorId: mentorId,
      avatarUrl: mentorProfile.avatar_url ?? null,
      meta: {
        taskId: task.id,
        rating,
      },
    });
  } catch (error) {
    console.error("Failed to create task feedback notification:", error);
  }

  return {
    success: result,
    menteeId: task.mentee_id,
  };
}

export async function submitPlannerTaskFeedback(
  taskId: string,
  mentorId: string,
  comment: string,
) {
  const mentorProfile = await ensureMentorProfile(mentorId);

  const task = await getPlannerTaskById(taskId);
  if (!task) {
    throw new HttpError(404, "Planner task not found.");
  }

  await ensureMenteeAssignedToMentor(mentorId, task.mentee_id);

  const updated = await updatePlannerTask(taskId, { mentorComment: comment });

  try {
    const mentorName = mentorProfile.name || "멘토";
    await createNotification({
      recipientId: task.mentee_id,
      recipientRole: "mentee",
      type: "feedback_posted",
      refType: "planner_task",
      refId: task.id,
      title: `${mentorName} 피드백 도착`,
      message: task.title,
      actionUrl: "/feedback",
      actorId: mentorId,
      avatarUrl: mentorProfile.avatar_url ?? null,
      meta: {
        plannerTaskId: task.id,
      },
    });
  } catch (error) {
    console.error("Failed to create planner feedback notification:", error);
  }

  return {
    task: updated,
    menteeId: task.mentee_id,
  };
}

export async function createMentorTaskForMentee(
  mentorId: string,
  input: CreateMentorTaskInput,
) {
  await ensureMentorProfile(mentorId);

  const menteeProfile = await getProfileById(input.menteeId);
  if (!menteeProfile) {
    throw new HttpError(404, "Mentee profile not found.");
  }
  if (menteeProfile.role !== "mentee") {
    throw new HttpError(403, "Target profile is not a mentee.");
  }

  await ensureMenteeAssignedToMentor(mentorId, input.menteeId);

  let subjectId: string | null = null;
  if (input.subjectSlug) {
    const subject = await getSubjectBySlug(input.subjectSlug);
    if (!subject) {
      throw new HttpError(400, "Subject not found.");
    }
    subjectId = subject.id;
  }

  const deadlineTime = new Date(input.deadline).getTime();
  if (Number.isNaN(deadlineTime)) {
    throw new HttpError(400, "Invalid deadline.");
  }

  const created = await createMentorTask({
    mentor_id: mentorId,
    mentee_id: input.menteeId,
    subject_id: subjectId,
    title: input.title,
    description: input.description ?? null,
    status: "pending",
    deadline: new Date(deadlineTime).toISOString(),
    materials: (input.materials ?? [])
      .filter((material) => material.type === "link")
      .map((material) => ({
        title: material.title,
        url: material.url ?? null,
        type: "link",
      })),
  });

  if (!created) {
    throw new HttpError(500, "Failed to create mentor task.");
  }

  const fileMaterials = (input.materials ?? []).filter(
    (material) => material.type !== "link",
  );

  if (fileMaterials.length > 0) {
    const materialRows: {
      fileId: string;
      sourceMaterialId?: string | null;
    }[] = [];

    for (const material of fileMaterials) {
      let fileId = material.fileId ?? null;
      if (!fileId && material.file) {
        const file = await createFile({
          bucket: material.file.bucket,
          path: material.file.path,
          originalName: material.file.originalName,
          mimeType: material.file.mimeType,
          sizeBytes: material.file.sizeBytes,
          uploaderId: mentorId,
          checksum: material.file.checksum ?? null,
        });
        fileId = file.id;
      }

      if (!fileId) {
        throw new HttpError(400, "Task material file is missing.");
      }

      materialRows.push({
        fileId,
        sourceMaterialId: material.sourceMaterialId ?? null,
      });
    }

    await createMentorTaskMaterials(created.id, materialRows);
  }

  return created;
}
