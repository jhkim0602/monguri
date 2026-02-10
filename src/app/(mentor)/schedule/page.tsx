"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useModal } from "@/contexts/ModalContext";
import { ChevronLeft, ChevronRight, Clock, Video, Calendar as CalendarIcon, AlertCircle, FileText, Plus, Repeat } from "lucide-react";
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
  mentor_note?: string | null;
};

type Event = {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: "mentoring";
  source?: "request" | "scheduled";
};

type Mentee = {
  mentorMenteeId: string;
  menteeId: string;
  name: string;
};

type MentorMeeting = {
  id: string;
  mentor_mentee_id: string;
  mentor_id: string;
  mentee_id: string;
  topic: string;
  confirmed_time: string;
  zoom_link: string | null;
  recurring_group_id: string | null;
  mentor_note?: string | null;
};

function SchedulePageContent() {
  const { openModal, closeModal } = useModal();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [requests, setRequests] = useState<Request[]>([]);
  const [confirmedRequests, setConfirmedRequests] = useState<Request[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Meeting creation state
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [mentorMeetings, setMentorMeetings] = useState<MentorMeeting[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const searchParams = useSearchParams();

  // Auto-open add modal when openAdd=true in URL
  useEffect(() => {
    if (searchParams.get("openAdd") === "true") {
      setShowAddModal(true);
    }
  }, [searchParams]);
  const [addMenteeId, setAddMenteeId] = useState("");
  const [addMentorMenteeId, setAddMentorMenteeId] = useState("");
  const [addTopic, setAddTopic] = useState("멘토링");
  const [addMenteeDescription, setAddMenteeDescription] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addTime, setAddTime] = useState("14:00");
  const [addRecurrence, setAddRecurrence] = useState<'none' | 'weekly' | 'biweekly'>('none');
  const [addRepeatCount, setAddRepeatCount] = useState(4);
  const [addRepeatEndType, setAddRepeatEndType] = useState<'count' | 'date'>('count');
  const [addRepeatEndDate, setAddRepeatEndDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const formatMeetingDateTime = (value?: string | null) => {
    if (!value) return "시간 미정";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "시간 미정";

    return date.toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const normalizeDateTimeToIso = (value?: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  };

  // Fetch mentee list
  const fetchMentees = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("mentor_mentee")
      .select("id, mentee_id, mentee:profiles!mentor_mentee_mentee_id_fkey(name)")
      .eq("mentor_id", user.id)
      .eq("status", "active");

    if (data) {
      const list = data.map((d: any) => ({
        mentorMenteeId: d.id,
        menteeId: d.mentee_id,
        name: d.mentee?.name ?? "학생",
      }));
      setMentees(list);
      if (list.length > 0) {
        setAddMenteeId(list[0].menteeId);
        setAddMentorMenteeId(list[0].mentorMenteeId);
      }
    }
  };

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
            title: request.studentName,
            date,
            time: date.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "mentoring" as const,
            source: "request" as const,
          };
        })
        .filter(Boolean) as Event[];

      // Fetch mentor_meetings (직접 추가한 미팅)
      const { data: scheduledMeetings } = await supabase
        .from("mentor_meetings")
        .select("*")
        .eq("mentor_id", user.id)
        .order("confirmed_time", { ascending: true });

      if (scheduledMeetings) {
        setMentorMeetings(scheduledMeetings);
        const mentorEvents = scheduledMeetings
          .map((m: MentorMeeting) => {
            const date = new Date(m.confirmed_time);
            if (Number.isNaN(date.getTime())) return null;
            const mentee = mentees.find((mt: Mentee) => mt.menteeId === m.mentee_id);
            return {
              id: m.id,
              title: mentee?.name ?? "학생",
              date,
              time: date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
              type: "mentoring" as const,
              source: "scheduled" as const,
            };
          })
          .filter(Boolean) as Event[];
        confirmedEvents.push(...mentorEvents);
      }

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
    fetchMentees();
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("schedule_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meeting_requests" },
        () => { fetchData(); },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mentor_meetings" },
        () => { fetchData(); },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentees]);

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
                  {formatMeetingDateTime(t)}
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
        const normalizedSelectedTime = normalizeDateTimeToIso(selectedTime);
        if (!normalizedSelectedTime) {
          alert("선택한 시간 형식이 올바르지 않습니다.");
          return;
        }

        const { error } = await supabase
          .from("meeting_requests")
          .update({
            status: "CONFIRMED",
            confirmed_time: normalizedSelectedTime,
            // Optional: Zoom link can be added later
            zoom_link: null,
          })
          .eq("id", req.id);

        if (!error) {
          const currentUser = (await supabase.auth.getUser()).data.user;
          const mentorId = currentUser?.id;

          // Send system message to chat
          const { error: chatError } = await supabase
            .from("chat_messages")
            .insert({
              mentor_mentee_id: req.mentor_mentee_id,
              sender_id: mentorId,
              body: `MEETING_CONFIRMED:${req.id}`,
              message_type: "system",
            });

          if (chatError) {
            console.error("Failed to send system message:", chatError);
          }

          // Get mentee info for notification
          const { data: mentorMenteeData } = await supabase
            .from("mentor_mentee")
            .select("mentee_id, mentee:profiles!mentor_mentee_mentee_id_fkey(name)")
            .eq("id", req.mentor_mentee_id)
            .single();

          const menteeId = mentorMenteeData?.mentee_id;

          if (menteeId) {
            // Get mentor profile for avatar
            const { data: mentorProfile } = await supabase
              .from("profiles")
              .select("name, avatar_url")
              .eq("id", mentorId)
              .single();

            const confirmedDateStr = new Date(normalizedSelectedTime).toLocaleString("ko-KR", {
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            });

            // Send notification to mentee
            await supabase.from("notifications").insert({
              recipient_id: menteeId,
              recipient_role: "mentee",
              type: "meeting_confirmed",
              ref_type: "meeting_requests",
              ref_id: req.id,
              title: "미팅 일정이 확정되었습니다",
              message: `${confirmedDateStr}에 미팅이 예정되어 있습니다. 화상 회의 링크는 곧 등록될 예정입니다.`,
              action_url: `/chat?scrollTo=${req.id}`,
              actor_id: mentorId,
              avatar_url: mentorProfile?.avatar_url ?? null,
              meta: {
                mentorMenteeId: req.mentor_mentee_id,
                meetingRequestId: req.id,
                confirmedTime: normalizedSelectedTime,
              },
            });
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

    // 모달 닫기 시 자동 저장 로직
    const handleAutoSaveOnClose = async () => {
      const linkInput = document.getElementById(`zoom-link-${req.id}`) as HTMLInputElement;
      const noteInput = document.getElementById(`mentor-note-${req.id}`) as HTMLTextAreaElement;

      const newLink = linkInput?.value?.trim() || null;
      const newNote = noteInput?.value?.trim() || null;

      const linkChanged = newLink !== (req.zoom_link || null);
      const noteChanged = newNote !== (req.mentor_note || null);

      if (!linkChanged && !noteChanged) return;

      // 변경된 내용 저장
      const updateData: { zoom_link?: string | null; mentor_note?: string | null } = {};
      if (linkChanged) updateData.zoom_link = newLink;
      if (noteChanged) updateData.mentor_note = newNote;

      const { error } = await supabase
        .from("meeting_requests")
        .update(updateData)
        .eq("id", req.id);

      if (error) {
        console.error("자동 저장 실패:", error);
        return;
      }

      // 링크가 새로 추가된 경우에만 알림 전송
      if (linkChanged && newLink && !req.zoom_link) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        const mentorId = currentUser?.id;

        const { data: mentorMenteeData } = await supabase
          .from("mentor_mentee")
          .select("mentee_id")
          .eq("id", req.mentor_mentee_id)
          .single();

        const menteeId = mentorMenteeData?.mentee_id;

        if (menteeId && mentorId) {
          const { data: mentorProfile } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", mentorId)
            .single();

          const meetingDateStr = req.confirmed_time
            ? new Date(req.confirmed_time).toLocaleString("ko-KR", {
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
            ref_id: req.id,
            title: "화상 회의 링크가 등록되었습니다",
            message: `${meetingDateStr} 미팅의 화상 회의 링크가 준비되었습니다. 채팅에서 확인하세요!`,
            action_url: `/chat?scrollTo=${req.id}`,
            actor_id: mentorId,
            avatar_url: mentorProfile?.avatar_url ?? null,
            meta: {
              mentorMenteeId: req.mentor_mentee_id,
              meetingRequestId: req.id,
              zoomLink: newLink,
            },
          });
        }
      }

      fetchData();
    };

    openModal({
      title: "상담 상세 정보",
      size: "2xl",
      onClose: handleAutoSaveOnClose, // 닫기 시 자동 저장
      content: (
        <div className="space-y-6">
           {/* Modal Title */}
           <h2 className="text-xl font-black text-gray-900">미팅 정보</h2>

           {/* Date & Student Info - Table Style */}
           <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center border-b border-gray-100 py-3 px-4">
                 <span className="w-24 text-sm font-bold text-gray-400 shrink-0">일정</span>
                 <span className="text-sm font-bold text-gray-900">{fullDateStr} {timeStr}</span>
              </div>
              <div className="flex items-center border-b border-gray-100 py-3 px-4">
                 <span className="w-24 text-sm font-bold text-gray-400 shrink-0">학생</span>
                 <span className="text-sm font-bold text-gray-900">{req.studentName}</span>
              </div>
              <div className="flex items-start py-3 px-4">
                 <span className="w-24 text-sm font-bold text-gray-400 shrink-0">상담 주제</span>
                 <span className="text-sm font-medium text-gray-700 leading-relaxed">{req.topic}</span>
              </div>
           </div>

           {/* Zoom Link Input Section */}
           <div className="space-y-3">
              <div className="flex items-center gap-2">
                 <Video size={18} className="text-gray-900" />
                 <h4 className="font-bold text-gray-900 text-lg">화상 회의 링크</h4>
              </div>

              <input
                 id={`zoom-link-${req.id}`}
                 type="text"
                 placeholder="https://zoom.us/j/... (닫을 때 자동 저장)"
                 defaultValue={req.zoom_link || ""}
                 className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300 font-medium"
              />

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

           {/* Mentor Note Section */}
           <div className="space-y-3">
              <div className="flex items-center gap-2">
                 <FileText size={18} className="text-gray-900" />
                 <h4 className="font-bold text-gray-900 text-lg">나만의 메모</h4>
                 <span className="text-[10px] text-gray-400 font-medium">(멘티에게 보이지 않음)</span>
              </div>

              <textarea
                 id={`mentor-note-${req.id}`}
                 placeholder="미팅 전 준비사항, 논의할 내용 등을 메모해두세요... (닫을 때 자동 저장)"
                 defaultValue={req.mentor_note || ""}
                 rows={3}
                 className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-300 font-medium resize-none"
              />
           </div>

           {/* Auto-save indicator */}
           <p className="text-center text-[10px] text-gray-400 pt-2">
              * 변경사항은 닫기 시 자동 저장됩니다
           </p>
        </div>
      ),
      type: "default",
      confirmText: "닫기"
    });
  }

  /* Detail handler for mentor-created meetings (mentor_meetings table) */
  const handleScheduledMeetingDetail = (meeting: MentorMeeting) => {
    const dateObj = new Date(meeting.confirmed_time);
    const timeStr = dateObj.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit', hour12: false });
    const fullDateStr = dateObj.toLocaleDateString("ko-KR", { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    const menteeName = mentees.find((mt) => mt.menteeId === meeting.mentee_id)?.name ?? "학생";

    const handleAutoSaveOnClose = async () => {
      const linkInput = document.getElementById(`zoom-link-sm-${meeting.id}`) as HTMLInputElement;
      const noteInput = document.getElementById(`mentor-note-sm-${meeting.id}`) as HTMLTextAreaElement;

      const newLink = linkInput?.value?.trim() || null;
      const newNote = noteInput?.value?.trim() || null;

      const linkChanged = newLink !== (meeting.zoom_link || null);
      const noteChanged = newNote !== (meeting.mentor_note || null);

      if (!linkChanged && !noteChanged) return;

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) return;

        const res = await fetch('/api/mentor/scheduled-meetings', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            meetingId: meeting.id,
            zoomLink: linkChanged ? newLink : undefined,
            mentorNote: noteChanged ? newNote : undefined
          }),
        });

        if (!res.ok) {
          console.error("저장 실패");
        }
      } catch (e) {
        console.error("저장 에러:", e);
      }

      fetchData();
    };

    const handleCancelMeeting = async () => {
      const confirmed = window.confirm(
        `"${meeting.topic}" 미팅을 취소하시겠습니까?\n취소 시 멘티에게 알림이 전송됩니다.`
      );
      if (!confirmed) return;

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) return;

        const res = await fetch('/api/mentor/scheduled-meetings', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ meetingId: meeting.id }),
        });

        if (res.ok) {
          closeModal();
          fetchData();
        } else {
          alert("미팅 취소에 실패했습니다.");
        }
      } catch (e) {
        console.error("취소 에러:", e);
        alert("미팅 취소 중 오류가 발생했습니다.");
      }
    };

    openModal({
      title: "미팅 상세 정보",
      size: "2xl",
      onClose: handleAutoSaveOnClose,
      content: (
        <div className="space-y-6">
           <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-gray-900">미팅 정보</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600">직접등록</span>
              {meeting.recurring_group_id && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-600 flex items-center gap-0.5">
                  <Repeat size={10} /> 정기미팅
                </span>
              )}
           </div>

           <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center border-b border-gray-100 py-3 px-4">
                 <span className="w-24 text-sm font-bold text-gray-400 shrink-0">일정</span>
                 <span className="text-sm font-bold text-gray-900">{fullDateStr} {timeStr}</span>
              </div>
              <div className="flex items-center border-b border-gray-100 py-3 px-4">
                 <span className="w-24 text-sm font-bold text-gray-400 shrink-0">학생</span>
                 <span className="text-sm font-bold text-gray-900">{menteeName}</span>
              </div>
              <div className="flex items-start py-3 px-4">
                 <span className="w-24 text-sm font-bold text-gray-400 shrink-0">상담 주제</span>
                 <span className="text-sm font-medium text-gray-700 leading-relaxed">{meeting.topic}</span>
              </div>
           </div>

           <div className="space-y-3">
              <div className="flex items-center gap-2">
                 <Video size={18} className="text-gray-900" />
                 <h4 className="font-bold text-gray-900 text-lg">화상 회의 링크</h4>
              </div>

              <input
                 id={`zoom-link-sm-${meeting.id}`}
                 type="text"
                 placeholder="https://zoom.us/j/... (닫을 때 자동 저장)"
                 defaultValue={meeting.zoom_link || ""}
                 className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300 font-medium"
              />
              <p className="text-[10px] text-orange-500 font-medium">
                 💡 줌 링크를 등록하면 멘티에게 자동으로 알림이 전송됩니다
              </p>

              {meeting.zoom_link && (
                 <a
                    href={meeting.zoom_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md mt-2"
                 >
                    회의실 입장하기 <ChevronRight size={16} className="ml-1" />
                 </a>
              )}
           </div>

           <div className="space-y-3">
              <div className="flex items-center gap-2">
                 <FileText size={18} className="text-gray-900" />
                 <h4 className="font-bold text-gray-900 text-lg">나만의 메모</h4>
                 <span className="text-[10px] text-gray-400 font-medium">(멘티에게 보이지 않음)</span>
              </div>

              <textarea
                 id={`mentor-note-sm-${meeting.id}`}
                 placeholder="미팅 전 준비사항, 논의할 내용 등을 메모해두세요... (닫을 때 자동 저장)"
                 defaultValue={meeting.mentor_note || ""}
                 rows={3}
                 className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-gray-300 font-medium resize-none"
              />
           </div>

           <p className="text-center text-[10px] text-gray-400 pt-2">
              * 변경사항은 닫기 시 자동 저장됩니다
           </p>

           {/* 미팅 취소 */}
           <div className="pt-2 border-t border-gray-100">
             <button
               onClick={handleCancelMeeting}
               className="w-full py-2.5 text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
             >
               미팅 취소하기
             </button>
           </div>
        </div>
      ),
      type: "default",
      confirmText: "닫기"
    });
  }

  /* Day Click Handler for Detailed View & Zoom Link Management */
  const handleDayClick = (dayDate: Date) => {
    const year = dayDate.getFullYear();
    const month = dayDate.getMonth() + 1;
    const date = dayDate.getDate();
    const weekday = dayDate.toLocaleDateString("ko-KR", { weekday: "short" });

    const dayRequests = confirmedRequests.filter(
      (req) =>
        req.status === "CONFIRMED" &&
        req.confirmed_time &&
        new Date(req.confirmed_time).getDate() === dayDate.getDate() &&
        new Date(req.confirmed_time).getMonth() === dayDate.getMonth() &&
        new Date(req.confirmed_time).getFullYear() === dayDate.getFullYear(),
    );
    dayRequests.sort(
      (a, b) =>
        new Date(a.confirmed_time!).getTime() -
        new Date(b.confirmed_time!).getTime(),
    );

    // Also include mentor_meetings for this day
    const dayScheduled = mentorMeetings.filter((m) => {
      const d = new Date(m.confirmed_time);
      return d.getDate() === dayDate.getDate() &&
        d.getMonth() === dayDate.getMonth() &&
        d.getFullYear() === dayDate.getFullYear();
    });

    const totalCount = dayRequests.length + dayScheduled.length;

    openModal({
      title: "일정 관리",
      size: "2xl",
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
             <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => {
                    closeModal();
                    setAddDate(formatDateInput(dayDate));
                    setAddTime("14:00");
                    setAddTopic("멘토링");
                    setAddRecurrence('none');
                    if (mentees.length > 0) {
                      setAddMenteeId(mentees[0].menteeId);
                      setAddMentorMenteeId(mentees[0].mentorMenteeId);
                    }
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
                >
                  <Plus size={14} strokeWidth={3} />
                  미팅 추가
                </button>
                <div className="font-black text-gray-900 text-xl">{totalCount} <span className="font-normal text-gray-400 text-sm">sessions</span></div>
             </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {totalCount === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-300 py-10">
                  <CalendarIcon size={48} strokeWidth={1} className="mb-4 text-gray-200" />
                  <p className="text-base font-medium text-gray-400">일정이 없습니다.</p>
               </div>
            ) : (
               <div className="space-y-3">
                  {/* Confirmed requests */}
                  {dayRequests.map((req) => {
                     const dateObj = new Date(req.confirmed_time!);
                     const timeStr = dateObj.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit', hour12: false });
                     const endTimeObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
                     const endTimeStr = endTimeObj.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit', hour12: false });

                     return (
                        <div
                           key={req.id}
                           onClick={() => handleMeetingDetail(req)}
                           className="group relative bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all rounded-2xl p-4 cursor-pointer flex items-center gap-4 active:scale-[0.99]"
                        >
                           <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl w-16 h-16 shrink-0 group-hover:bg-blue-50 transition-colors">
                              <span className="text-sm font-black text-gray-900">{timeStr}</span>
                              <span className="text-[10px] font-bold text-gray-400">~{endTimeStr}</span>
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                 <h3 className="text-base font-bold text-gray-900 truncate">{req.studentName}</h3>
                                 <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600">상담요청</span>
                              </div>
                              <p className="text-xs text-gray-500 truncate">{req.topic}</p>
                           </div>
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

                  {/* Mentor scheduled meetings */}
                  {dayScheduled.map((m) => {
                     const dateObj = new Date(m.confirmed_time);
                     const timeStr = dateObj.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit', hour12: false });
                     const endTimeObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
                     const endTimeStr = endTimeObj.toLocaleTimeString("ko-KR", { hour: '2-digit', minute: '2-digit', hour12: false });
                     const menteeName = mentees.find((mt) => mt.menteeId === m.mentee_id)?.name ?? "학생";

                     return (
                        <div
                           key={m.id}
                           onClick={() => handleScheduledMeetingDetail(m)}
                           className="group relative bg-white border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all rounded-2xl p-4 cursor-pointer flex items-center gap-4 active:scale-[0.99]"
                        >
                           <div className="flex flex-col items-center justify-center bg-orange-50 rounded-xl w-16 h-16 shrink-0">
                              <span className="text-sm font-black text-gray-900">{timeStr}</span>
                              <span className="text-[10px] font-bold text-gray-400">~{endTimeStr}</span>
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                 <h3 className="text-base font-bold text-gray-900 truncate">{menteeName}</h3>
                                 <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-50 text-orange-600">직접등록</span>
                                 {m.recurring_group_id && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-500 flex items-center gap-0.5">
                                       <Repeat size={8} /> 정기
                                    </span>
                                 )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">{m.topic}</p>
                           </div>
                           <div className="shrink-0 flex items-center gap-3">
                              {m.zoom_link ? (
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
                           </div>
                        </div>
                     )
                  })}
               </div>
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-gray-50 text-center">
             <p className="text-[10px] text-gray-400 font-medium">
                * 일정을 클릭하여 줌 링크를 등록하세요.
             </p>
          </div>
        </div>
      ),
      type: "default",
    });
  };

  // Meeting creation helpers
  const pad2 = (v: number) => String(v).padStart(2, "0");
  const formatDateInput = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  const openAddMeetingModal = () => {
    const base = new Date();
    setAddDate(formatDateInput(base));
    setAddTime("14:00");
    setAddTopic("멘토링");
    setAddRecurrence('none');
    setAddRepeatEndType('date');
    setAddRepeatEndDate(formatDateInput(new Date(base.getFullYear(), base.getMonth() + 2, base.getDate())));
    if (mentees.length > 0) {
      setAddMenteeId(mentees[0].menteeId);
      setAddMentorMenteeId(mentees[0].mentorMenteeId);
    }
    setShowAddModal(true);
  };

  const generateMeetingDates = () => {
    if (!addDate || !addTime) return [];
    const [year, month, day] = addDate.split('-').map(Number);
    const [hour, min] = addTime.split(':').map(Number);
    const baseDate = new Date(year, month - 1, day, hour, min);

    if (addRecurrence === 'none') return [baseDate];

    const intervalDays = addRecurrence === 'biweekly' ? 14 : 7;
    const dates: Date[] = [];
    const endDate = new Date(addRepeatEndDate + 'T23:59:59');
    let cursor = new Date(baseDate);
    while (cursor <= endDate) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + intervalDays);
    }
    return dates;
  };

  const handleSaveMeeting = async () => {
    if (!addMenteeId || !addMentorMenteeId || !addDate || !addTime) return;
    setIsSaving(true);
    try {
      const meetingDates = generateMeetingDates();
      if (meetingDates.length === 0) return;

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Unauthorized");

      const res = await fetch('/api/mentor/scheduled-meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentorMenteeId: addMentorMenteeId,
          menteeId: addMenteeId,
          topic: addTopic || '멘토링',
          menteeDescription: addMenteeDescription || undefined,
          meetings: meetingDates.map(d => ({ confirmed_time: d.toISOString() })),
          recurrenceRule: addRecurrence !== 'none' ? {
            type: addRecurrence,
            start: addDate,
            endType: addRepeatEndType,
            count: addRepeatCount,
            endDate: addRepeatEndDate,
          } : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      setShowAddModal(false);
      fetchData();
    } catch (e: any) {
      console.error('Save meeting error:', e);
      alert(`미팅 저장 실패: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
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
              onClick={openAddMeetingModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={14} strokeWidth={3} />
              일정 추가
            </button>
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
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate w-full ${
                          event.source === 'scheduled'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {event.title} {event.time}
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
              requests.map((req) => {
                const firstPreferredTime = req.preferred_times?.[0] ?? null;
                const extraPreferredTimes = Math.max(
                  (req.preferred_times?.length ?? 0) - 1,
                  0,
                );

                return (
                  <div
                    key={req.id}
                    className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 truncate">
                          {req.studentName} 학생
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                          요청됨
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2 truncate">
                        {req.topic}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span className="font-bold text-gray-700">
                            {formatMeetingDateTime(firstPreferredTime)}
                            {extraPreferredTimes > 0
                              ? ` 외 ${extraPreferredTimes}개`
                              : ""}
                          </span>
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
                );
              })
            )}
            {!isLoading && requests.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                대기 중인 요청이 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex-1 p-6 overflow-hidden flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4">다가오는 일정</h3>
          <div className="flex-1 space-y-0 relative overflow-y-auto custom-scrollbar">
            <div className="absolute left-[7px] top-2 bottom-0 w-0.5 bg-gray-100" />
            {(() => {
              // Merge confirmedRequests + mentorMeetings for upcoming schedule
              type UpcomingItem = { id: string; studentName: string; topic: string; confirmed_time: string; zoom_link?: string | null; mentor_note?: string | null; source: 'request' | 'scheduled' };
              const fromRequests: UpcomingItem[] = confirmedRequests
                .filter((req) => req.confirmed_time && new Date(req.confirmed_time).getTime() >= Date.now())
                .map((req) => ({ id: req.id, studentName: req.studentName, topic: req.topic, confirmed_time: req.confirmed_time!, zoom_link: req.zoom_link, mentor_note: req.mentor_note, source: 'request' as const }));
              const fromScheduled: UpcomingItem[] = mentorMeetings
                .filter((m) => new Date(m.confirmed_time).getTime() >= Date.now())
                .map((m) => ({ id: m.id, studentName: mentees.find((mt) => mt.menteeId === m.mentee_id)?.name ?? '학생', topic: m.topic, confirmed_time: m.confirmed_time, zoom_link: m.zoom_link, source: 'scheduled' as const }));
              const upcomingMeetings = [...fromRequests, ...fromScheduled]
                .sort((a, b) => new Date(a.confirmed_time).getTime() - new Date(b.confirmed_time).getTime())
                .slice(0, 5);

              if (upcomingMeetings.length === 0) {
                return (
                  <div className="text-xs text-gray-400 pl-6">다가오는 일정이 없습니다.</div>
                );
              }

              return upcomingMeetings.map((meeting) => {
                const dateObj = new Date(meeting.confirmed_time!);
                const timeStr = dateObj.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
                const isScheduled = meeting.source === 'scheduled';

                return (
                  <div
                    key={meeting.id}
                    onClick={() => {
                      if (isScheduled) {
                        handleDayClick(dateObj);
                      } else {
                        const req = confirmedRequests.find(r => r.id === meeting.id);
                        if (req) handleMeetingDetail(req);
                      }
                    }}
                    className="flex gap-4 relative pb-4 cursor-pointer group"
                  >
                    <div className={`w-4 h-4 rounded-full bg-white border-4 shrink-0 z-10 ${isScheduled ? 'border-orange-400' : 'border-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-bold ${isScheduled ? 'text-orange-600' : 'text-blue-600'}`}>
                          {dateObj.getMonth() + 1}월 {dateObj.getDate()}일 {timeStr}
                        </span>
                        {meeting.zoom_link ? (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                            <Video size={10} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 animate-pulse">
                            <AlertCircle size={10} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {meeting.studentName}
                        </p>
                        {isScheduled && (
                          <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-orange-50 text-orange-500">직접등록</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{meeting.topic}</p>
                      {meeting.mentor_note && (
                        <div className="flex items-center gap-1 mt-1">
                          <FileText size={10} className="text-purple-400 shrink-0" />
                          <p className="text-[10px] text-purple-500 truncate">{meeting.mentor_note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Meeting Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Plus size={18} /> 미팅 일정 추가
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="text-gray-400 text-lg">&times;</span>
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* 멘티 선택 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">멘티 선택</label>
                <select
                  value={addMenteeId}
                  onChange={(e) => {
                    const m = mentees.find(mt => mt.menteeId === e.target.value);
                    if (m) { setAddMenteeId(m.menteeId); setAddMentorMenteeId(m.mentorMenteeId); }
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  {mentees.map(m => (
                    <option key={m.menteeId} value={m.menteeId}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* 주제 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">주제</label>
                <input
                  type="text"
                  value={addTopic}
                  onChange={(e) => setAddTopic(e.target.value)}
                  placeholder="미팅 주제를 입력하세요"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* 멘티에게 전달할 메시지 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">멘티에게 전달할 메시지 <span className="text-gray-300 font-normal">(선택)</span></label>
                <textarea
                  value={addMenteeDescription}
                  onChange={(e) => setAddMenteeDescription(e.target.value)}
                  placeholder="예: 이번 주 포트폴리오 리뷰 시간입니다"
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>

              {/* 날짜 & 시간 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">날짜</label>
                  <input
                    type="date"
                    value={addDate}
                    onChange={(e) => setAddDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">시간</label>
                  <input
                    type="time"
                    value={addTime}
                    onChange={(e) => setAddTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveMeeting}
                disabled={isSaving || !addMenteeId || !addDate || !addTime}
                className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSaving ? '저장 중...' : '미팅 추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAFA]" />}>
      <SchedulePageContent />
    </Suspense>
  );
}
