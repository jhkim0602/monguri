import { HttpError } from "@/lib/httpErrors";
import {
  type PlannerTaskRow,
  createPlannerTask,
  deletePlannerTask,
  getPlannerTaskById,
  listPlannerTasksByMenteeId,
  updatePlannerTask,
} from "@/repositories/plannerTasksRepository";
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

type PlannerTaskAttachment = {
  id: string;
  fileId?: string;
  name: string;
  type: "pdf" | "image";
  url: string | null;
  previewUrl: string | null;
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
  mentorComment: string | null;
  attachments: PlannerTaskAttachment[];
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

const getString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const isPdfAttachment = (
  mimeType: string | null,
  name: string,
  url: string | null,
) => {
  const normalizedMime = (mimeType ?? "").toLowerCase();
  if (normalizedMime === "application/pdf") return true;
  const lowerName = name.toLowerCase();
  if (lowerName.endsWith(".pdf")) return true;
  return (url ?? "").toLowerCase().includes(".pdf");
};

const mapPlannerTaskAttachments = (
  materials: PlannerTaskRow["materials"],
): PlannerTaskAttachment[] => {
  if (!Array.isArray(materials)) return [];

  const mapped: Array<PlannerTaskAttachment | null> = materials.map(
    (material, index): PlannerTaskAttachment | null => {
      if (!material || typeof material !== "object") return null;
      const row = material as Record<string, unknown>;

      const fileId = getString(row.fileId) ?? getString(row.file_id);
      const name =
        getString(row.name) ??
        getString(row.title) ??
        getString(row.originalName) ??
        getString(row.original_name) ??
        `첨부 파일 ${index + 1}`;
      const mimeType = getString(row.mimeType) ?? getString(row.mime_type);
      const explicitType = getString(row.type);
      const givenPreviewUrl =
        getString(row.previewUrl) ?? getString(row.preview_url);
      const givenDownloadUrl =
        getString(row.url) ??
        getString(row.downloadUrl) ??
        getString(row.download_url);

      const type: "pdf" | "image" =
        explicitType === "pdf" || explicitType === "image"
          ? explicitType
          : isPdfAttachment(
                mimeType,
                name,
                givenPreviewUrl ?? givenDownloadUrl,
              )
            ? "pdf"
            : "image";

      const baseUrl = fileId ? `/api/files/${fileId}` : null;
      const previewUrl =
        givenPreviewUrl ??
        (baseUrl ? `${baseUrl}?mode=preview` : type === "image" ? givenDownloadUrl : null);
      const downloadUrl = givenDownloadUrl ?? (baseUrl ? `${baseUrl}?mode=download` : null);

      return {
        id: fileId ?? `planner-material-${index}`,
        fileId: fileId ?? undefined,
        name,
        type,
        url: downloadUrl,
        previewUrl,
      };
    },
  );

  return mapped.filter((item): item is PlannerTaskAttachment => item !== null);
};

const mapPlannerTask = (task: PlannerTaskRow): PlannerTaskResponse => ({
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
  mentorComment: task.mentor_comment,
  attachments: mapPlannerTaskAttachments(task.materials),
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
};

export async function updatePlannerTaskForMentee(
  taskId: string,
  menteeId: string,
  updates: PlannerTaskUpdateInput
) {
  await ensureMenteeProfile(menteeId);

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

  const updated = await updatePlannerTask(taskId, {
    title: updates.title,
    date: updates.date,
    subjectId,
    completed: updates.completed,
    timeSpentSec: updates.timeSpentSec,
    startTime: updates.startTime,
    endTime: updates.endTime,
  });

  if (!updated) {
    throw new HttpError(500, "Failed to update planner task.");
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
