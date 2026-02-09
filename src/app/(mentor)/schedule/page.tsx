"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/contexts/ModalContext";
import { ChevronLeft, ChevronRight, Clock, Video, Calendar as CalendarIcon, MapPin, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Request = {
  id: string;
  mentor_mentee_id: string;
  requestor_id: string;
  studentName: string;
  topic: string;
  preferred_times: string[];
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  confirmed_time?: string | null;
  zoom_link?: string | null;
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
  const [confirmedRequests, setConfirmedRequests] = useState<Request[]>([]); // New state
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRequests([]);
        setConfirmedRequests([]);
        setEvents([]);
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("Unauthorized.");
      }

      const response = await fetch(`/api/mentor/meetings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Failed to load meetings.");
      }

      const pending = Array.isArray(result.data?.pendingRequests)
        ? (result.data.pendingRequests as Request[])
        : [];
      const confirmed = Array.isArray(result.data?.confirmedRequests)
        ? (result.data.confirmedRequests as Request[])
        : [];
      const confirmedEvents = confirmed
        .map((request) => {
          const date = new Date(request.confirmed_time ?? "");
          if (Number.isNaN(date.getTime())) return null;

          return {
            id: request.id,
            title: `멘토링 (${request.studentName})`,
            date,
            time: date.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "mentoring" as const,
          };
        })
        .filter(Boolean) as Event[];

      setRequests(pending);
      setConfirmedRequests(confirmed);
      setEvents(confirmedEvents);
    } catch (error) {
      console.error("Failed to fetch schedule data:", error);
      setRequests([]);
      setConfirmedRequests([]);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Realtime subscription could be added here
    const channel = supabase
      .channel("schedule_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meeting_requests" },
        () => {
          fetchData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  // Handlers
  const handleApprove = (req: Request) => {
    let selectedTime = req.preferred_times[0];

    openModal({
      title: "상담 일정 확정/조정",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-bold text-gray-900">{req.studentName}</span>{" "}
            학생의 요청입니다.
            <br />
            가능한 시간을 선택하여 확정하거나, 조율이 필요하면 메시지를
            보내주세요.
          </p>
          <div className="space-y-2">
            {req.preferred_times.map((t, i) => (
              <label
                key={i}
                className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg cursor-pointer hover:bg-blue-50"
              >
                <input
                  type="radio"
                  name="time"
                  value={t}
                  defaultChecked={i === 0}
                  onChange={(e) => (selectedTime = e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-gray-700">
                  {new Date(t).toLocaleString("ko-KR", {
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
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
            // Optional: Zoom link can be added later
            zoom_link: null,
          })
          .eq("id", req.id);

        if (!error) {
          // Send system message to chat
          const { error: chatError } = await supabase
            .from("chat_messages")
            .insert({
              mentor_mentee_id: req.mentor_mentee_id,
              sender_id: (await supabase.auth.getUser()).data.user?.id,
              body: `MEETING_CONFIRMED:${req.id}`,
              message_type: "system",
            });

          if (chatError) {
            console.error("Failed to send system message:", chatError);
          }

          openModal({
            title: "상담 확정 완료",
            content: (
                <div className="text-center">
                    <p className="mb-3 font-bold text-gray-900 text-lg">✅ 상담이 확정되었습니다.</p>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-left">
                        <p className="text-sm text-blue-800 font-bold mb-1">📢 다음 단계 안내</p>
                        <p className="text-xs text-blue-600 leading-relaxed">
                            캘린더에서 <span className="font-bold underline">해당 날짜를 클릭</span>하여<br/>
                            학생을 위한 <span className="font-bold">Zoom 화상 회의 링크</span>를 등록해주세요.
                        </p>
                    </div>
                </div>
            ),
            type: "success",
            confirmText: "확인"
          });
          fetchData();
        } else {
          alert("처리 중 오류가 발생했습니다.");
        }
      },
    });
  };

  const handleAdjust = (req: Request) => {
     alert("일정 조정 기능은 아직 준비 중입니다. 메시지로 조율해주세요.");
  };

  const handleMeetingDetail = (req: Request) => {
    const dateObj = new Date(req.confirmed_time!);
    const timeStr = dateObj.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit', hour12: false });
    const fullDateStr = dateObj.toLocaleDateString("ko-KR", { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

    openModal({
      title: "상담 상세 정보",
      size: "lg", // Slightly smaller than day list but enough for details
      content: (
        <div className="space-y-6 pt-2">
           {/* Date & Student Info */}
           <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100/50">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <span className="block text-xs font-bold text-blue-500 mb-1">일정</span>
                    <h3 className="text-xl font-black text-gray-900">{fullDateStr}</h3>
                    <p className="text-lg font-bold text-gray-700 mt-1">{timeStr}</p>
                 </div>
                 <div className="text-right">
                    <span className="block text-xs font-bold text-blue-500 mb-1">학생</span>
                    <h3 className="text-lg font-black text-gray-900">{req.studentName}</h3>
                 </div>
              </div>
              <div className="border-t border-blue-100 pt-4 mt-2">
                 <span className="block text-xs font-bold text-blue-500 mb-1">상담 주제</span>
                 <p className="text-sm font-medium text-gray-700 leading-relaxed">{req.topic}</p>
              </div>
           </div>

           {/* Zoom Link Input Section */}
           <div className="space-y-3">
              <div className="flex items-center gap-2">
                 <Video size={18} className="text-gray-900" />
                 <h4 className="font-bold text-gray-900 text-lg">화상 회의 링크</h4>
              </div>

              <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-start gap-2">
                 <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                 <p className="text-xs leading-relaxed">
                   Zoom 또는 Google Meet 링크를 입력해주세요.<br/>
                   <span className="font-bold text-blue-600">링크를 입력하면 해당 멘티에게 알림 메시지가 자동으로 발송됩니다.</span>
                 </p>
              </div>

              <div className="relative group">
                 <input
                    type="text"
                    placeholder="https://zoom.us/j/..."
                    defaultValue={req.zoom_link || ""}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300 font-medium"
                    onBlur={async (e) => {
                       const newLink = e.target.value;
                       if(newLink !== req.zoom_link) {
                          if (newLink) {
                            const { error } = await supabase.from("meeting_requests").update({ zoom_link: newLink }).eq("id", req.id);
                            if (error) {
                               alert("링크 저장에 실패했습니다.");
                            } else {
                               // Send system message
                               await supabase.from("chat_messages").insert({
                                  mentor_mentee_id: req.mentor_mentee_id,
                                  sender_id: (await supabase.auth.getUser()).data.user?.id,
                                  body: `화상 회의 링크가 등록되었습니다!`,
                                  message_type: "system",
                               });
                               fetchData();
                               alert("링크가 등록되었습니다.");
                            }
                          }
                       }
                    }}
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    <MapPin size={16} />
                 </div>
              </div>

              {req.zoom_link && (
                 <a
                    href={req.zoom_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md mt-2"
                 >
                    회의실 입장하기 <ChevronRight size={16} className="ml-1" />
                 </a>
              )}
           </div>
        </div>
      ),
      type: "default",
      confirmText: "닫기" // This effectively closes the modal
    });
  }

  /* Day Click Handler for Detailed View & Zoom Link Management */
  const handleDayClick = (dayDate: Date) => {
    const year = dayDate.getFullYear();
    const month = dayDate.getMonth() + 1;
    const date = dayDate.getDate();
    const weekday = dayDate.toLocaleDateString("ko-KR", { weekday: "short" });

    const dayEvents = confirmedRequests.filter(
      (req) =>
        req.status === "CONFIRMED" &&
        req.confirmed_time &&
        new Date(req.confirmed_time).getDate() === dayDate.getDate() &&
        new Date(req.confirmed_time).getMonth() === dayDate.getMonth() &&
        new Date(req.confirmed_time).getFullYear() === dayDate.getFullYear(),
    );

    // Sort by time
    dayEvents.sort(
      (a, b) =>
        new Date(a.confirmed_time!).getTime() -
        new Date(b.confirmed_time!).getTime(),
    );

    openModal({
      title: "일정 관리", // Hidden by custom content usually or kept as header
      size: "2xl", // Make it wider
      content: (
        <div className="flex flex-col h-[500px]">
          {/* Header */}
          <div className="flex items-end justify-between mb-8 pb-4 border-b border-gray-100">
             <div>
                <p className="text-gray-500 font-medium mb-1 text-sm">{year}.{String(month).padStart(2,'0')}</p>
                <div className="flex items-baseline gap-2">
                   <h2 className="text-3xl font-black text-gray-900">{date}</h2>
                   <span className="text-xl font-medium text-gray-400">{weekday}</span>
                </div>
             </div>
             <div className="text-right">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Scheduled</div>
                <div className="font-black text-gray-900 text-xl">{dayEvents.length} <span className="font-normal text-gray-400 text-sm">sessions</span></div>
             </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {dayEvents.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10">
                  <CalendarIcon size={48} strokeWidth={1} className="mb-4 text-gray-200" />
                  <p className="text-base font-medium text-gray-400">일정이 없습니다.</p>
               </div>
            ) : (
               <div className="space-y-3">
                  {dayEvents.map((req) => {
                     const dateObj = new Date(req.confirmed_time!);
                     const timeStr = dateObj.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit', hour12: false });

                     // Calculate end time
                     const endTimeObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
                     const endTimeStr = endTimeObj.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit', hour12: false });

                     return (
                        <div
                           key={req.id}
                           onClick={() => handleMeetingDetail(req)}
                           className="group relative bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all rounded-2xl p-4 cursor-pointer flex items-center gap-4 active:scale-[0.99]"
                        >
                           {/* Time Block */}
                           <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl w-16 h-16 shrink-0 group-hover:bg-blue-50 transition-colors">
                              <span className="text-sm font-black text-gray-900">{timeStr}</span>
                              <span className="text-[10px] font-bold text-gray-400">~{endTimeStr}</span>
                           </div>

                           {/* Info */}
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                 <h3 className="text-base font-bold text-gray-900 truncate">{req.studentName}</h3>
                                 <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500">멘토링</span>
                              </div>
                              <p className="text-xs text-gray-500 truncate">{req.topic}</p>
                           </div>

                           {/* Status Arrow */}
                           <div className="shrink-0 flex items-center gap-3">
                              {req.zoom_link ? (
                                 <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                    <Video size={10} />
                                    <span>입장 준비완료</span>
                                 </div>
                              ) : (
                                 <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full animate-pulse">
                                    <AlertCircle size={10} />
                                    <span>링크 필요</span>
                                 </div>
                              )}
                              <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                           </div>
                        </div>
                     )
                  })}
               </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-gray-50 text-center">
             <p className="text-[10px] text-gray-400 font-medium">
                * 일정을 클릭하여 상세 정보를 확인하고 줌 링크를 등록하세요.
             </p>
          </div>
        </div>
      ),
      type: "default",
    });
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
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(today)}
              className="px-3 py-1.5 text-xs font-bold bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              오늘
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-6">
          <div className="grid grid-cols-7 mb-4">
            {weekDays.map((day, i) => (
              <div
                key={day}
                className={`text-center text-xs font-bold uppercase tracking-wider ${i === 0 ? "text-red-400" : "text-gray-400"}`}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const dateObj = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                date,
              );
              const isToday =
                date === today.getDate() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear();
              const dayEvents = events.filter(
                (e) =>
                  e.date.getDate() === date &&
                  e.date.getMonth() === currentDate.getMonth() &&
                  e.date.getFullYear() === currentDate.getFullYear(),
              );

              return (
                <div
                  key={date}
                  onClick={() => handleDayClick(dateObj)}
                  className="relative border border-gray-50 rounded-xl p-2 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group flex flex-col items-start justify-start"
                >
                  <span
                    className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-gray-900 text-white shadow-lg" : "text-gray-700"}`}
                  >
                    {date}
                  </span>
                  <div className="mt-1 w-full space-y-1 overflow-y-auto max-h-[60px] no-scrollbar">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold truncate w-full"
                      >
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
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 truncate">
                        {req.studentName} 학생
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full font-bold">
                        확정됨
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2 truncate">
                      {req.topic}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span className="font-bold text-gray-700">
                          {new Date(req.confirmed_time!).toLocaleString(
                            "ko-KR",
                            {
                              month: "long",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Zoom Link Section */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-gray-500">
                          화상 회의 링크
                        </span>
                        {!req.zoom_link && (
                          <span className="text-[10px] text-red-500 font-bold animate-pulse">
                            등록 필요
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Zoom 또는 구글밋 링크 입력"
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-500 transition-colors"
                          defaultValue={req.zoom_link || ""}
                          onBlur={async (e) => {
                            const newLink = e.target.value;
                            if (newLink === req.zoom_link) return;

                            const { error } = await supabase
                              .from("meeting_requests")
                              .update({ zoom_link: newLink })
                              .eq("id", req.id);

                            if (error) {
                              alert("링크 저장에 실패했습니다.");
                            } else {
                              // Optionally send a notification message if it's a new link
                              if (!req.zoom_link && newLink) {
                                await supabase.from("chat_messages").insert({
                                  mentor_mentee_id: req.mentor_mentee_id,
                                  sender_id: (await supabase.auth.getUser())
                                    .data.user?.id,
                                  body: `화상 회의 링크가 등록되었습니다!`,
                                  message_type: "system",
                                });

                                // Refresh data
                                fetchData();
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(req)}
                      className="flex-1 py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      일정 확정/조정
                    </button>
                  </div>
                </div>
              ))
            )}
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
            {[...events]
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 5)
              .map((event, i) => (
                <div key={i} className="flex gap-4 relative">
                  <div className="w-4 h-4 rounded-full bg-white border-4 border-blue-500 shrink-0 z-10" />
                  <div className="pb-4">
                    <span className="block text-xs font-bold text-blue-600 mb-0.5">
                      {event.date.getMonth() + 1}월 {event.date.getDate()}일{" "}
                      {event.time}
                    </span>
                    <p className="text-sm font-bold text-gray-900">
                      {event.title}
                    </p>
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
