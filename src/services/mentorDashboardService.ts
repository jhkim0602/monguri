import { adaptMenteeToUi } from "@/lib/mentorAdapters";
import { getRecentChatsByMentorId } from "@/repositories/chatRepository";
import { getMenteesByMentorId } from "@/repositories/mentorMenteeRepository";
import { ensureMentorProfile } from "@/services/mentorAccessService";
import { getPendingFeedbackItems } from "@/services/mentorFeedbackService";
import { getUpcomingMeetingsByMentorId } from "@/repositories/meetingRepository";

export async function getMentorDashboardData(mentorId: string) {
  const mentorProfile = await ensureMentorProfile(mentorId);

  const menteesData = await getMenteesByMentorId(mentorId);

  const [recentChatsResult, pendingFeedbackResult, upcomingMeetingsResult] = await Promise.allSettled([
    getRecentChatsByMentorId(mentorId, 5),
    getPendingFeedbackItems(mentorId),
    getUpcomingMeetingsByMentorId(mentorId, 5),
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
  if (upcomingMeetingsResult.status === "rejected") {
    console.error(
      "Dashboard upcomingMeetings query failed:",
      upcomingMeetingsResult.reason,
    );
  }

  const recentChatsRaw =
    recentChatsResult.status === "fulfilled" ? recentChatsResult.value : [];
  const pendingFeedbackItems =
    pendingFeedbackResult.status === "fulfilled"
      ? pendingFeedbackResult.value
      : [];
  const upcomingMeetingsRaw =
    upcomingMeetingsResult.status === "fulfilled"
      ? upcomingMeetingsResult.value
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

  const recentFeedback = pendingFeedbackItems.slice(0, 5).map((item) => ({
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
      pendingFeedback: pendingFeedbackItems.length,
      activeAlerts: 0, // Placeholder for alerts logic
    },
  };
}
