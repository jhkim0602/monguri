import { ensureMentorProfile } from "@/services/mentorAccessService";
import {
  listMeetingRequestsByMentorId,
  type MeetingQueryClient,
  type MentorMeetingRequestRow,
  type UpcomingMeetingRow,
} from "@/repositories/meetingRepository";

const isFutureOrNow = (value: string | null) => {
  if (!value) return false;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return time >= Date.now();
};

const toUpcomingMeeting = (
  row: MentorMeetingRequestRow,
): UpcomingMeetingRow | null => {
  if (!row.confirmed_time || !isFutureOrNow(row.confirmed_time)) return null;

  return {
    id: row.id,
    studentName: row.studentName,
    topic: row.topic,
    confirmed_time: row.confirmed_time,
    zoom_link: row.zoom_link,
  };
};

export async function getMentorMeetingsForSchedule(
  mentorId: string,
  queryClient?: MeetingQueryClient,
) {
  await ensureMentorProfile(mentorId);
  return getMentorMeetingsForScheduleUnchecked(mentorId, queryClient);
}

export async function getMentorMeetingsForScheduleUnchecked(
  mentorId: string,
  queryClient?: MeetingQueryClient,
) {

  const requests = await listMeetingRequestsByMentorId(mentorId, queryClient);

  const pendingRequests = requests
    .filter((request) => request.status === "PENDING")
    .sort((a, b) => {
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return bTime - aTime;
    });

  const confirmedRequests = requests
    .filter((request) => request.status === "CONFIRMED" && !!request.confirmed_time)
    .sort((a, b) => {
      const aTime = new Date(a.confirmed_time as string).getTime();
      const bTime = new Date(b.confirmed_time as string).getTime();
      return aTime - bTime;
    });

  const upcomingMeetings = confirmedRequests
    .map(toUpcomingMeeting)
    .filter(Boolean)
    .slice(0, 5) as UpcomingMeetingRow[];

  return {
    pendingRequests,
    confirmedRequests,
    upcomingMeetings,
  };
}
