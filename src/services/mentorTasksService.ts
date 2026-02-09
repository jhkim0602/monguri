import { HttpError } from "@/lib/httpErrors";

type TaskAttachment = {
  id: string;
  fileId: string;
  name: string;
  type: "pdf" | "image";
  url: string | null;
  previewUrl: string | null;
  sourceMaterialId?: string | null;
};

const isPdf = (mimeType: string | null | undefined, name: string) => {
  const normalized = (mimeType ?? "").toLowerCase();
  if (normalized === "application/pdf") return true;
  return name.toLowerCase().endsWith(".pdf");
};

async function buildTaskAttachments(
  materials: {
    id: string;
    file_id: string;
    source_material_id: string | null;
    sort_order: number;
    file: {
      bucket: string;
      path: string;
      original_name: string;
      mime_type: string;
      deleted_at: string | null;
    } | null;
  }[] | null,
): Promise<TaskAttachment[]> {
  if (!materials || materials.length === 0) return [];

  const sorted = [...materials].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  const items = sorted.map((material) => {
    const file = material.file;
    if (!file || file.deleted_at) return null;

    const type: "pdf" | "image" = isPdf(file.mime_type, file.original_name)
      ? "pdf"
      : "image";
    const baseUrl = `/api/files/${material.file_id}`;

    return {
      id: material.id,
      fileId: material.file_id,
      name: file.original_name || "첨부파일",
      type,
      url: `${baseUrl}?mode=download`,
      previewUrl: type === "image" ? `${baseUrl}?mode=preview` : null,
      sourceMaterialId: material.source_material_id ?? null,
    };
  });

  return items.filter(Boolean) as TaskAttachment[];
}

function buildSubmissionAttachments(
  submissions:
    | {
        submitted_at: string;
        note: string | null;
        task_submission_files:
          | {
              file_id: string;
              file: {
                original_name: string;
                mime_type: string;
                deleted_at: string | null;
              } | null;
            }[]
          | null;
      }[]
    | null,
) {
  if (!submissions || submissions.length === 0) {
    return {
      attachments: [] as TaskAttachment[],
      note: null as string | null,
      submittedAt: null as string | null,
    };
  }

  const latest = [...submissions].sort((a, b) => {
    const aTime = new Date(a.submitted_at).getTime();
    const bTime = new Date(b.submitted_at).getTime();
    return bTime - aTime;
  })[0];

  const files = latest.task_submission_files ?? [];
  const attachments = files
    .map((item) => {
      const file = item.file;
      if (!file || file.deleted_at) return null;
      const type: "pdf" | "image" = isPdf(file.mime_type, file.original_name)
        ? "pdf"
        : "image";
      return {
        id: item.file_id,
        fileId: item.file_id,
        name: file.original_name || "제출 파일",
        type,
        url: null,
        previewUrl: null,
      };
    })
    .filter(Boolean) as TaskAttachment[];

  return {
    attachments,
    note: latest.note ?? null,
    submittedAt: latest.submitted_at ?? null,
  };
}
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

  const mappedTasks = await Promise.all(
    tasks.map(async (task) => {
      const latestSubmission = pickLatest(task.task_submissions, "submitted_at");
      const latestFeedback = pickLatest(task.task_feedback, "created_at");
      const attachments = await buildTaskAttachments(task.mentor_task_materials);
      const submissionData = buildSubmissionAttachments(task.task_submissions);

      return {
        id: task.id,
        mentorId: task.mentor_id,
        menteeId: task.mentee_id,
        subject: task.subjects
          ? {
              id: task.subjects.id,
              slug: task.subjects.slug,
              name: task.subjects.name,
              colorHex: task.subjects.color_hex,
              textColorHex: task.subjects.text_color_hex,
            }
          : null,
        title: task.title,
        description: task.description,
        status: task.status,
        deadline: task.deadline,
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
              isRead: Boolean(latestFeedback.is_read),
              readAt: latestFeedback.read_at ?? null,
              createdAt: latestFeedback.created_at,
            }
          : null,
        hasMentorResponse: Boolean(latestFeedback),
        attachments,
        submissions: submissionData.attachments,
        submissionNote: submissionData.note,
        submittedAt: submissionData.submittedAt,
      };
    }),
  );

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
