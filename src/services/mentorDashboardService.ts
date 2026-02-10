import { adaptMenteeToUi } from "@/lib/mentorAdapters";
import { supabaseServer } from "@/lib/supabaseServer";
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

type MeetingProtocolType =
  | "meeting_request"
  | "meeting_confirmed"
  | "meeting_scheduled";

type MeetingProtocolRef = {
  type: MeetingProtocolType;
  id: string;
};

type MeetingRequestPreviewRow = {
  id: string;
  preferred_times: string[] | null;
  confirmed_time: string | null;
};

type MentorMeetingPreviewRow = {
  id: string;
  confirmed_time: string | null;
};

const parseMeetingProtocolRef = (value: string | null | undefined) => {
  if (!value) return null;
  const body = value.trim();
  if (!body) return null;

  const parse = (
    prefix: string,
    type: MeetingProtocolType,
  ): MeetingProtocolRef | null => {
    if (!body.startsWith(prefix)) return null;
    const id = body.slice(prefix.length).trim();
    if (!id) return null;
    return { type, id };
  };

  return (
    parse("MEETING_REQUEST:", "meeting_request") ??
    parse("MEETING_CONFIRMED:", "meeting_confirmed") ??
    parse("MENTOR_MEETING:", "meeting_scheduled")
  );
};

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;

const formatMonthDay = (value: Date) =>
  `${value.getMonth() + 1}/${value.getDate()}`;

const formatMonthDayWithWeekday = (value: Date) =>
  `${formatMonthDay(value)}(${DAY_NAMES[value.getDay()]})`;

const formatHourMinute = (value: Date) => {
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
};

const formatMeetingRequestPreview = (row?: MeetingRequestPreviewRow | null) => {
  const slots = (row?.preferred_times ?? [])
    .map((value) => new Date(value))
    .filter(isValidDate)
    .sort((a, b) => a.getTime() - b.getTime());

  if (slots.length === 0) {
    return "[상담 요청] 가능 시간 확인";
  }

  if (slots.length === 1) {
    return `[상담 요청] ${formatMonthDayWithWeekday(slots[0])} ${formatHourMinute(slots[0])}`;
  }

  const uniqueDayCount = new Set(slots.map((date) => toDateKey(date))).size;
  if (uniqueDayCount === 1) {
    return `[상담 요청] ${formatMonthDayWithWeekday(slots[0])} 가능 시간 ${slots.length}개`;
  }

  return `[상담 요청] ${formatMonthDay(slots[0])}~${formatMonthDay(
    slots[slots.length - 1],
  )} 가능 시간 ${slots.length}개`;
};

const formatMeetingConfirmedPreview = (
  row?: MeetingRequestPreviewRow | null,
) => {
  const confirmed = row?.confirmed_time ? new Date(row.confirmed_time) : null;
  if (confirmed && isValidDate(confirmed)) {
    return `[상담 확정] ${formatMonthDayWithWeekday(confirmed)} ${formatHourMinute(confirmed)}`;
  }
  return "[상담 확정] 일정 확인";
};

const formatMentorMeetingPreview = (row?: MentorMeetingPreviewRow | null) => {
  const confirmed = row?.confirmed_time ? new Date(row.confirmed_time) : null;
  if (confirmed && isValidDate(confirmed)) {
    return `[멘토 일정] ${formatMonthDayWithWeekday(confirmed)} ${formatHourMinute(confirmed)}`;
  }
  return "[멘토 일정] 일정 확인";
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
    console.error(
      "Dashboard recentChats query failed:",
      recentChatsResult.reason,
    );
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
  const rawPlanItems = pendingFeedbackItems.filter(
    (item) => item.type === "plan",
  );

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

  const meetingRequestIds = new Set<string>();
  const mentorMeetingIds = new Set<string>();

  recentChatsRaw.forEach((row) => {
    const latestMessage = row.chat_messages?.[0] ?? null;
    const protocol = parseMeetingProtocolRef(latestMessage?.body);
    if (!protocol) return;

    if (protocol.type === "meeting_scheduled") {
      mentorMeetingIds.add(protocol.id);
      return;
    }

    meetingRequestIds.add(protocol.id);
  });

  const meetingQueryClient = options?.meetingsClient ?? supabaseServer;
  const meetingRequestById = new Map<string, MeetingRequestPreviewRow>();
  const mentorMeetingById = new Map<string, MentorMeetingPreviewRow>();

  if (meetingRequestIds.size > 0) {
    const { data, error } = await meetingQueryClient
      .from("meeting_requests")
      .select("id, preferred_times, confirmed_time")
      .in("id", Array.from(meetingRequestIds));

    if (error) {
      console.error(
        "Dashboard meeting_request preview query failed:",
        error.message,
      );
    } else {
      (data ?? []).forEach((row: any) => {
        if (!row?.id) return;
        meetingRequestById.set(String(row.id), {
          id: String(row.id),
          preferred_times: Array.isArray(row.preferred_times)
            ? row.preferred_times
            : null,
          confirmed_time:
            typeof row.confirmed_time === "string" ? row.confirmed_time : null,
        });
      });
    }
  }

  if (mentorMeetingIds.size > 0) {
    const { data, error } = await meetingQueryClient
      .from("mentor_meetings")
      .select("id, confirmed_time")
      .in("id", Array.from(mentorMeetingIds));

    if (error) {
      console.error(
        "Dashboard mentor_meetings preview query failed:",
        error.message,
      );
    } else {
      (data ?? []).forEach((row: any) => {
        if (!row?.id) return;
        mentorMeetingById.set(String(row.id), {
          id: String(row.id),
          confirmed_time:
            typeof row.confirmed_time === "string" ? row.confirmed_time : null,
        });
      });
    }
  }

  const mentees = menteesData.map(adaptMenteeToUi);
  const recentChats = recentChatsRaw
    .map((row) => {
      const latestMessage = row.chat_messages?.[0] ?? null;
      const protocol = parseMeetingProtocolRef(latestMessage?.body);
      const preview = latestMessage
        ? protocol?.type === "meeting_request"
          ? formatMeetingRequestPreview(meetingRequestById.get(protocol.id))
          : protocol?.type === "meeting_confirmed"
            ? formatMeetingConfirmedPreview(meetingRequestById.get(protocol.id))
            : protocol?.type === "meeting_scheduled"
              ? formatMentorMeetingPreview(mentorMeetingById.get(protocol.id))
              : latestMessage.body?.trim()
                ? latestMessage.body
                : latestMessage.message_type === "image"
                  ? "이미지를 전송했습니다."
                  : latestMessage.message_type === "file"
                    ? "파일을 전송했습니다."
                    : latestMessage.message_type === "meeting_request"
                      ? "상담 요청이 도착했습니다."
                      : latestMessage.message_type === "meeting_scheduled"
                        ? "멘토가 상담 일정을 등록했습니다."
                        : latestMessage.message_type === "system"
                          ? "상담 관련 알림이 도착했습니다."
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
      item.subtitle ||
      (item.type === "task"
        ? "과제 제출"
        : item.type === "plan"
          ? "플래너"
          : "자습"),
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
