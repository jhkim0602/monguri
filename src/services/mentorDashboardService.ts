import { adaptMenteeToUi } from "@/lib/mentorAdapters";
import { getRecentChatsByMentorId } from "@/repositories/chatRepository";
import { getMenteesByMentorId } from "@/repositories/mentorMenteeRepository";
import { ensureMentorProfile } from "@/services/mentorAccessService";
import { getPendingFeedbackItems } from "@/services/mentorFeedbackService";
import { getMentorMeetingsForScheduleUnchecked } from "@/services/mentorMeetingsService";
import type { MeetingQueryClient } from "@/repositories/meetingRepository";
import type { ChatQueryClient } from "@/repositories/chatRepository";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const toDate = (value: Date | string | number) => {
  if (value instanceof Date) return new Date(value.getTime());
  if (typeof value === "string" && DATE_ONLY_PATTERN.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
};

const toDateKey = (value: Date | string | number) => {
  if (typeof value === "string" && DATE_ONLY_PATTERN.test(value)) return value;
  const date = toDate(value);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const hasUploadedSelfStudyFile = (materials: any): boolean => {
  if (!Array.isArray(materials) || materials.length === 0) return false;

  return materials.some((file: any) => {
    if (!file || typeof file !== "object") return false;

    const rawType = String(
      file.type ?? file.fileType ?? file.mime_type ?? file.mimeType ?? "",
    ).toLowerCase();
    if (
      rawType === "pdf" ||
      rawType === "image" ||
      rawType === "application/pdf" ||
      rawType.startsWith("image/")
    ) {
      return true;
    }

    const rawPath = String(
      file.url ?? file.previewUrl ?? file.path ?? file.name ?? file.title ?? "",
    ).toLowerCase();

    return /\.(pdf|png|jpe?g|gif|webp|bmp|heic|heif|svg)(\?|$)/.test(rawPath);
  });
};

export async function getMentorDashboardData(
  mentorId: string,
  options?: {
    meetingsClient?: MeetingQueryClient;
    chatsClient?: ChatQueryClient;
  },
) {
  const mentorProfile = await ensureMentorProfile(mentorId);

  const menteesData = await getMenteesByMentorId(mentorId);

  const [recentChatsResult, pendingFeedbackResult, meetingsResult] =
    await Promise.allSettled([
      getRecentChatsByMentorId(mentorId, 5, options?.chatsClient),
      getPendingFeedbackItems(mentorId),
      getMentorMeetingsForScheduleUnchecked(mentorId, options?.meetingsClient),
    ]);

  if (recentChatsResult.status === "rejected") {
    console.error("Dashboard recentChats query failed:", recentChatsResult.reason);
  }
  if (pendingFeedbackResult.status === "rejected") {
    console.error(
      "Dashboard pendingFeedback query failed:",
      pendingFeedbackResult.reason,
    );
  }
  if (meetingsResult.status === "rejected") {
    console.error(
      "Dashboard upcomingMeetings query failed:",
      meetingsResult.reason,
    );
  }

  const recentChatsRaw =
    recentChatsResult.status === "fulfilled" ? recentChatsResult.value : [];
  const pendingFeedbackItems =
    pendingFeedbackResult.status === "fulfilled"
      ? pendingFeedbackResult.value
      : [];

  // Keep dashboard feedback counts/list aligned with mentor-feedback inbox logic.
  const taskItems = pendingFeedbackItems.filter((item) => item.type === "task");
  const rawPlanItems = pendingFeedbackItems.filter((item) => item.type === "plan");

  const groupedPlans = new Map<string, (typeof rawPlanItems)[number][]>();
  rawPlanItems
    .filter((item) => item.data?.__planEligible !== false)
    .forEach((item) => {
      const key = `${item.studentId}-${toDateKey(item.data?.date ?? item.date)}`;
      const list = groupedPlans.get(key) ?? [];
      list.push(item);
      groupedPlans.set(key, list);
    });

  const planItems = Array.from(groupedPlans.entries()).map(
    ([groupKey, groupedItems]) => {
      const first = groupedItems[0];
      const planDate = toDate(first.data?.date ?? first.date);
      const plannerTasks = groupedItems
        .map((row) => row.data)
        .filter((row) => !row?.__isVirtualPlanRow);

      return {
        id: `plan-${groupKey}`,
        type: "plan" as const,
        studentId: first.studentId,
        studentName: first.studentName,
        avatarUrl: first.avatarUrl ?? null,
        title: `${planDate.getMonth() + 1}월 ${planDate.getDate()}일 플래너`,
        subtitle:
          plannerTasks.length > 0
            ? `완료한 할 일 ${plannerTasks.length}개`
            : "멘티 일일 코멘트",
        date: planDate,
        status: "submitted" as const,
      };
    },
  );

  const selfItems = rawPlanItems
    .filter(
      (item) =>
        !item.data?.is_mentor_task &&
        hasUploadedSelfStudyFile(item.data?.materials),
    )
    .map((item) => ({
      id: `self-${item.id}`,
      type: "self" as const,
      studentId: item.studentId,
      studentName: item.studentName,
      avatarUrl: item.avatarUrl ?? null,
      title: item.data?.title || item.title || "자습 할 일",
      subtitle: item.data?.subjects?.name || item.subtitle || "자습",
      date: toDate(item.date),
      status:
        item.data?.mentor_comment || item.data?.mentorComment
          ? ("reviewed" as const)
          : item.status,
    }));

  const inboxPendingItems = [...taskItems, ...planItems, ...selfItems]
    .filter((item) => item.status !== "reviewed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const upcomingMeetingsRaw =
    meetingsResult.status === "fulfilled"
      ? meetingsResult.value.upcomingMeetings
      : [];

  const mentees = menteesData.map(adaptMenteeToUi);
  const recentChats = recentChatsRaw
    .map((row) => {
      const latestMessage = row.chat_messages?.[0] ?? null;
      const preview = latestMessage
        ? latestMessage.body?.trim()
          ? latestMessage.body
          : latestMessage.message_type === "image"
            ? "이미지를 전송했습니다."
            : latestMessage.message_type === "file"
              ? "파일을 전송했습니다."
              : "메시지를 보냈습니다."
        : "대화 내역이 없습니다.";

      return {
        id: row.id,
        menteeName: row.mentee?.name || "멘티",
        menteeAvatarUrl: row.mentee?.avatar_url || null,
        lastMessage: preview,
        lastMessageAt: latestMessage?.created_at || null,
        unreadCount: 0,
      };
    })
    .sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });

  const recentFeedback = inboxPendingItems.slice(0, 5).map((item) => ({
    id: String(item.id),
    type: item.type,
    title: item.title,
    subtitle:
      item.subtitle || (item.type === "task" ? "과제 제출" : item.type === "plan" ? "플래너" : "자습"),
    studentName: item.studentName,
    studentAvatarUrl: item.avatarUrl ?? null,
    date:
      item.date instanceof Date
        ? item.date.toISOString()
        : new Date(item.date).toISOString(),
    status: item.status,
  }));

  const upcomingMeetings = upcomingMeetingsRaw.map((meeting) => ({
    id: meeting.id,
    studentName: meeting.studentName,
    topic: meeting.topic,
    confirmedTime: meeting.confirmed_time,
    zoomLink: meeting.zoom_link,
    mentorNote: meeting.mentor_note,
    source: meeting.source,
  }));

  return {
    mentorName: mentorProfile.name || "멘토",
    mentees,
    recentActivity: [], // Dashboard currently doesn't render this
    recentChats,
    recentFeedback,
    upcomingMeetings,
    stats: {
      totalMentees: mentees.length,
      pendingFeedback: inboxPendingItems.length,
      activeAlerts: 0, // Placeholder for alerts logic
    },
  };
}
