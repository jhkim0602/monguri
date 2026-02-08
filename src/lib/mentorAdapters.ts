import {
  MentorMentee,
  MentorTask,
  MentorTaskStatus,
} from "@/features/mentor/types";
import { MentorMenteeRow } from "@/repositories/mentorMenteeRepository";
import { MentorTaskRow } from "@/repositories/mentorTasksRepository";

function calculateDDay(targetDate: string | null | undefined): number | null {
  if (!targetDate) return null;

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function adaptMenteeToUi(
  row: Omit<MentorMenteeRow, "mentor"> & {
    mentee: {
      id: string;
      role: "mentor" | "mentee" | "admin";
      name: string | null;
      avatar_url: string | null;
      intro: string | null;
      goal?: string | null;
      target_exam?: string | null;
      target_date?: string | null;
      grade?: string | null;
    } | null;
  },
): MentorMentee {
  const mentee = row.mentee;
  return {
    id: row.mentee_id,
    name: mentee?.name || "이름 없음",
    grade: mentee?.grade || "고3",
    track: "수능/정시",
    goal: mentee?.goal || mentee?.intro || "목표가 설정되지 않았습니다.",
    targetExam: mentee?.target_exam || undefined,
    targetDate: mentee?.target_date || null,
    dDay: calculateDDay(mentee?.target_date),
    avatarUrl: mentee?.avatar_url || undefined,
    stats: {
      studyHours: 0,
      attendanceRate: "0%",
      tasksCompleted: 0,
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
