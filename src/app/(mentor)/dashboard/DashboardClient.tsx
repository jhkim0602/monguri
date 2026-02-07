"use client";

import Link from "next/link";
import { useModal } from "@/contexts/ModalContext";
import {
  ArrowUpRight,
  Calendar as CalendarIcon,
  Users,
  TrendingUp,
  MessageSquare,
  MessageCircle,
  ChevronRight,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { MentorMentee, MentorTask } from "@/features/mentor/types";

type DashboardDataProps = {
  mentorName: string;
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
  stats: {
    totalMentees: number;
    pendingFeedback: number;
    activeAlerts: number;
  };
};

export default function DashboardClient({
  mentorName,
  mentees,
  recentActivity,
  recentChats,
  recentFeedback,
  stats,
}: DashboardDataProps) {
  const { openModal } = useModal();

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
          <button className="mt-4 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-xl transition-colors">
            + 학생 추가하기
          </button>
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

          <div className="space-y-3 flex-1">
            {recentFeedback.length === 0 && (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 font-medium">
                피드백 대기 항목이 없습니다.
              </div>
            )}
            {recentFeedback.slice(0, 3).map((item, idx) => (
                <Link
                  href={`/mentor-feedback?itemId=${encodeURIComponent(item.id)}`}
                  key={idx}
                  className="bg-gray-50 p-4 rounded-2xl flex items-start gap-4 hover:bg-gray-100 transition-colors"
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
            </div>
            <Link
              href="/schedule"
              className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
            <div className="h-full bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-gray-500 mb-2">
                일정 연동 준비중
              </p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                일정 기능이 연결되면
                <br />
                실제 상담/미팅 일정이 표시됩니다.
              </p>
            </div>
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

        {/* 5. Quick Analytics / Tip (Square) - Light Theme */}
        <div className="col-span-1 row-span-1 bg-indigo-50 rounded-3xl border border-indigo-100 p-6 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mb-3 text-indigo-600 shadow-sm border border-indigo-100">
              <TrendingUp size={18} />
            </div>
            <h3 className="font-bold text-lg leading-tight mb-1 text-indigo-900">
              주간 리포트
              <br />
              발송일입니다!
            </h3>
            <p className="text-indigo-600/80 text-xs font-medium">
              이번 주 학습 데이터를 확인하세요.
            </p>
            <button
              onClick={() =>
                openModal({
                  title: "리포트 생성",
                  content:
                    "주간 학습 리포트 생성을 시작하시겠습니까?\n생성에는 약 1-2분이 소요될 수 있습니다.",
                  type: "confirm",
                  confirmText: "생성 시작",
                  onConfirm: () =>
                    openModal({
                      title: "생성 완료",
                      content:
                        "✅ 주간 리포트가 성공적으로 생성되었습니다. 다운로드를 시작합니다.",
                      type: "success",
                    }),
                })
              }
              className="w-full py-2.5 bg-white text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-100 z-10 flex items-center justify-center gap-2"
            >
              리포트 생성 <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
