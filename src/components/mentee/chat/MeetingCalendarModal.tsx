"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  X,
  Calendar,
  Video,
  ExternalLink,
  Loader2,
  Repeat,
} from "lucide-react";

type MeetingItem = {
  id: string;
  type: "request" | "scheduled";
  topic: string;
  confirmed_time: string;
  zoom_link: string | null;
  is_recurring: boolean;
  status?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mentorMenteeId: string;
  menteeId: string;
};

export default function MeetingCalendarModal({
  isOpen,
  onClose,
  mentorMenteeId,
  menteeId,
}: Props) {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !mentorMenteeId) return;

    const fetchMeetings = async () => {
      setIsLoading(true);

      // Fetch confirmed meeting requests
      const { data: requests } = await supabase
        .from("meeting_requests")
        .select("*")
        .eq("mentor_mentee_id", mentorMenteeId)
        .eq("status", "CONFIRMED")
        .not("confirmed_time", "is", null);

      // Fetch mentor-scheduled meetings
      const { data: scheduled } = await supabase
        .from("mentor_meetings")
        .select("*")
        .eq("mentor_mentee_id", mentorMenteeId);

      const items: MeetingItem[] = [];

      if (requests) {
        requests.forEach((r) => {
          items.push({
            id: r.id,
            type: "request",
            topic: r.topic,
            confirmed_time: r.confirmed_time!,
            zoom_link: r.zoom_link,
            is_recurring: false,
            status: r.status,
          });
        });
      }

      if (scheduled) {
        scheduled.forEach((s) => {
          items.push({
            id: s.id,
            type: "scheduled",
            topic: s.topic,
            confirmed_time: s.confirmed_time,
            zoom_link: s.zoom_link,
            is_recurring: !!s.recurring_group_id,
          });
        });
      }

      // Sort by date (upcoming first)
      items.sort(
        (a, b) =>
          new Date(a.confirmed_time).getTime() -
          new Date(b.confirmed_time).getTime()
      );

      setMeetings(items);
      setIsLoading(false);
    };

    fetchMeetings();
  }, [isOpen, mentorMenteeId]);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const now = new Date();
  const upcoming = meetings.filter(
    (m) => new Date(m.confirmed_time) >= now
  );
  const past = meetings.filter((m) => new Date(m.confirmed_time) < now);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[75vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            <h2 className="text-[16px] font-bold text-gray-900">
              미팅 일정
            </h2>
            <span className="text-[12px] font-bold text-gray-400">
              {upcoming.length}개 예정
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-gray-300" size={24} />
            </div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar
                size={40}
                className="text-gray-200 mx-auto mb-3"
              />
              <p className="text-[14px] font-bold text-gray-400">
                아직 예정된 미팅이 없습니다
              </p>
              <p className="text-[12px] text-gray-300 mt-1">
                미팅 신청을 해보세요!
              </p>
            </div>
          ) : (
            <>
              {/* Upcoming */}
              {upcoming.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
                    예정된 미팅
                  </h3>
                  <div className="space-y-3">
                    {upcoming.map((m) => (
                      <MeetingListItem key={m.id} meeting={m} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past */}
              {past.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-bold text-gray-400 mb-3 uppercase tracking-wider">
                    지난 미팅
                  </h3>
                  <div className="space-y-3 opacity-60">
                    {past.map((m) => (
                      <MeetingListItem key={m.id} meeting={m} isPast />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MeetingListItem({
  meeting,
  isPast = false,
}: {
  meeting: MeetingItem;
  isPast?: boolean;
}) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const borderColor =
    meeting.type === "scheduled" ? "border-l-orange-400" : "border-l-blue-400";

  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm border-l-4 ${borderColor}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[14px] font-bold text-gray-800 truncate">
              {meeting.topic}
            </span>
            {meeting.is_recurring && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-500">
                <Repeat size={10} />
                정기
              </span>
            )}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                meeting.type === "scheduled"
                  ? "bg-orange-50 text-orange-500"
                  : "bg-blue-50 text-blue-500"
              }`}
            >
              {meeting.type === "scheduled" ? "멘토 지정" : "멘티 요청"}
            </span>
          </div>
          <span className="text-[12px] text-gray-500 font-medium">
            {formatDate(meeting.confirmed_time)}
          </span>
        </div>

        {meeting.zoom_link && !isPast && (
          <a
            href={meeting.zoom_link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold transition-colors shrink-0"
          >
            <Video size={14} />
            입장
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  );
}
