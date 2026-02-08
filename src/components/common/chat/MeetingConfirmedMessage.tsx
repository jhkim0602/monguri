"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Video, Calendar, Clock, Loader2, Link2 } from "lucide-react";

type MeetingRequest = {
  id: string;
  topic: string;
  confirmed_time: string | null;
  zoom_link: string | null;
  status: "CONFIRMED";
};

type Props = {
  requestId: string;
  isSender: boolean; // true if I sent the message (System message sender is usually null or system, but we render this based on viewer)
};

export default function MeetingConfirmedMessage({ requestId }: Props) {
  const [request, setRequest] = useState<MeetingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("meeting_requests")
        .select("id, topic, confirmed_time, zoom_link, status")
        .eq("id", requestId)
        .single();

      if (error) {
        console.error("Error fetching meeting request:", error);
        setIsLoading(false);
        return;
      }

      if (data) {
        // @ts-ignore
        setRequest(data);
      }
      setIsLoading(false);
    };

    fetchRequest();

    // Subscribe to changes for this specific request to update Zoom link in real-time
    const channel = supabase
      .channel(`meeting_request:${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "meeting_requests",
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
            // @ts-ignore
            setRequest((prev) => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  if (isLoading) {
    return (
        <div className="flex items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 w-[280px]">
            <Loader2 className="animate-spin text-gray-300" size={20} />
        </div>
    );
  }

  if (!request || !request.confirmed_time) {
    return null;
  }

  const confirmedDate = new Date(request.confirmed_time);
  const dateStr = confirmedDate.toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  const timeStr = confirmedDate.toLocaleString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
  });

  const hasLink = !!request.zoom_link;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 w-[300px] flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <Calendar size={16} strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[15px] font-bold text-gray-900 leading-tight">
            상담 일정 확정
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-0.5">
            약속된 시간에 늦지 않게 참여해주세요!
          </div>
        </div>
      </div>

      {/* Info Body */}
      <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-start gap-2.5">
          <Clock className="text-gray-400 mt-0.5 shrink-0" size={14} />
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-gray-800">
              {dateStr} {timeStr}
            </span>
            <span className="text-[11px] text-gray-500 mt-0.5">
              주제: {request.topic}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-1">
        {hasLink ? (
          <a
            href={request.zoom_link!}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[13px] font-bold transition-all shadow-sm shadow-blue-200 active:scale-[0.98]"
          >
            <Video size={16} />
            화상 회의 입장하기
          </a>
        ) : (
          <div className="w-full py-4 px-4 bg-gray-50 text-gray-500 rounded-xl text-[12px] font-medium text-center flex flex-col items-center gap-1.5 border border-gray-100 border-dashed">
            <span className="flex items-center gap-1.5 text-gray-600 font-bold">
                <Link2 size={14} className="text-gray-400" />
                화상 회의 링크 대기 중
            </span>
            <span className="text-[11px] text-gray-400">
                멘토가 링크를 생성하면 알림을 보내드릴게요! 🔔
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
