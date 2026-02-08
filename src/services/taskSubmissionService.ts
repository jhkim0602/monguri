import { HttpError } from "@/lib/httpErrors";
import {
  getMentorTaskById,
  updateMentorTaskStatus,
} from "@/repositories/mentorTasksRepository";
import { getProfileById } from "@/repositories/profilesRepository";
import {
  createTaskSubmission,
  createTaskSubmissionFiles,
} from "@/repositories/taskSubmissionsRepository";
import { createFile } from "@/repositories/filesRepository";
import { createNotification } from "@/repositories/notificationsRepository";

type AttachmentMetaInput = {
  bucket: string;
  path: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string | null;
};

const isAllowedAttachment = (mimeType: string, name: string) => {
  const normalized = mimeType.toLowerCase();
  if (normalized === "application/pdf") return true;
  if (normalized.startsWith("image/")) return true;
  return name.toLowerCase().endsWith(".pdf");
};

export async function createMenteeTaskSubmission(
  taskId: string,
  menteeId: string,
  note: string | null,
  attachments: AttachmentMetaInput[]
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

  if (!attachments || attachments.length === 0) {
    throw new HttpError(400, "At least one attachment is required.");
  }

  for (const attachment of attachments) {
    if (!isAllowedAttachment(attachment.mimeType, attachment.originalName)) {
      throw new HttpError(400, "Invalid attachment type.");
    }
  }

  const submission = await createTaskSubmission(taskId, menteeId, note);

  const fileIds: string[] = [];
  for (const attachment of attachments) {
    const file = await createFile({
      bucket: attachment.bucket,
      path: attachment.path,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      uploaderId: menteeId,
      checksum: attachment.checksum ?? null,
    });
    fileIds.push(file.id);
  }

  await createTaskSubmissionFiles(submission.id, fileIds);

  if (task.status !== "submitted") {
    await updateMentorTaskStatus(taskId, "submitted");
  }

  try {
    const menteeName = profile.name || "멘티";
    const itemId = `task-${task.id}`;
    await createNotification({
      recipientId: task.mentor_id,
      recipientRole: "mentor",
      type: "task_submitted",
      refType: "mentor_task",
      refId: task.id,
      title: `${menteeName} 과제 제출`,
      message: task.title,
      actionUrl: `/mentor-feedback?itemId=${encodeURIComponent(itemId)}`,
      actorId: menteeId,
      avatarUrl: profile.avatar_url ?? null,
      meta: {
        taskId: task.id,
        submissionId: submission.id,
      },
    });
  } catch (error) {
    console.error("Failed to create task submission notification:", error);
  }

  return {
    submission: {
      id: submission.id,
      taskId: submission.task_id,
      menteeId: submission.mentee_id,
      submittedAt: submission.submitted_at,
      note: submission.note,
      attachments: fileIds.map((fileId) => ({ fileId })),
    },
    taskStatus: "submitted",
  };
}
