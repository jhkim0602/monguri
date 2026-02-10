"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  MessageCircle,
  ChevronRight,
  FileText,
  FolderOpen,
  Tag,
  Paperclip,
  Plus,
  X,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Video,
} from "lucide-react";
import { motion } from "framer-motion";
import { MentorMentee, MentorTask } from "@/types/mentor";
import { supabase } from "@/lib/supabaseClient";

type UpcomingMeeting = {
  id: string;
  studentName: string;
  topic: string;
  confirmedTime: string;
  zoomLink: string | null;
  mentorNote: string | null;
  source?: "request" | "scheduled";
};

type DashboardDataProps = {
  mentorName: string;
  mentorId?: string | null;
  mentees: MentorMentee[];
  recentActivity: MentorTask[];
  recentChats: {
    id: string;
    menteeName: string;
    menteeAvatarUrl: string | null;
    lastMessage: string;
    lastMessageAt: string | null;
    unreadCount: number;
  }[];
  recentFeedback: {
    id: string;
    type: "task" | "plan" | "self";
    title: string;
    subtitle: string;
    studentName: string;
    studentAvatarUrl: string | null;
    date: string;
    status: "pending" | "completed" | "reviewed" | "submitted";
  }[];
  upcomingMeetings?: UpcomingMeeting[];
  stats: {
    totalMentees: number;
    pendingFeedback: number;
    activeAlerts: number;
  };
};

type MaterialOption = {
  id: string;
  title: string;
};

type SubjectOption = {
  id: string;
  name: string;
  colorHex?: string | null;
  textColorHex?: string | null;
};

type WeaknessSolution = {
  id: string;
  title: string;
  subjectId: string | null;
  subjectName: string | null;
  materialId: string | null;
  materialTitle: string | null;
  createdAt: string;
};

export default function DashboardClient({
  mentorName,
  mentorId,
  mentees,
  recentActivity,
  recentChats,
  recentFeedback,
  upcomingMeetings = [],
  stats,
}: DashboardDataProps) {
  const isMountedRef = useRef(true);

  const formatPreviewTime = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateBadge = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const [materialOptions, setMaterialOptions] = useState<MaterialOption[]>([]);
  const [isMaterialsLoading, setIsMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [weaknessSolutions, setWeaknessSolutions] = useState<
    WeaknessSolution[]
  >([]);
  const [isSolutionsLoading, setIsSolutionsLoading] = useState(false);
  const [solutionsError, setSolutionsError] = useState<string | null>(null);
  const [isSolutionSubmitting, setIsSolutionSubmitting] = useState(false);

  const subjectBadgeStyles: Record<string, string> = {
    국어: "bg-emerald-50 text-emerald-700 border-emerald-100",
    수학: "bg-blue-50 text-blue-700 border-blue-100",
    영어: "bg-rose-50 text-rose-700 border-rose-100",
    기타: "bg-gray-100 text-gray-600 border-gray-200",
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadMaterials = useCallback(async () => {
    if (!mentorId) return;
    setIsMaterialsLoading(true);
    setMaterialsError(null);

    try {
      const res = await fetch(
        `/api/mentor/materials?mentorId=${encodeURIComponent(mentorId)}`,
      );
      const json = await res.json();
      if (!isMountedRef.current) return;
      if (json.success && Array.isArray(json.data)) {
        setMaterialOptions(
          json.data.map((item: { id: string; title: string }) => ({
            id: item.id,
            title: item.title,
          })),
        );
      } else {
        setMaterialsError("자료실 정보를 불러오지 못했습니다.");
      }
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("Dashboard materials fetch failed:", error);
      setMaterialsError("자료실 정보를 불러오지 못했습니다.");
    } finally {
      if (isMountedRef.current) setIsMaterialsLoading(false);
    }
  }, [mentorId]);

  useEffect(() => {
    if (!mentorId) return;
    loadMaterials();
  }, [mentorId, loadMaterials]);

  const loadWeaknessSolutions = useCallback(async () => {
    if (!mentorId) return;
    setIsSolutionsLoading(true);
    setSolutionsError(null);

    try {
      const res = await fetch(
        `/api/mentor/weakness-solutions?mentorId=${encodeURIComponent(mentorId)}`,
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load solutions.");
      }

      if (!isMountedRef.current) return;
      setWeaknessSolutions(
        Array.isArray(json.data?.solutions) ? json.data.solutions : [],
      );
      setSubjectOptions(
        Array.isArray(json.data?.subjects) ? json.data.subjects : [],
      );
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("Dashboard weakness solutions fetch failed:", error);
      setSolutionsError("약점 맞춤 솔루션을 불러오지 못했습니다.");
    } finally {
      if (isMountedRef.current) setIsSolutionsLoading(false);
    }
  }, [mentorId]);

  useEffect(() => {
    if (!mentorId) return;
    loadWeaknessSolutions();
  }, [mentorId, loadWeaknessSolutions]);

  useEffect(() => {
    if (!mentorId) return;
    const channel = supabase
      .channel(`mentor-weakness:${mentorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mentor_weakness_solutions",
          filter: `mentor_id=eq.${mentorId}`,
        },
        () => {
          loadWeaknessSolutions();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentorId, loadWeaknessSolutions]);

  const handleAddWeaknessSolution = async (payload: {
    title: string;
    subjectId: string;
    materialId: string;
  }) => {
    const trimmedTitle = payload.title.trim();
    if (!mentorId || !trimmedTitle) return false;

    setIsSolutionSubmitting(true);
    try {
      const response = await fetch("/api/mentor/weakness-solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId,
          title: trimmedTitle,
          subjectId: payload.subjectId || null,
          materialId: payload.materialId || null,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to create solution.");
      }

      await loadWeaknessSolutions();
      return true;
    } catch (error) {
      console.error("Failed to create weakness solution:", error);
      setSolutionsError("약점 맞춤 솔루션을 추가하지 못했습니다.");
      return false;
    } finally {
      setIsSolutionSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section (Simple Welcome) */}
      <div className="mb-2">
        <h1 className="text-2xl font-black text-gray-900">대시보드</h1>
        <p className="text-gray-500 text-sm mt-1">
          {mentorName}님, 오늘 하루도 힘내세요! 👋
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-6 h-[720px]">
        {/* 1. Student Status Widget (Large Vertical) */}
        <div className="col-span-1 row-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Users size={18} />
              </div>
              <h3 className="font-bold text-gray-900">학생 현황</h3>
            </div>
            <Link
              href="/students"
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {mentees.map((student) => (
              <Link
                href={`/students/${student.id}`}
                key={student.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                    <img
                      src={
                        student.avatarUrl ||
                        `https://api.dicebear.com/7.x/notionists/svg?seed=${student.name}`
                      }
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-bold text-sm text-gray-900">
                      {student.name}
                    </h4>
                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold">
                      {student.grade}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 w-full mt-1">
                    <p className="text-xs text-gray-500 truncate">
                      <span className="font-bold text-gray-700">목표: </span>
                      {student.goal}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {/* 2. Feedback Inbox (Wide Horizontal) */}
        <div className="col-span-2 row-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <MessageSquare size={18} />
              </div>
              <h3 className="font-bold text-gray-900">피드백 대기</h3>
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {stats.pendingFeedback}
              </span>
            </div>
            <Link
              href="/mentor-feedback"
              className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center gap-1"
            >
              전체보기 <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex-1 min-h-0">
            {recentFeedback.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 font-medium">
                피드백 대기 항목이 없습니다.
              </div>
            ) : (
              <>
                <div className="space-y-3 h-full overflow-y-auto pr-1 custom-scrollbar">
                  {recentFeedback.map((item, idx) => (
                    <Link
                      href={`/mentor-feedback?itemId=${encodeURIComponent(item.id)}`}
                      key={idx}
                      className="group bg-gray-50 p-4 rounded-2xl flex items-start gap-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold flex-shrink-0 overflow-hidden">
                        {item.studentAvatarUrl ? (
                          <img
                            src={item.studentAvatarUrl}
                            alt={item.studentName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.studentName?.substring(0, 1) ||
                          item.title.substring(0, 1)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm text-gray-900 truncate pr-2">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {formatDateBadge(item.date)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate flex items-center gap-1">
                          <span className="font-bold text-gray-800">
                            {item.studentName || "이름 없음"}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span>
                            {item.type === "task"
                              ? "과제 제출"
                              : item.type === "plan"
                                ? "플래너"
                                : "자습"}
                          </span>
                        </p>
                      </div>
                      <span className="p-1 rounded-lg text-gray-400 group-hover:text-gray-900 transition-colors flex-shrink-0">
                        <ChevronRight size={18} />
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. Calendar / Schedule (Square) */}
        <motion.div
          className="col-span-1 row-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-shadow"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <CalendarIcon size={18} />
              </div>
              <h3 className="font-bold text-gray-900">다가오는 일정</h3>
              {upcomingMeetings.length > 0 && (
                <span className="bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {upcomingMeetings.length}
                </span>
              )}
            </div>
            <Link
              href="/schedule"
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="flex-1 space-y-0 relative overflow-y-auto custom-scrollbar">
            <div className="absolute left-[7px] top-2 bottom-0 w-0.5 bg-gray-100" />
            {upcomingMeetings.length === 0 ? (
              <div className="text-xs text-gray-400 pl-6">다가오는 일정이 없습니다.</div>
            ) : (
              <>
                {upcomingMeetings.slice(0, 3).map((meeting) => {
                  const dateObj = new Date(meeting.confirmedTime);
                  const timeStr = dateObj.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  const isScheduled = meeting.source === "scheduled";

                  return (
                    <Link
                      href="/schedule"
                      key={meeting.id}
                      className="flex gap-4 relative pb-4 group"
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white border-4 shrink-0 z-10 ${isScheduled ? "border-orange-400" : "border-emerald-500"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className={`text-xs font-bold ${isScheduled ? "text-orange-600" : "text-emerald-600"}`}
                          >
                            {dateObj.getMonth() + 1}월 {dateObj.getDate()}일 {timeStr}
                          </span>
                          {meeting.zoomLink ? (
                            <Video size={10} className="text-blue-600" />
                          ) : (
                            <div className="text-[10px] font-bold text-red-500 animate-pulse">링크 필요</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`text-sm font-bold text-gray-900 truncate transition-colors ${isScheduled ? "group-hover:text-orange-600" : "group-hover:text-emerald-600"}`}
                          >
                            {meeting.studentName}
                          </p>
                          <span
                            className={`px-1 py-0.5 rounded text-[8px] font-bold ${isScheduled ? "bg-orange-50 text-orange-500" : "bg-emerald-50 text-emerald-600"}`}
                          >
                            {isScheduled ? "멘토 등록" : "멘티 신청"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{meeting.topic || "멘토링 상담"}</p>
                        {meeting.mentorNote && (
                          <div className="flex items-center gap-1 mt-1">
                            <FileText size={10} className="text-purple-400 shrink-0" />
                            <p className="text-[10px] text-purple-500 truncate">{meeting.mentorNote}</p>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
                {upcomingMeetings.length > 3 && (
                  <Link
                    href="/schedule"
                    className="block text-center py-2 text-xs font-bold text-blue-600 hover:text-blue-700 rounded-lg transition-colors pl-6"
                  >
                    +{upcomingMeetings.length - 3}개 더보기
                  </Link>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* 4. Recent Chat (Wide Horizontal) - Bottom Row */}
        <div className="col-span-2 row-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <MessageCircle size={18} />
              </div>
              <h3 className="font-bold text-gray-900">최근 메시지</h3>
            </div>
            <Link
              href="/chat-mentor"
              className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center gap-1"
            >
              채팅 가기 <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-0 divide-y divide-gray-50 flex-1">
            {recentChats.length === 0 && (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 font-medium">
                최근 메시지가 없습니다.
              </div>
            )}
            {recentChats.map((chat) => (
              <Link
                href="/chat-mentor"
                key={chat.id}
                className="flex items-center gap-4 py-3 first:pt-0 hover:bg-gray-50 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-sm font-bold text-gray-600">
                    {chat.menteeAvatarUrl ? (
                      <img
                        src={chat.menteeAvatarUrl}
                        alt={chat.menteeName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      chat.menteeName?.substring(0, 1) || "멘"
                    )}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 min-w-3 h-3 px-1 bg-red-500 border-2 border-white rounded-full text-[8px] leading-none text-white font-bold flex items-center justify-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-sm font-bold text-gray-900">
                      {chat.menteeName}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {formatPreviewTime(chat.lastMessageAt)}
                    </span>
                  </div>
                  <p className="text-xs truncate text-gray-500">
                    {chat.lastMessage}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 5. Weakness Solution (Square) */}
        <div className="col-span-1 row-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow overflow-x-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <FileText size={18} />
              </div>
              <h3 className="font-bold text-gray-900">약점 맞춤 솔루션</h3>
            </div>
            <Link
              href="/materials"
              className="text-xs font-bold text-gray-400 hover:text-gray-900 flex items-center gap-1"
            >
              자료실 <ChevronRight size={14} />
            </Link>
          </div>

          <p className="text-[11px] text-gray-400 mb-3">
            보완점에 맞는 자료를 바로 연결합니다.
          </p>

          <div className="grid grid-cols-[minmax(0,1fr)_max-content_minmax(0,1fr)] gap-3 text-[11px] text-gray-400 font-bold pb-2 border-b border-gray-100">
            <div className="flex items-center gap-1">
              <FileText size={12} />
              보완점
            </div>
            <div className="flex items-center gap-1">
              <Tag size={12} />
              과목
            </div>
            <div className="flex items-center gap-1">
              <Paperclip size={12} />
              참고자료
            </div>
          </div>
          {solutionsError && (
            <p className="mt-1 text-[10px] text-rose-400">{solutionsError}</p>
          )}

          <div className="mt-2 flex-1 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
            <div className="space-y-1">
              {isSolutionsLoading && weaknessSolutions.length === 0 && (
                <div className="py-6 text-center text-xs text-gray-400 font-medium">
                  약점 맞춤 솔루션 불러오는 중...
                </div>
              )}
              {!isSolutionsLoading && weaknessSolutions.length === 0 && (
                <div className="py-6 text-center text-xs text-gray-400 font-medium">
                  등록된 솔루션이 없습니다.
                </div>
              )}
              {weaknessSolutions.map((item) => {
                const subjectLabel =
                  item.subjectName ||
                  subjectOptions.find((option) => option.id === item.subjectId)
                    ?.name ||
                  "기타";
                const subjectStyle =
                  subjectBadgeStyles[subjectLabel] ||
                  "bg-gray-50 text-gray-600 border-gray-200";
                const materialLabel =
                  item.materialTitle ||
                  materialOptions.find(
                    (option) => option.id === item.materialId,
                  )?.title ||
                  "";

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[minmax(0,1fr)_max-content_minmax(0,1fr)] gap-3 items-center py-2 px-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-800 truncate">
                        {item.title}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${subjectStyle}`}
                    >
                      {subjectLabel}
                    </span>
                    <div className="flex items-center gap-2 min-w-0 text-xs text-gray-500">
                      <Paperclip size={12} className="text-gray-400" />
                      {!materialLabel ? (
                        <span className="text-[11px] text-gray-300">
                          자료 없음
                        </span>
                      ) : (
                        <span className="block truncate">{materialLabel}</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 w-full flex items-center gap-2 px-2 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
                  <Plus size={14} />
                </span>
                새 항목 추가
              </button>
            </div>
          </div>
        </div>
      </div>
      <AddWeaknessSolutionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        materialOptions={materialOptions}
        isMaterialsLoading={isMaterialsLoading}
        materialsError={materialsError}
        onReloadMaterials={loadMaterials}
        subjectOptions={subjectOptions}
        isSubmitting={isSolutionSubmitting}
        onSubmit={async (payload) => {
          const success = await handleAddWeaknessSolution(payload);
          if (success) setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}

function AddWeaknessSolutionModal({
  isOpen,
  onClose,
  materialOptions,
  isMaterialsLoading,
  materialsError,
  onReloadMaterials,
  subjectOptions,
  isSubmitting,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  materialOptions: MaterialOption[];
  isMaterialsLoading: boolean;
  materialsError: string | null;
  onReloadMaterials: () => void;
  subjectOptions: SubjectOption[];
  isSubmitting: boolean;
  onSubmit: (payload: {
    title: string;
    subjectId: string;
    materialId: string;
  }) => Promise<void> | void;
}) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setSubjectId("");
      setMaterialId("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!subjectId && subjectOptions.length > 0) {
      setSubjectId(subjectOptions[0].id);
    }
  }, [isOpen, subjectId, subjectOptions]);

  if (!isOpen) return null;

  if (isLibraryOpen) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsLibraryOpen(false)}
        />
        <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FolderOpen size={20} className="text-amber-600" /> 자료 선택
            </h3>
            <button
              onClick={() => setIsLibraryOpen(false)}
              className="text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {isMaterialsLoading && (
              <div className="py-12 flex items-center justify-center text-gray-500 text-sm font-medium gap-2">
                <Loader2 size={16} className="animate-spin" />
                자료실 불러오는 중...
              </div>
            )}

            {!isMaterialsLoading && materialsError && (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <p className="text-sm font-medium text-red-500">
                  {materialsError}
                </p>
                <button
                  onClick={onReloadMaterials}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  다시 시도
                </button>
              </div>
            )}

            {!isMaterialsLoading &&
              !materialsError &&
              materialOptions.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-500 font-medium">
                  자료실에 등록된 자료가 없습니다.
                </div>
              )}

            {!isMaterialsLoading &&
              !materialsError &&
              materialOptions.map((material) => {
                const isSelected = material.id === materialId;

                return (
                  <div
                    key={material.id}
                    onClick={() => setMaterialId(material.id)}
                    className={`flex items-center justify-between p-3.5 mb-2 rounded-xl border transition-all cursor-pointer ${isSelected
                      ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-200 shadow-sm"
                      : "bg-white border-gray-200 hover:border-amber-200 hover:bg-amber-50/30"
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
                        <FileText size={17} />
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected
                          ? "bg-amber-500 border-amber-500 text-white"
                          : "border-gray-300 bg-white"
                          }`}
                      >
                        {isSelected && <CheckCircle2 size={12} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                          {material.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1 truncate">
                          자료실 파일
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end">
            <button
              onClick={() => setIsLibraryOpen(false)}
              className="px-6 py-2 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 shadow-lg"
            >
              선택 완료 {materialId ? "(1)" : "(0)"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-[28px] p-7 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 border border-gray-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              약점 맞춤 솔루션 추가
            </h2>
            <p className="text-gray-500 font-medium text-sm mt-1">
              보완점과 과목을 입력하고 자료실 자료를 연결하세요.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <FileText size={22} />
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({ title, subjectId, materialId });
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 block ml-1">
              보완점 제목
            </label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all shadow-sm"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 문법 복습지"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 block ml-1">
                과목
              </label>
              <select
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all shadow-sm"
              >
                {subjectOptions.length === 0 && (
                  <option value="" disabled>
                    과목 없음
                  </option>
                )}
                {subjectOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 block ml-1">
                참고자료 (자료실)
              </label>
              <button
                type="button"
                onClick={() => {
                  onReloadMaterials();
                  setIsLibraryOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-amber-200 rounded-2xl text-amber-700 font-bold text-sm hover:bg-amber-50/60 transition-all"
              >
                <FolderOpen size={16} />
                자료실에서 파일 가져오기
              </button>
            </div>
          </div>

          {materialId && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {materialOptions.find((item) => item.id === materialId)
                      ?.title || "선택한 자료"}
                  </p>
                  <p className="text-[11px] text-gray-400">자료실 파일</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMaterialId("")}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-600"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting || subjectOptions.length === 0}
              className="px-4 py-2 text-sm font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "추가 중..." : "추가하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
