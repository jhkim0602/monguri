import { HttpError } from "@/lib/httpErrors";
import {
  createPlannerTask,
  deletePlannerTask,
  getPlannerTaskById,
  listPlannerTasksByMenteeId,
  updatePlannerTask,
} from "@/repositories/plannerTasksRepository";
import { createFile } from "@/repositories/filesRepository";
import { getMentorByMenteeId } from "@/repositories/mentorMenteeRepository";
import { createNotification } from "@/repositories/notificationsRepository";
import { getProfileById } from "@/repositories/profilesRepository";
import { getSubjectBySlug } from "@/repositories/subjectsRepository";

const ensureMenteeProfile = async (menteeId: string) => {
  const profile = await getProfileById(menteeId);
  if (!profile) {
    throw new HttpError(404, "Mentee profile not found.");
  }
  if (profile.role !== "mentee") {
    throw new HttpError(403, "Profile is not a mentee.");
  }
  return profile;
};

type PlannerTaskSubject = {
  id: string;
  slug: string;
  name: string;
  colorHex: string | null;
  textColorHex: string | null;
};

type PlannerTaskResponse = {
  id: string;
  menteeId: string;
  subject: PlannerTaskSubject | null;
  title: string;
  description: string | null;
  date: string;
  completed: boolean;
  timeSpentSec: number | null;
  startTime: string | null;
  endTime: string | null;
  isMentorTask: boolean;
  materials: any[] | null;
  mentorComment: string | null;
  createdAt: string;
  recurringGroupId?: string | null;
};

const mapSubject = (subject: {
  id: string;
  slug: string;
  name: string;
  color_hex: string | null;
  text_color_hex: string | null;
} | null): PlannerTaskSubject | null => {
  if (!subject) return null;
  return {
    id: subject.id,
    slug: subject.slug,
    name: subject.name,
    colorHex: subject.color_hex,
    textColorHex: subject.text_color_hex,
  };
};

const mapPlannerTask = (task: {
  id: string;
  mentee_id: string;
  title: string;
  description: string | null;
  date: string;
  completed: boolean;
  time_spent_sec: number | null;
  start_time: string | null;
  end_time: string | null;
  is_mentor_task: boolean;
  materials?: any[] | null;
  mentor_comment: string | null;
  created_at: string;
  recurring_group_id?: string | null;
  subjects: {
    id: string;
    slug: string;
    name: string;
    color_hex: string | null;
    text_color_hex: string | null;
  } | null;
}): PlannerTaskResponse => ({
  id: task.id,
  menteeId: task.mentee_id,
  subject: mapSubject(task.subjects),
  title: task.title,
  description: task.description,
  date: task.date,
  completed: task.completed,
  timeSpentSec: task.time_spent_sec,
  startTime: task.start_time,
  endTime: task.end_time,
  isMentorTask: task.is_mentor_task,
  materials: Array.isArray(task.materials) ? task.materials : null,
  mentorComment: task.mentor_comment,
  createdAt: task.created_at,
  recurringGroupId: task.recurring_group_id,
});

type PlannerTaskFilters = {
  date?: string;
  from?: string;
  to?: string;
};

export async function getPlannerTasksForMentee(
  menteeId: string,
  filters: PlannerTaskFilters = {}
) {
  await ensureMenteeProfile(menteeId);
  const tasks = await listPlannerTasksByMenteeId(menteeId, filters);

  return {
    menteeId,
    tasks: tasks.map(mapPlannerTask),
  };
}

export async function getPlannerTaskForMentee(
  taskId: string,
  menteeId: string
) {
  await ensureMenteeProfile(menteeId);
  const task = await getPlannerTaskById(taskId);

  if (!task) {
    throw new HttpError(404, "Planner task not found.");
  }
  if (task.mentee_id !== menteeId) {
    throw new HttpError(403, "Planner task does not belong to mentee.");
  }

  return mapPlannerTask(task);
}

type PlannerTaskCreateInput = {
  title: string;
  date: string;
  subjectSlug?: string | null;
  completed?: boolean;
  timeSpentSec?: number | null;
  startTime?: string | null;
  endTime?: string | null;
};

export async function createPlannerTaskForMentee(
  menteeId: string,
  input: PlannerTaskCreateInput
) {
  await ensureMenteeProfile(menteeId);

  let subjectId: string | null = null;
  if (input.subjectSlug) {
    const subject = await getSubjectBySlug(input.subjectSlug);
    if (!subject) {
      throw new HttpError(400, "Subject not found.");
    }
    subjectId = subject.id;
  }

  const created = await createPlannerTask({
    menteeId,
    subjectId,
    title: input.title,
    date: input.date,
    completed: input.completed,
    timeSpentSec: input.timeSpentSec,
    startTime: input.startTime,
    endTime: input.endTime,
  });

  if (!created) {
    throw new HttpError(500, "Failed to create planner task.");
  }

  return mapPlannerTask(created);
}

type PlannerTaskUpdateInput = {
  title?: string;
  date?: string;
  subjectSlug?: string | null;
  completed?: boolean;
  timeSpentSec?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  studyNote?: string | null;
  attachments?: {
    bucket: string;
    path: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    checksum?: string | null;
  }[];
  materials?: any[] | null;
};

const isAllowedAttachment = (mimeType: string, name: string) => {
  const normalized = (mimeType || "").toLowerCase();
  if (normalized === "application/pdf") return true;
  if (normalized.startsWith("image/")) return true;
  return name.toLowerCase().endsWith(".pdf");
};

const resolveAttachmentType = (
  mimeType: string,
  name: string,
): "pdf" | "image" => {
  const normalized = (mimeType || "").toLowerCase();
  if (normalized === "application/pdf" || name.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  return "image";
};

export async function updatePlannerTaskForMentee(
  taskId: string,
  menteeId: string,
  updates: PlannerTaskUpdateInput
) {
  const menteeProfile = await ensureMenteeProfile(menteeId);

  const existing = await getPlannerTaskById(taskId);
  if (!existing) {
    throw new HttpError(404, "Planner task not found.");
  }
  if (existing.mentee_id !== menteeId) {
    throw new HttpError(403, "Planner task does not belong to mentee.");
  }

  let subjectId: string | null | undefined = undefined;
  if (updates.subjectSlug !== undefined) {
    if (updates.subjectSlug === null) {
      subjectId = null;
    } else {
      const subject = await getSubjectBySlug(updates.subjectSlug);
      if (!subject) {
        throw new HttpError(400, "Subject not found.");
      }
      subjectId = subject.id;
    }
  }

  const hasStudyRecordPayload =
    updates.attachments !== undefined ||
    updates.studyNote !== undefined ||
    updates.materials !== undefined;

  let nextMaterials: any[] | null | undefined = undefined;

  if (hasStudyRecordPayload) {
    const sourceMaterials =
      updates.materials !== undefined
        ? Array.isArray(updates.materials)
          ? updates.materials
          : []
        : Array.isArray(existing.materials)
          ? existing.materials
          : [];

    const fileMaterials = sourceMaterials.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.type !== "note" &&
        typeof item.note !== "string",
    );

    const createdMaterials = [...fileMaterials];

    for (const attachment of updates.attachments ?? []) {
      if (!isAllowedAttachment(attachment.mimeType, attachment.originalName)) {
        throw new HttpError(400, "Invalid attachment type.");
      }

      const file = await createFile({
        bucket: attachment.bucket,
        path: attachment.path,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        uploaderId: menteeId,
        checksum: attachment.checksum ?? null,
      });

      createdMaterials.push({
        fileId: file.id,
        name: file.original_name,
        type: resolveAttachmentType(file.mime_type, file.original_name),
        bucket: file.bucket,
        path: file.path,
        mimeType: file.mime_type,
        sizeBytes: file.size_bytes,
        uploadedAt: file.created_at,
      });
    }

    const existingNote = sourceMaterials.find(
      (item) =>
        item &&
        typeof item === "object" &&
        (item.type === "note" || typeof item.note === "string"),
    );

    const resolvedNote =
      updates.studyNote !== undefined
        ? updates.studyNote?.trim() || null
        : typeof existingNote?.note === "string"
          ? existingNote.note.trim() || null
          : null;

    nextMaterials = [...createdMaterials];
    if (resolvedNote) {
      nextMaterials.push({
        type: "note",
        note: resolvedNote,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  const nextCompleted =
    updates.completed !== undefined
      ? updates.completed
      : hasStudyRecordPayload
        ? true
        : undefined;

  const updated = await updatePlannerTask(taskId, {
    title: updates.title,
    date: updates.date,
    subjectId,
    completed: nextCompleted,
    timeSpentSec: updates.timeSpentSec,
    startTime: updates.startTime,
    endTime: updates.endTime,
    materials: nextMaterials,
  });

  if (!updated) {
    throw new HttpError(500, "Failed to update planner task.");
  }

  if (nextCompleted === true && !existing.completed) {
    try {
      const mentorPair = await getMentorByMenteeId(menteeId);
      const mentorId = mentorPair?.mentor?.id ?? null;
      if (mentorId) {
        const menteeName = menteeProfile.name || "멘티";
        const itemId = `plan-${updated.id}`;
        await createNotification({
          recipientId: mentorId,
          recipientRole: "mentor",
          type: "plan_submitted",
          refType: "planner_task",
          refId: updated.id,
          title: `${menteeName} 플래너 제출`,
          message: updated.title,
          actionUrl: `/mentor-feedback?itemId=${encodeURIComponent(itemId)}`,
          actorId: menteeId,
          avatarUrl: menteeProfile.avatar_url ?? null,
          meta: {
            plannerTaskId: updated.id,
            date: updated.date,
          },
        });
      }
    } catch (error) {
      console.error("Failed to create planner submission notification:", error);
    }
  }

  return mapPlannerTask(updated);
}

export async function deletePlannerTaskForMentee(
  taskId: string,
  menteeId: string
) {
  await ensureMenteeProfile(menteeId);

  const existing = await getPlannerTaskById(taskId);
  if (!existing) {
    throw new HttpError(404, "Planner task not found.");
  }
  if (existing.mentee_id !== menteeId) {
    throw new HttpError(403, "Planner task does not belong to mentee.");
  }

  const deleted = await deletePlannerTask(taskId);
  if (!deleted) {
    throw new HttpError(500, "Failed to delete planner task.");
  }

  return { id: deleted.id };
}
