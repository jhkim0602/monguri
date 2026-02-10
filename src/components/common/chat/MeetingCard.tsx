"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Video,
  Link2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type MeetingRequest = {
  id: string;
  mentor_mentee_id: string;
  topic: string;
  preferred_times: string[];
  confirmed_time: string | null;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  zoom_link: string | null;
  mentor_note?: string | null;
};

type Props = {
  requestId: string;
  isMentor: boolean;
};

export default function MeetingCard({ requestId, isMentor }: Props) {
  const [request, setRequest] = useState<MeetingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkInput, setLinkInput] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [isSavingLink, setIsSavingLink] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      const { data, error } = await supabase
        .from("meeting_requests")
        .select("*")
        .eq("id", requestId)
        .maybeSingle();

      if (!error && data) {
        setRequest(data);
        setLinkInput(data.zoom_link || "");
      }
      setIsLoading(false);
    };

    fetchRequest();

    const channel = supabase
      .channel(`meeting_card:${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "meeting_requests",
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          setRequest(payload.new as MeetingRequest);
          setLinkInput((payload.new as MeetingRequest).zoom_link || "");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  const handleSaveLink = async () => {
    if (!request || isSavingLink) return;

    const newLink = linkInput.trim() || null;
    const hadNoLink = !request.zoom_link;

    setIsSavingLink(true);
    const { error } = await supabase
      .from("meeting_requests")
      .update({ zoom_link: newLink })
      .eq("id", request.id);

    if (!error) {
      setIsEditingLink(false);

      // Send notification to mentee if link is newly added (by mentor)
      if (isMentor && newLink && hadNoLink) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        const mentorId = currentUser?.id;

        // Get mentee info
        const { data: mentorMenteeData } = await supabase
          .from("mentor_mentee")
          .select("mentee_id")
          .eq("id", request.mentor_mentee_id)
          .single();

        const menteeId = mentorMenteeData?.mentee_id;

        if (menteeId && mentorId) {
          const { data: mentorProfile } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", mentorId)
            .single();

          const meetingDateStr = request.confirmed_time
            ? new Date(request.confirmed_time).toLocaleString("ko-KR", {
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : "";

          await supabase.from("notifications").insert({
            recipient_id: menteeId,
            recipient_role: "mentee",
            type: "zoom_link_added",
            ref_type: "meeting_requests",
            ref_id: request.id,
            title: "화상 회의 링크가 등록되었습니다",
            message: `${meetingDateStr} 미팅의 화상 회의 링크가 준비되었습니다. 채팅에서 확인하세요!`,
            action_url: `/chat?scrollTo=${request.id}`,
            actor_id: mentorId,
            avatar_url: mentorProfile?.avatar_url ?? null,
            meta: {
              mentorMenteeId: request.mentor_mentee_id,
              meetingRequestId: request.id,
              zoomLink: newLink,
            },
          });
        }
      }
    }
    setIsSavingLink(false);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[320px] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <div className="h-[180px] flex items-center justify-center">
          <Loader2 className="animate-spin text-gray-300" size={24} />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="w-full max-w-[320px] p-4 text-sm text-gray-500 bg-gray-50 rounded-2xl">
        요청 정보를 불러올 수 없습니다.
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

  const isConfirmed = request.status === "CONFIRMED";
  const isRejected = request.status === "REJECTED";
  const isPending = request.status === "PENDING";
  const hasLink = !!request.zoom_link;

  // Status config
  const statusConfig = {
    PENDING: {
      bg: "bg-amber-50",
      icon: <Clock size={16} className="text-amber-500" />,
      text: isMentor ? "상담 요청 도착" : "미팅 요청",
      color: "text-amber-600",
    },
    CONFIRMED: {
      bg: "bg-emerald-50",
      icon: <CheckCircle2 size={16} className="text-emerald-500" />,
      text: "미팅 확정",
      color: "text-emerald-600",
    },
    REJECTED: {
      bg: "bg-red-50",
      icon: <XCircle size={16} className="text-red-400" />,
      text: "요청 거절됨",
      color: "text-red-500",
    },
  };

  const status = statusConfig[request.status];

  return (
    <div className="w-full max-w-[320px] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className={`px-4 py-3 flex items-center gap-2 ${status.bg}`}>
        {status.icon}
        <span className={`text-[13px] font-bold ${status.color}`}>
          {status.text}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Topic */}
        <div>
          <span className="text-[11px] font-bold text-gray-400 block mb-1">
            상담 주제
          </span>
          <p className="text-[14px] font-bold text-gray-800 leading-snug">
            {request.topic}
          </p>
        </div>

        {/* Time */}
        <div>
          <span className="text-[11px] font-bold text-gray-400 block mb-1">
            {isConfirmed ? "확정 일시" : "희망 일시"}
          </span>
          {isConfirmed && request.confirmed_time ? (
            <div className="flex items-center gap-2 text-[14px] font-bold text-emerald-600 bg-emerald-50 rounded-xl px-3 py-2.5">
              <Calendar size={14} />
              {formatDate(request.confirmed_time)}
            </div>
          ) : (
            <ul className="space-y-1.5">
              {request.preferred_times.slice(0, 3).map((time, idx) => (
                <li
                  key={idx}
                  className="text-[13px] text-gray-600 font-medium flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {formatDate(time)}
                </li>
              ))}
              {request.preferred_times.length > 3 && (
                <li className="text-[12px] text-gray-400 pl-3.5">
                  +{request.preferred_times.length - 3}개 더
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Zoom Link Section - Only for confirmed */}
        {isConfirmed && (
          <div className="pt-3 border-t border-gray-100">
            {isMentor && !hasLink && !isEditingLink ? (
              // Mentor: No link yet - show input prompt
              <button
                onClick={() => setIsEditingLink(true)}
                className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-[13px] font-bold text-gray-600 transition-colors flex items-center justify-center gap-2 border border-dashed border-gray-200"
              >
                <Link2 size={14} />
                화상 회의 링크 등록하기
              </button>
            ) : isMentor && isEditingLink ? (
              // Mentor: Editing link
              <div className="space-y-2">
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="Zoom 또는 Google Meet 링크"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditingLink(false);
                      setLinkInput(request.zoom_link || "");
                    }}
                    className="flex-1 py-2 text-[12px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSaveLink}
                    disabled={isSavingLink}
                    className="flex-1 py-2 text-[12px] font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSavingLink ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            ) : hasLink ? (
              // Has link - show join button
              <div className="space-y-2">
                <a
                  href={request.zoom_link!}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-blue-200 active:scale-[0.98]"
                >
                  <Video size={16} />
                  화상 회의 입장하기
                  <ExternalLink size={12} />
                </a>
                {isMentor && (
                  <button
                    onClick={() => setIsEditingLink(true)}
                    className="w-full py-2 text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    링크 수정
                  </button>
                )}
              </div>
            ) : (
              // Mentee: Waiting for link
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
        )}

        {/* Action for pending */}
        {isPending && (
          <div className="pt-3 border-t border-gray-100">
            {isMentor ? (
              <Link
                href="/schedule"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-bold bg-gray-900 text-white shadow-lg shadow-gray-200 hover:bg-black active:scale-[0.98] transition-all"
              >
                <Calendar size={14} />
                일정 확정하러 가기
              </Link>
            ) : (
              <div className="w-full py-3 bg-amber-50 rounded-xl text-center">
                <p className="text-[12px] text-amber-600 font-bold">
                  멘토님의 확인을 기다리고 있습니다
                </p>
              </div>
            )}
          </div>
        )}

        {/* Rejected */}
        {isRejected && (
          <div className="pt-3 border-t border-gray-100">
            <div className="w-full py-3 bg-red-50 rounded-xl text-center">
              <p className="text-[12px] text-red-500 font-medium">
                요청이 거절되었습니다
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
