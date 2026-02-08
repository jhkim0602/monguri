import {
  MentorMentee,
  MentorTask,
  MentorTaskStatus,
} from "@/features/mentor/types";
import { MentorMenteeRow } from "@/repositories/mentorMenteeRepository";
import { MentorTaskRow } from "@/repositories/mentorTasksRepository";

export function adaptMenteeToUi(
  row: Omit<MentorMenteeRow, "mentor"> & {
    mentee: {
      id: string;
      role: "mentor" | "mentee" | "admin";
      name: string | null;
      avatar_url: string | null;
      intro: string | null;
      d_day_date?: string | null;
      d_day_target_date?: string | null;
      dday_date?: string | null;
      target_date?: string | null;
      exam_date?: string | null;
      d_day_label?: string | null;
      d_day_name?: string | null;
      dday_label?: string | null;
      dday_name?: string | null;
      target_label?: string | null;
      exam_label?: string | null;
    } | null;
  },
): MentorMentee {
  const dDayTargetDate =
    row.mentee?.d_day_date ??
    row.mentee?.d_day_target_date ??
    row.mentee?.dday_date ??
    row.mentee?.target_date ??
    row.mentee?.exam_date ??
    null;

  const dDayLabel =
    row.mentee?.d_day_label ??
    row.mentee?.d_day_name ??
    row.mentee?.dday_label ??
    row.mentee?.dday_name ??
    row.mentee?.target_label ??
    row.mentee?.exam_label ??
    "D-day";

  const calculateDDay = (targetDateString?: string | null): number | null => {
    if (!targetDateString) return null;
    const targetDate = new Date(`${targetDateString}T00:00:00`);
    if (Number.isNaN(targetDate.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Math.ceil(
      (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  return {
    id: row.mentee_id,
    name: row.mentee?.name || "이름 없음",
    grade: "고3", // Default or fetch from profile if added
    track: "수능/정시", // Default or fetch
    goal: row.mentee?.intro || "목표가 설정되지 않았습니다.",
    avatarUrl: row.mentee?.avatar_url || undefined,
    dDay: calculateDDay(dDayTargetDate),
    dDayLabel,
    stats: {
      studyHours: 0, // Needs aggregation query
      attendanceRate: "0%", // Needs aggregation query
      tasksCompleted: 0, // Needs aggregation query
    },
  };
}

export function adaptMentorTaskToUi(
  row: MentorTaskRow & {
    mentee?: { id: string; name: string; avatar_url: string | null } | null;
  },
): MentorTask {
  // Handle case where subjects might be an array due to Supabase join
  const subjectData = Array.isArray(row.subjects)
    ? row.subjects[0]
    : row.subjects;

  const latestFeedback = row.task_feedback?.[0];

  return {
    id: row.id,
    menteeId: row.mentee_id,
    subject: subjectData?.name || "기타",
    title: row.title,
    description: row.description || "",
    status: row.status as MentorTaskStatus,
    deadline: new Date(row.deadline || Date.now()),
    hasMentorResponse: Boolean(latestFeedback),
    mentorComment: latestFeedback?.comment || undefined,
    menteeName: row.mentee?.name || "이름 없음",
    menteeAvatarUrl: row.mentee?.avatar_url || undefined,
  };
}
// Unified Task Type for Student Detail Client
export interface StudentDetailTaskUi {
  id: string;
  isMentorTask: boolean;
  title: string;
  description?: string;
  date: Date; // For sorting and display
  deadline?: Date; // Specific to mentor tasks
  completed: boolean;
  categoryId: string; // For coloring (subject slug or id)
  subject: string; // Display name
  timeSpent: number;
  hasMentorResponse?: boolean;
  mentorComment?: string;
  status?: "pending" | "submitted" | "feedback_completed";
  attachments?: {
    id?: string;
    fileId?: string;
    name: string;
    type: "pdf" | "image";
    url?: string | null;
    previewUrl?: string | null;
  }[];
  submissions?: {
    id?: string;
    fileId?: string;
    name: string;
    type: "pdf" | "image";
    url?: string | null;
    previewUrl?: string | null;
  }[];
  submissionNote?: string | null;
  startTime?: string;
  endTime?: string;
}

import { PlannerTaskRow } from "@/repositories/plannerTasksRepository";

export function adaptPlannerTaskToDetailUi(
  row: PlannerTaskRow,
): StudentDetailTaskUi {
  // Handle subject array/object quirks
  const subjectData = Array.isArray(row.subjects)
    ? row.subjects[0]
    : row.subjects;

  return {
    id: row.id,
    isMentorTask: false,
    title: row.title,
    description: row.description || undefined,
    date: new Date(row.date), // Planner tasks use 'date'
    completed: row.completed,
    categoryId: subjectData?.slug || "study",
    subject: subjectData?.name || "자습",
    timeSpent: row.time_spent_sec || 0,
    hasMentorResponse: Boolean(row.mentor_comment),
    mentorComment: row.mentor_comment || undefined,
    startTime: row.start_time || undefined,
    endTime: row.end_time || undefined,
  };
}

export function adaptMentorTaskToDetailUi(
  row: MentorTaskRow,
): StudentDetailTaskUi {
  const isPdf = (mimeType: string | null | undefined, name: string) => {
    const normalized = (mimeType ?? "").toLowerCase();
    if (normalized === "application/pdf") return true;
    return name.toLowerCase().endsWith(".pdf");
  };

  const buildAttachments = () => {
    const materials = row.mentor_task_materials ?? [];
    if (materials.length === 0) return [];

    const sorted = [...materials].sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
    );

    return sorted
      .map((material) => {
        const file = material.file;
        if (!file || file.deleted_at) return null;
        const type: "pdf" | "image" = isPdf(
          file.mime_type,
          file.original_name,
        )
          ? "pdf"
          : "image";

        return {
          id: material.id,
          fileId: material.file_id,
          name: file.original_name || "첨부파일",
          type,
          url: null,
          previewUrl: null,
        };
      })
      .filter(Boolean) as StudentDetailTaskUi["attachments"];
  };

  const buildSubmissions = () => {
    const submissions = row.task_submissions ?? [];
    if (submissions.length === 0) {
      return { files: [], note: null as string | null };
    }

    const latest = [...submissions].sort((a, b) => {
      const aTime = new Date(a.submitted_at).getTime();
      const bTime = new Date(b.submitted_at).getTime();
      return bTime - aTime;
    })[0];

    const files = (latest.task_submission_files ?? [])
      .map((item) => {
        const file = item.file;
        if (!file || file.deleted_at) return null;
        const type: "pdf" | "image" = isPdf(
          file.mime_type,
          file.original_name,
        )
          ? "pdf"
          : "image";
        return {
          id: item.id,
          fileId: item.file_id,
          name: file.original_name || "제출 파일",
          type,
          url: null,
          previewUrl: null,
        };
      })
      .filter(Boolean) as StudentDetailTaskUi["submissions"];

    return { files, note: latest.note ?? null };
  };

  const subjectData = Array.isArray(row.subjects)
    ? row.subjects[0]
    : row.subjects;

  const latestFeedback = row.task_feedback?.[0];
  const submissionData = buildSubmissions();
  const isCompleted =
    row.status === "submitted" || row.status === "feedback_completed";

  return {
    id: row.id,
    isMentorTask: true,
    title: row.title,
    description: row.description || undefined,
    date: new Date(row.deadline || row.created_at), // Use deadline as primary date for sorting
    deadline: row.deadline ? new Date(row.deadline) : undefined,
    completed: isCompleted,
    categoryId: subjectData?.slug || "mentor",
    subject: subjectData?.name || "멘토 과제",
    timeSpent: 0, // Mentor tasks might not track time yet
    hasMentorResponse: Boolean(latestFeedback),
    mentorComment: latestFeedback?.comment || undefined,
    status: row.status,
    attachments: buildAttachments(),
    submissions: submissionData.files,
    submissionNote: submissionData.note,
  };
}
