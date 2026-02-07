"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/contexts/ModalContext";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Request = {
  id: string;
  mentor_mentee_id: string;
  requestor_id: string;
  studentName: string;
  topic: string;
  preferred_times: string[];
  status: "PENDING" | "CONFIRMED" | "REJECTED";
};

type Event = {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "mentoring";
};

export default function SchedulePage() {
  const { openModal } = useModal();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [requests, setRequests] = useState<Request[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    // 1. Fetch Requests + MentorMentee info
    const { data: requestData, error: reqError } = await supabase
        .from("meeting_requests")
        .select(`
            *,
            mentor_mentee:mentor_mentee!inner(mentor_id)
        `)
        .eq("mentor_mentee.mentor_id", user.id);

    if (!reqError && requestData) {
        // 2. Fetch Profiles for requestors
        const requestorIds = Array.from(new Set(requestData.map((r: any) => r.requestor_id)));
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", requestorIds);

        const profileMap = new Map(profiles?.map((p: any) => [p.id, p.name]) || []);

        const allRequests = requestData;


        const pending: Request[] = [];
        const confirmed: Event[] = [];

        allRequests.forEach((r: any) => {
            if (r.status === "PENDING") {
                pending.push({
                    id: r.id,
                    mentor_mentee_id: r.mentor_mentee_id,
                    requestor_id: r.requestor_id,
                    studentName: profileMap.get(r.requestor_id) || "알 수 없음",
                    topic: r.topic,
                    preferred_times: r.preferred_times,
                    status: r.status
                });
            } else if (r.status === "CONFIRMED" && r.confirmed_time) {
                const d = new Date(r.confirmed_time);
                confirmed.push({
                    id: r.id,
                    title: `멘토링 (${profileMap.get(r.requestor_id) || "학생"})`,
                    date: d,
                    time: d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
                    type: "mentoring"
                });
            }
        });
        setRequests(pending);
        setEvents(confirmed);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Realtime subscription could be added here
    const channel = supabase
      .channel('schedule_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meeting_requests' }, () => {
          fetchData();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    }
  }, []);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Handlers
  const handleApprove = (req: Request) => {
    let selectedTime = req.preferred_times[0];

    openModal({
      title: "상담 일정 확정/조정",
      content: (
        <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-2">
                <span className="font-bold text-gray-900">{req.studentName}</span> 학생의 요청입니다.<br/>
                가능한 시간을 선택하여 확정하거나, 조율이 필요하면 메시지를 보내주세요.
            </p>
            <div className="space-y-2">
                {req.preferred_times.map((t, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg cursor-pointer hover:bg-blue-50">
                        <input
                            type="radio"
                            name="time"
                            value={t}
                            defaultChecked={i === 0}
                            onChange={(e) => selectedTime = e.target.value}
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-bold text-gray-700">
                            {new Date(t).toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </span>
                    </label>
                ))}
            </div>
            <div className="pt-2 text-xs text-center text-gray-400">
                * 시간이 맞지 않으면 채팅으로 조율해주세요.
            </div>
        </div>
      ),
      type: "confirm",
      confirmText: "이 시간으로 확정하기",
      onConfirm: async () => {
        const { error } = await supabase
            .from("meeting_requests")
            .update({
                status: "CONFIRMED",
                confirmed_time: selectedTime,
                // Optional: Zoom link generation logic could go here
                zoom_link: "https://zoom.us/j/example"
            })
            .eq("id", req.id);

        if (!error) {
            // Send system message to chat
            const { error: chatError } = await supabase.from("chat_messages").insert({
                mentor_mentee_id: req.mentor_mentee_id,
                sender_id: (await supabase.auth.getUser()).data.user?.id,
                body: `상담 일정이 확정되었습니다.\n📅 ${new Date(selectedTime).toLocaleString("ko-KR", { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}`,
                message_type: "system"
            });

            if (chatError) {
                console.error("Failed to send system message:", chatError);
            }

            openModal({
                title: "수락 완료",
                content: "✅ 상담이 확정되었습니다.",
                type: "success",
            });
        } else {
            alert("처리 중 오류가 발생했습니다.");
        }
      },
    });
  };

  const handleAdjust = (req: Request) => {
    // MVP: 조정 기능 제외 or Simple Alert
    // Design doc said MVP excludes this.
    // user instruction said: "수락 로직 구현 (조정 기능 MVP 제외)" -> But I can show a message or hide it.
    // I'll show alert to be safe, or just hide the button?
    // In design I kept the button but marked as not MVP.
    // I'll keep the button but show alert.
    alert("일정 조정 기능은 아직 준비 중입니다. 메시지로 조율해주세요.");
  };

  return (
    <div className="flex gap-8 h-[calc(100vh-8rem)]">
      {/* Calendar Section */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentDate(today)} className="px-3 py-1.5 text-xs font-bold bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              오늘
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6">
          <div className="grid grid-cols-7 mb-4">
            {weekDays.map((day, i) => (
              <div key={day} className={`text-center text-xs font-bold uppercase tracking-wider ${i === 0 ? "text-red-400" : "text-gray-400"}`}>
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const isToday = date === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
              const dayEvents = events.filter(e => e.date.getDate() === date && e.date.getMonth() === currentDate.getMonth() && e.date.getFullYear() === currentDate.getFullYear());

              return (
                <div key={date} className="relative border border-gray-50 rounded-xl p-2 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group flex flex-col items-start justify-start">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-gray-900 text-white shadow-lg" : "text-gray-700"}`}>
                    {date}
                  </span>
                  <div className="mt-1 w-full space-y-1 overflow-y-auto max-h-[60px] no-scrollbar">
                    {dayEvents.map(event => (
                      <div key={event.id} className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold truncate w-full">
                        {event.time} {event.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-6">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm h-1/2 overflow-hidden flex flex-col">
          <h3 className="font-bold text-lg mb-1 text-gray-900">상담 요청</h3>
          <p className="text-gray-500 text-xs mb-4">
            새로운 멘토링 요청이 {requests.length}건 있습니다.
          </p>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <span className="text-xs text-gray-400">Loading...</span>
                </div>
            ) : requests.map((req) => (
              <div key={req.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-sm block text-gray-900">{req.studentName}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase">Pending</span>
                </div>
                <p className="text-xs text-gray-600 mb-2 truncate">{req.topic}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                  <Clock size={12} />
                  {req.preferred_times[0] ? new Date(req.preferred_times[0]).toLocaleDateString() : '-'}
                  {req.preferred_times.length > 1 && ` 외 ${req.preferred_times.length - 1}개`}
                </div>

                <div className="flex mt-3 pt-3 border-t border-gray-200">
                  <button onClick={() => handleApprove(req)} className="flex-1 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-colors">
                    일정 확정/조정
                  </button>
                </div>
              </div>
            ))}
            {!isLoading && requests.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                대기 중인 요청이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex-1 p-6 overflow-hidden">
          <h3 className="font-bold text-gray-900 mb-4">다가오는 일정</h3>
          <div className="space-y-4 relative h-full overflow-y-auto">
            <div className="absolute left-[7px] top-2 bottom-0 w-0.5 bg-gray-100 h-full" />
            {[...events].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5).map((event, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="w-4 h-4 rounded-full bg-white border-4 border-blue-500 shrink-0 z-10" />
                <div className="pb-4">
                  <span className="block text-xs font-bold text-blue-600 mb-0.5">
                    {event.date.getMonth() + 1}월 {event.date.getDate()}일 {event.time}
                  </span>
                  <p className="text-sm font-bold text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-400">Zoom 온라인</p>
                </div>
              </div>
            ))}
            {!isLoading && events.length === 0 && (
                 <div className="text-xs text-gray-400 pl-6">일정이 없습니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
