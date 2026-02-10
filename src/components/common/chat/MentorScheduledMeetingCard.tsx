"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Calendar,
  Video,
  ExternalLink,
  Loader2,
  Link2,
  Repeat,
  MessageSquare,
} from "lucide-react";

type MentorMeeting = {
  id: string;
  mentor_mentee_id: string;
  mentor_id: string;
  mentee_id: string;
  topic: string;
  confirmed_time: string;
  zoom_link: string | null;
  recurring_group_id: string | null;
  mentee_description: string | null;
};

type Props = {
  meetingId: string;
};

export default function MentorScheduledMeetingCard({ meetingId }: Props) {
  const [meeting, setMeeting] = useState<MentorMeeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      const { data, error } = await supabase
        .from("mentor_meetings")
        .select("*")
        .eq("id", meetingId)
        .maybeSingle();

      if (!error && data) {
        setMeeting(data);
      }
      setIsLoading(false);
    };

    fetchMeeting();

    // Realtime subscription for updates and deletes
    const channel = supabase
      .channel(`mentor_meeting_card:${meetingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mentor_meetings",
          filter: `id=eq.${meetingId}`,
        },
        (payload) => {
          setMeeting(payload.new as MentorMeeting);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "mentor_meetings",
          filter: `id=eq.${meetingId}`,
        },
        () => {
          setMeeting(null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[320px] bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-100">
        <div className="h-[180px] flex items-center justify-center">
          <Loader2 className="animate-spin text-orange-300" size={24} />
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="w-full max-w-[320px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200">
        <div className="px-4 py-3 flex items-center gap-2 bg-gray-100">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-[13px] font-bold text-gray-500">
            취소된 미팅
          </span>
        </div>
        <div className="p-4 text-center">
          <p className="text-[13px] text-gray-400 font-medium">
            이 미팅은 취소되었습니다
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const hasLink = !!meeting.zoom_link;
  const isRecurring = !!meeting.recurring_group_id;

  return (
    <div className="w-full max-w-[320px] bg-white rounded-2xl overflow-hidden shadow-sm border border-orange-200">
      {/* Header - Orange theme */}
      <div className="px-4 py-3 flex items-center gap-2 bg-orange-50">
        <Calendar size={16} className="text-orange-500" />
        <span className="text-[13px] font-bold text-orange-600">
          멘토 지정 미팅
        </span>
        {isRecurring && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600">
            <Repeat size={10} />
            정기
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Topic */}
        <div>
          <span className="text-[11px] font-bold text-gray-400 block mb-1">
            상담 주제
          </span>
          <p className="text-[14px] font-bold text-gray-800 leading-snug">
            {meeting.topic}
          </p>
        </div>

        {/* Time */}
        <div>
          <span className="text-[11px] font-bold text-gray-400 block mb-1">
            미팅 일시
          </span>
          <div className="flex items-center gap-2 text-[14px] font-bold text-orange-600 bg-orange-50 rounded-xl px-3 py-2.5">
            <Calendar size={14} />
            {formatDate(meeting.confirmed_time)}
          </div>
        </div>

        {/* Mentee Description */}
        {meeting.mentee_description && (
          <div>
            <span className="text-[11px] font-bold text-gray-400 block mb-1">
              멘토님 메시지
            </span>
            <div className="flex items-start gap-2 bg-orange-50/50 rounded-xl px-3 py-2.5 border border-orange-100">
              <MessageSquare size={14} className="text-orange-400 mt-0.5 shrink-0" />
              <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
                {meeting.mentee_description}
              </p>
            </div>
          </div>
        )}

        {/* Zoom Link Section */}
        <div className="pt-3 border-t border-gray-100">
          {hasLink ? (
            <a
              href={meeting.zoom_link!}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-orange-200 active:scale-[0.98]"
            >
              <Video size={16} />
              화상 회의 입장하기
              <ExternalLink size={12} />
            </a>
          ) : (
            <div className="w-full py-4 px-4 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
              <div className="flex items-center justify-center gap-2 text-gray-500 font-bold text-[12px] mb-1">
                <Link2 size={14} className="text-gray-400" />
                화상 회의 링크 대기 중
              </div>
              <p className="text-[11px] text-gray-400">
                멘토가 링크를 등록하면 자동으로 표시됩니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
