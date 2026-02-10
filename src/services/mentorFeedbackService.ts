import { getTasksWithSubmissionsByMentorId } from "@/repositories/mentorTasksRepository";
import { getCompletedPlannerTasksByMentorId } from "@/repositories/plannerTasksRepository";
import { listPendingDailyCommentsByMentorId } from "@/repositories/dailyRecordsRepository";

export type FeedbackItem = {
  id: string;
  type: "task" | "plan" | "self";
  studentId: string;
  studentName: string;
  avatarUrl?: string; // Add avatarUrl
  title: string;
  subtitle?: string;
  date: Date;
  status: "pending" | "completed" | "reviewed" | "submitted";
  isUrgent?: boolean;
  data: any;
};

const pickLatestSubmission = (submissions: any[] | null | undefined) => {
  if (!Array.isArray(submissions) || submissions.length === 0) return null;

  return [...submissions].sort((a, b) => {
    const aTime = new Date(a?.submitted_at ?? 0).getTime();
    const bTime = new Date(b?.submitted_at ?? 0).getTime();
    return bTime - aTime;
  })[0];
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toDateKey = (value: unknown): string | null => {
  if (typeof value === "string" && DATE_ONLY_PATTERN.test(value)) {
    return value;
  }

  if (value === null || value === undefined) return null;

  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;

  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const hasReviewedTaskFeedback = (taskFeedback: any[] | null | undefined) => {
  if (!Array.isArray(taskFeedback) || taskFeedback.length === 0) return false;

  return taskFeedback.some((feedback) => {
    const status = String(feedback?.status ?? "").toLowerCase();
    const comment =
      typeof feedback?.comment === "string" ? feedback.comment.trim() : "";
    return status === "reviewed" && comment.length > 0;
  });
};

export async function getPendingFeedbackItems(
  mentorId: string,
): Promise<FeedbackItem[]> {
  // 1. Fetch pending tasks (submitted by mentee, no mentor feedback yet)
  const [taskRows, planRows, pendingDailyCommentRows] = await Promise.all([
    getTasksWithSubmissionsByMentorId(mentorId),
    getCompletedPlannerTasksByMentorId(mentorId),
    listPendingDailyCommentsByMentorId(mentorId),
  ]);

  const pendingTaskRows = taskRows.filter((row) => {
    if (row.status !== "submitted") return false;
    return !hasReviewedTaskFeedback(row.task_feedback);
  });

  const taskItems: FeedbackItem[] = pendingTaskRows.map((row) => {
    const latestSubmission = pickLatestSubmission(row.task_submissions);

    return {
      id: `task-${row.id}`,
      type: "task",
      studentId: row.mentee_id,
      studentName: row.mentee?.name || "알 수 없음",
      avatarUrl: row.mentee?.avatar_url || undefined,
      title: row.title,
      subtitle: row.subjects?.name || "기타",
      date: new Date(latestSubmission?.submitted_at || row.created_at),
      status: row.status === "feedback_completed" ? "reviewed" : row.status,
      data: {
        ...row,
        submissionNote:
          typeof latestSubmission?.note === "string"
            ? latestSubmission.note
            : null,
        submissions:
          row.task_submissions?.flatMap((submission) => {
            const files = submission.task_submission_files ?? [];
            if (files.length === 0) {
              return [
                {
                  name: `제출 파일 (${new Date(submission.submitted_at).toLocaleDateString()})`,
                  fileId: "",
                  type: "file",
                },
              ];
            }

            return files.map((item) => {
              const file = item.file;
              const mimeType = file?.mime_type ?? "";
              const isPdf =
                mimeType === "application/pdf" ||
                (file?.original_name ?? "").toLowerCase().endsWith(".pdf");
              return {
                name: file?.original_name ?? "첨부 파일",
                fileId: item.file_id,
                type: isPdf ? "pdf" : "image",
              };
            });
          }) ?? [],
      },
    };
  });

  const pendingCommentByKey = new Map<string, (typeof pendingDailyCommentRows)[number]>();
  pendingDailyCommentRows.forEach((row) => {
    const dateKey = toDateKey(row.date);
    if (!dateKey) return;
    pendingCommentByKey.set(`${row.mentee_id}-${dateKey}`, row);
  });

  const annotatedPlanRows = planRows.map((row) => {
    const dateKey = toDateKey(row.date);
    const key = `${row.mentee_id}-${dateKey ?? row.date}`;
    const pendingComment = pendingCommentByKey.get(key);
    return {
      ...row,
      __planEligible: Boolean(pendingComment),
      __dailyComment: pendingComment?.mentee_comment ?? null,
      __isVirtualPlanRow: false,
    };
  });

  const existingPlanKeys = new Set<string>();
  annotatedPlanRows.forEach((row) => {
    const dateKey = toDateKey(row.date);
    if (!dateKey) return;
    existingPlanKeys.add(`${row.mentee_id}-${dateKey}`);
  });

  const virtualPlanRows = pendingDailyCommentRows
    .filter((row) => {
      const dateKey = toDateKey(row.date);
      if (!dateKey) return false;
      return !existingPlanKeys.has(`${row.mentee_id}-${dateKey}`);
    })
    .map((row) => ({
      id: `daily-comment-${row.id}`,
      mentee_id: row.mentee_id,
      subject_id: null,
      title: "일일 코멘트",
      description: null,
      date: row.date,
      completed: true,
      time_spent_sec: 0,
      start_time: null,
      end_time: null,
      recurring_group_id: null,
      is_mentor_task: false,
      materials: [],
      mentor_comment: null,
      created_at: new Date(row.date).toISOString(),
      subjects: null,
      mentee: row.mentee,
      __planEligible: true,
      __dailyComment: row.mentee_comment,
      __isVirtualPlanRow: true,
    }));

  const allPlanRows = [...annotatedPlanRows, ...virtualPlanRows];

  const planItems: FeedbackItem[] = allPlanRows.map((row) => ({
    id: `plan-${row.id}`,
    type: "plan",
    studentId: row.mentee?.id ?? row.mentee_id,
    studentName: row.mentee?.name || "알 수 없음",
    avatarUrl: row.mentee?.avatar_url || undefined,
    title: row.title,
    subtitle: row.subjects?.name || "개인 학습",
    date: new Date(row.date),
    status: "submitted", // Treat completed plans as submitted for review
    data: row,
  }));

  // Sort by date descending (newest first)
  return [...taskItems, ...planItems].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}
