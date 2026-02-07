"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, Clock, CheckCircle2, XCircle, ChevronRight, MoreHorizontal } from "lucide-react";

type MeetingRequest = {
  id: string;
  topic: string;
  preferred_times: string[];
  confirmed_time: string | null;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  zoom_link: string | null;
};

type Props = {
  requestId: string;
  isSender: boolean;
};

export default function MeetingRequestCard({ requestId, isSender }: Props) {
  const [request, setRequest] = useState<MeetingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      const { data, error } = await supabase
        .from("meeting_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (!error && data) {
        setRequest(data);
      }
      setIsLoading(false);
    };

    fetchRequest();

    const channel = supabase
      .channel(`meeting_req:${requestId}`)
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  if (isLoading) {
    return <div className="w-[280px] h-[150px] bg-gray-50 rounded-xl animate-pulse" />;
  }

  if (!request) {
    return <div className="p-3 text-sm text-gray-500">요청 정보를 불러올 수 없습니다.</div>;
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-[280px] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Header */}
      <div className={`px-4 py-3 flex items-center gap-2 border-b border-gray-50 ${
        request.status === "CONFIRMED" ? "bg-blue-50/50" : "bg-gray-50/50"
      }`}>
        {request.status === "CONFIRMED" ? (
          <CheckCircle2 size={16} className="text-blue-500" />
        ) : request.status === "REJECTED" ? (
          <XCircle size={16} className="text-red-400" />
        ) : (
          <Clock size={16} className="text-orange-400" />
        )}
        <span className={`text-xs font-bold ${
          request.status === "CONFIRMED" ? "text-blue-600" :
          request.status === "REJECTED" ? "text-red-500" : "text-orange-500"
        }`}>
          {request.status === "CONFIRMED" ? "미팅 확정" :
           request.status === "REJECTED" ? "요청 거절됨" : "미팅 요청"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <span className="text-[11px] font-bold text-gray-400 block mb-1">상담 주제</span>
          <p className="text-[14px] font-bold text-gray-800 leading-tight">{request.topic}</p>
        </div>

        <div>
          <span className="text-[11px] font-bold text-gray-400 block mb-1">
            {request.status === "CONFIRMED" ? "확정 일시" : "희망 일시"}
          </span>
          {request.status === "CONFIRMED" && request.confirmed_time ? (
            <div className="text-[14px] font-bold text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
              {formatDate(request.confirmed_time)}
            </div>
          ) : (
            <ul className="space-y-1">
              {request.preferred_times.map((time, idx) => (
                <li key={idx} className="text-[13px] text-gray-600 font-medium flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  {formatDate(time)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action / Video Link */}
        {request.status === "CONFIRMED" && (
          <div className="pt-2 border-t border-gray-50">
             <a
                href={request.zoom_link || "#"}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                    request.zoom_link
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
             >
                <Calendar size={14} />
                화상 회의 입장
             </a>
          </div>
        )}

        {request.status === "PENDING" && isSender && (
             <p className="text-[11px] text-gray-400 text-center bg-gray-50 rounded-lg py-2">
                멘토님의 확인을 기다리고 있습니다
             </p>
        )}
      </div>
    </div>
  );
}
