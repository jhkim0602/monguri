"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  MoreHorizontal,
  MapPin,
  GraduationCap,
  Clock,
  Calendar,
  CheckCircle2,
  Plus,
  FileText,
  Image as ImageIcon,
  Download,
  ExternalLink,
  X,
  ChevronRight,
  Filter,
} from "lucide-react";
import { STUDENTS_MOCK } from "@/constants/mentor";
import {
  MENTOR_TASKS,
  USER_TASKS,
  WEEKLY_SCHEDULE,
  DAILY_RECORDS,
} from "@/constants/mentee";
import AssignTaskModal from "@/components/mentor/tasks/AssignTaskModal";
import { useModal } from "@/contexts/ModalContext";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import DailyPlannerCard from "@/components/mentee/calendar/DailyPlannerCard";
import PlannerDetailModal from "@/components/mentee/calendar/PlannerDetailModal";
import { generateTimeBlocksFromTasks } from "@/utils/timeUtils";

export default function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { openModal } = useModal();
  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    type: "image" | "pdf";
    name: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPlannerDetailOpen, setIsPlannerDetailOpen] = useState(false);
  const student = STUDENTS_MOCK.find((s) => s.id === params.id);
  const [activeTab, setActiveTab] = useState<"planner" | "report">("planner");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 2)); // Default to Feb 2, 2026 (Mock Today)
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [dailyReview, setDailyReview] = useState("");

  // Helper to get Mon-Sun dates for the selected date's week
  const getWeekDates = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(d.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      week.push(nextDate);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);
  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!student) {
    return <div className="p-8">학생을 찾을 수 없습니다.</div>;
  }

  // Mock Tasks (mixing simulated real-time data)
  const allTasks = [...MENTOR_TASKS, ...USER_TASKS].sort((a, b) => {
    const da = a.deadline ? new Date(a.deadline).getTime() : 0;
    const db = b.deadline ? new Date(b.deadline).getTime() : 0;
    if (da !== db) return db - da;
    if (a.title !== b.title) return a.title > b.title ? 1 : -1;
    return String(a.id) > String(b.id) ? 1 : -1;
  });

  // Tasks for the selected date (for Card View)
  const currentDateTasks = allTasks.filter((task) => {
    if (!task.deadline) return false;
    const d = new Date(task.deadline);
    return (
      d.getFullYear() === selectedDate.getFullYear() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getDate() === selectedDate.getDate()
    );
  });

  // Filtered Tasks for List View (Date + UI Filters)
  const filteredListTasks = currentDateTasks.filter((task) => {
    // Category Filter
    if (
      filterCategory !== "all" &&
      (task.categoryId || (task as any).subject) !== filterCategory
    )
      return false;

    // Status Filter
    if (filterStatus !== "all") {
      if (filterStatus === "completed" && !task.completed) return false;
      if (filterStatus === "pending" && task.completed) return false;
    }
    return true;
  });

  // Data Processing for Planner Card (Single Day)
  const mentorDeadlines = currentDateTasks.filter((t) => t.isMentorTask);
  const userTasksRaw = currentDateTasks.filter((t) => !t.isMentorTask);
  const studyTimeBlocks = generateTimeBlocksFromTasks([
    ...mentorDeadlines,
    ...userTasksRaw,
  ]);

  // Find daily record/events for selected date
  const dailyRecord = DAILY_RECORDS.find(
    (r) =>
      r.date.getFullYear() === selectedDate.getFullYear() &&
      r.date.getMonth() === selectedDate.getMonth() &&
      r.date.getDate() === selectedDate.getDate(),
  ) || { studyTime: 0, memo: "" };

  const dailySchedule = WEEKLY_SCHEDULE.find(
    (s) =>
      s.date.getFullYear() === selectedDate.getFullYear() &&
      s.date.getMonth() === selectedDate.getMonth() &&
      s.date.getDate() === selectedDate.getDate(),
  );
  const dailyEvents = dailySchedule ? dailySchedule.events : [];

  return (
    <div className="space-y-6">
      <Link
        href="/students"
        className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        학생 목록으로 돌아가기
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex items-start justify-between">
        <div className="flex gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 shrink-0 overflow-hidden border-2 border-white shadow-lg shadow-gray-100">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-gray-900">
                {student.name}
              </h1>
              <span className="px-2.5 py-0.5 bg-gray-900 text-white text-xs font-bold rounded-lg">
                {student.grade}
              </span>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">
                D-{student.dDay}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-4">
              <span className="flex items-center gap-1.5">
                <GraduationCap size={16} /> {student.school}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="flex items-center gap-1.5">
                <Clock size={16} /> {student.lastLogin} 접속
              </span>
            </div>
            <div className="flex gap-2">
              {student.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            과제 부여
          </button>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="col-span-8 space-y-6">
          <div className="flex items-center gap-2 p-1 bg-white rounded-xl border border-gray-100 w-fit">
            <button
              onClick={() => setActiveTab("planner")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "planner" ? "bg-gray-900 text-white shadow-md" : "text-gray-400 hover:text-gray-900"}`}
            >
              학습 플래너
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "report" ? "bg-gray-900 text-white shadow-md" : "text-gray-400 hover:text-gray-900"}`}
            >
              주간 리포트
            </button>
          </div>

          {activeTab === "planner" && (
            <div className="space-y-4">
              {/* Date Header & Controls */}
              <div className="flex flex-col gap-3 mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      학습 현황
                    </h3>
                    <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                      <button
                        onClick={() => setViewMode("list")}
                        className={`px-2 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                          viewMode === "list"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <MoreHorizontal size={14} /> 목록
                      </button>
                      <button
                        onClick={() => setViewMode("card")}
                        className={`px-2 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                          viewMode === "card"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <Calendar size={14} /> 플래너
                      </button>
                    </div>
                  </div>

                  {/* Date Navigation */}
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() - 1);
                        setSelectedDate(d);
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-bold text-gray-700 tabular-nums px-2">
                      {selectedDate.getFullYear()}.{" "}
                      {selectedDate.getMonth() + 1}. {selectedDate.getDate()}. (
                      {weekDays[selectedDate.getDay()]})
                    </span>
                    <button
                      onClick={() => {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() + 1);
                        setSelectedDate(d);
                      }}
                      className="p-1 hover:bg-gray-100 rounded text-gray-500"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500 mr-2">
                    <Filter size={12} /> 필터:
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 hover:border-gray-300 focus:outline-none"
                  >
                    <option value="all">전체 과목</option>
                    <option value="math">수학</option>
                    <option value="english">영어</option>
                    <option value="korean">국어</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 hover:border-gray-300 focus:outline-none"
                  >
                    <option value="all">전체 상태</option>
                    <option value="completed">완료됨</option>
                    <option value="pending">미완료</option>
                  </select>
                </div>
              </div>

              {/* View Mode: Card (Weekly Planner Row) */}
              {viewMode === "card" && (
                <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  <div className="flex gap-4 min-w-max">
                    {weekDates.map((date, i) => {
                      const isSelected =
                        date.toDateString() === selectedDate.toDateString();
                      // Get data for this specific day in the loop
                      const dayTasks = allTasks.filter((t) => {
                        if (!t.deadline) return false;
                        const d = new Date(t.deadline);
                        return (
                          d.getFullYear() === date.getFullYear() &&
                          d.getMonth() === date.getMonth() &&
                          d.getDate() === date.getDate()
                        );
                      });
                      const dayMentorDeadlines = dayTasks.filter(
                        (t) => t.isMentorTask,
                      );
                      const dayUserTasksRaw = dayTasks.filter(
                        (t) => !t.isMentorTask,
                      );
                      const dayTimeBlocks = generateTimeBlocksFromTasks([
                        ...dayMentorDeadlines,
                        ...dayUserTasksRaw,
                      ]);

                      const dayRecord = DAILY_RECORDS.find(
                        (r) =>
                          r.date.getFullYear() === date.getFullYear() &&
                          r.date.getMonth() === date.getMonth() &&
                          r.date.getDate() === date.getDate(),
                      ) || { studyTime: 0, memo: "" };

                      const daySchedule = WEEKLY_SCHEDULE.find(
                        (s) =>
                          s.date.getFullYear() === date.getFullYear() &&
                          s.date.getMonth() === date.getMonth() &&
                          s.date.getDate() === date.getDate(),
                      );
                      const dayEvents = daySchedule ? daySchedule.events : [];

                      return (
                        <div
                          key={i}
                          className={`w-[300px] transition-all duration-300 transform ${isSelected ? "scale-100 opacity-100 ring-2 ring-blue-500 ring-offset-2 rounded-[22px]" : "scale-95 opacity-60 hover:opacity-100 cursor-pointer"}`}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className="text-center mb-2">
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-full ${isSelected ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
                            >
                              {date.getMonth() + 1}/{date.getDate()} (
                              {weekDays[date.getDay()]})
                            </span>
                          </div>
                          <DailyPlannerCard
                            date={date}
                            isToday={
                              date.toDateString() === new Date().toDateString()
                            } // Check if this specific card's date is today
                            studyTime={dayRecord.studyTime}
                            memo={dayRecord.memo}
                            mentorDeadlines={dayMentorDeadlines}
                            userTasks={dayUserTasksRaw}
                            dailyEvents={dayEvents}
                            studyTimeBlocks={dayTimeBlocks}
                            onClick={() => {
                              setSelectedDate(date);
                              setIsPlannerDetailOpen(true);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* View Mode: List (Selected Day) */}
              {viewMode === "list" && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {filteredListTasks.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm font-medium">
                        해당 날짜에 등록된 과제가 없습니다.
                      </p>
                    </div>
                  ) : (
                    filteredListTasks.map((task: any, idx) => {
                      const isMentorTask = task.isMentorTask;
                      const handleTaskClick = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        openModal({
                          title: task.title,
                          type: "info",
                          size: "2xl",
                          content: (
                            <div className="space-y-4 text-left">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`px-2 py-0.5 rounded textxs font-bold ${task.badgeColor || "bg-gray-100 text-gray-500"}`}
                                >
                                  {task.categoryId || (task as any).subject}
                                </span>
                                {isMentorTask ? (
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold rounded">
                                    MENTOR TASK
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold rounded">
                                    SELF PLAN
                                  </span>
                                )}
                              </div>
                              {task.description && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                                  <h4 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                                    <FileText size={12} /> 과제 설명
                                  </h4>
                                  <p className="text-sm text-gray-800 leading-relaxed">
                                    {task.description}
                                  </p>

                                  {/* Attachments */}
                                  {task.attachments &&
                                    task.attachments.length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {task.attachments.map(
                                          (file: any, i: number) => (
                                            <button
                                              key={i}
                                              onClick={() =>
                                                setPreviewMedia({
                                                  url: file.url,
                                                  type: "pdf",
                                                  name: file.name,
                                                })
                                              }
                                              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                            >
                                              <Download
                                                size={12}
                                                className="text-gray-400"
                                              />{" "}
                                              {file.name}
                                            </button>
                                          ),
                                        )}
                                      </div>
                                    )}
                                </div>
                              )}

                              {/* Submissions & Records */}
                              <div className="space-y-3">
                                {(task.submissions?.length > 0 ||
                                  task.studyRecord) && (
                                  <h4 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                                    <ImageIcon size={12} /> 학생 제출물
                                  </h4>
                                )}
                                {task.userQuestion && (
                                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                    <h4 className="text-xs font-bold text-orange-600 mb-1">
                                      🙋 질문이 있어요
                                    </h4>
                                    <p className="text-sm text-gray-800">
                                      {task.userQuestion}
                                    </p>
                                  </div>
                                )}
                                {task.studyRecord?.note && (
                                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                    <h4 className="text-xs font-bold text-blue-600 mb-1">
                                      📒 학습 노트
                                    </h4>
                                    <p className="text-sm text-gray-800">
                                      {task.studyRecord.note}
                                    </p>
                                  </div>
                                )}

                                {/* Gallery */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {task.submissions?.map(
                                    (sub: any, i: number) => (
                                      <div
                                        key={`sub-${i}`}
                                        className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group/img cursor-pointer"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPreviewMedia({
                                            url: sub.previewUrl || sub.url,
                                            type: "image",
                                            name: sub.name,
                                          });
                                        }}
                                      >
                                        <img
                                          src={sub.previewUrl || sub.url}
                                          alt={sub.name}
                                          className="w-full h-full object-cover transition-transform group-hover/img:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                          <ExternalLink
                                            size={20}
                                            className="text-white drop-shadow-md"
                                          />
                                        </div>
                                        <div className="absolute bottom-2 left-2 right-2">
                                          <span className="text-[10px] text-white bg-black/60 px-2 py-1 rounded-full backdrop-blur-md truncate block text-center">
                                            {sub.name}
                                          </span>
                                        </div>
                                      </div>
                                    ),
                                  )}
                                  {task.studyRecord?.photos &&
                                    task.studyRecord.photos.map(
                                      (photo: string, i: number) => (
                                        <div
                                          key={`record-${i}`}
                                          className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group/img cursor-pointer"
                                          onClick={() =>
                                            setPreviewMedia({
                                              url: photo,
                                              type: "image",
                                              name: "학습 인증샷",
                                            })
                                          }
                                        >
                                          <img
                                            src={photo}
                                            alt="Study record"
                                            className="w-full h-full object-cover transition-transform group-hover/img:scale-105"
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                            <ExternalLink
                                              size={20}
                                              className="text-white drop-shadow-md"
                                            />
                                          </div>
                                        </div>
                                      ),
                                    )}
                                </div>
                              </div>

                              {/* Feedback */}
                              {(task.mentorFeedback || task.mentorComment) && (
                                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                  <h4 className="text-xs font-bold text-indigo-600 mb-1">
                                    💬 멘토 피드백
                                  </h4>
                                  <p className="text-sm text-gray-800">
                                    {task.mentorFeedback || task.mentorComment}
                                  </p>
                                </div>
                              )}
                            </div>
                          ),
                          confirmText:
                            !task.mentorFeedback &&
                            !task.mentorComment &&
                            task.status === "submitted"
                              ? "피드백 작성하기"
                              : "확인",
                          onConfirm: () => {
                            if (
                              !task.mentorFeedback &&
                              !task.mentorComment &&
                              task.status === "submitted"
                            ) {
                              setTimeout(() => {
                                openModal({
                                  title: "피드백 작성",
                                  content:
                                    "학생에게 전달할 피드백을 입력해주세요.",
                                  type: "input",
                                  inputPlaceholder:
                                    "예: 개념 정리가 아주 잘 되어있네! 고생했어.",
                                  confirmText: "전송",
                                  onConfirm: (feedback) => {
                                    openModal({
                                      title: "전송 완료",
                                      content: `✅ ${student.name} 학생에게 피드백을 보냈습니다.`,
                                      type: "success",
                                    });
                                  },
                                });
                              }, 200);
                            }
                          },
                        });
                      };

                      return (
                        <div
                          key={idx}
                          onClick={handleTaskClick}
                          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50/50 transition-all cursor-pointer group flex items-stretch gap-4"
                        >
                          {/* Status Indicator Bar */}
                          <div
                            className={`w-1 rounded-full ${task.completed ? "bg-blue-500" : "bg-gray-200"}`}
                          />

                          {/* Main Content */}
                          <div className="flex-1 py-1 flex flex-col justify-center min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              {isMentorTask && (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black rounded uppercase tracking-tighter shrink-0">
                                  MENTOR
                                </span>
                              )}
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black ${task.badgeColor || "bg-gray-100 text-gray-500"} shrink-0`}
                              >
                                {task.categoryId || (task as any).subject}
                              </span>
                              <span className="text-xs text-gray-400 font-medium">
                                |
                              </span>
                              <span className="text-xs font-bold text-gray-400 tabular-nums">
                                {task.startTime} - {task.endTime}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <h4
                                className={`text-base font-bold text-gray-900 truncate ${task.completed ? "line-through text-gray-400" : ""}`}
                              >
                                {task.title}
                              </h4>
                            </div>

                            {/* Status Text / Feedback Preview */}
                            <div className="mt-1 flex items-center gap-2 text-xs">
                              {task.completed ? (
                                <span className="text-green-600 font-bold flex items-center gap-1">
                                  <CheckCircle2 size={10} /> 완료됨
                                </span>
                              ) : (
                                <span className="text-gray-400 font-medium">
                                  미완료
                                </span>
                              )}

                              {(task.mentorFeedback || task.mentorComment) && (
                                <>
                                  <span className="text-gray-300">|</span>
                                  <span className="text-indigo-600 font-bold flex items-center gap-1">
                                    💬 피드백 완료
                                  </span>
                                </>
                              )}

                              {task.status === "submitted" &&
                                !task.mentorFeedback && (
                                  <>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-orange-500 font-bold animate-pulse">
                                      ● 피드백 필요
                                    </span>
                                  </>
                                )}
                            </div>
                          </div>

                          {/* Right Action Button */}
                          <div className="flex flex-col justify-center items-end pl-2 border-l border-gray-50">
                            {task.status === "submitted" &&
                            !task.mentorFeedback ? (
                              <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                                피드백
                              </button>
                            ) : (
                              <div className="px-3 py-1.5 text-gray-300">
                                <ChevronRight size={18} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}

          {/* Planner Detail Modal (Portal) */}
          {mounted &&
            createPortal(
              <PlannerDetailModal
                isOpen={isPlannerDetailOpen}
                onClose={() => setIsPlannerDetailOpen(false)}
                date={selectedDate}
                dailyRecord={dailyRecord}
                mentorDeadlines={mentorDeadlines}
                dailyEvents={dailyEvents}
                userTasks={userTasksRaw}
                mentorReview={dailyReview} // Pass state
                onEditReview={() => {
                  // close planner modal? No, input modal should stack or planner modal stay open underneath.
                  // ModalContext might handle stacking, or replace.
                  // If it replaces, we lose context. Assuming usage allows stacking or we handle it.
                  // Let's try simple input modal.
                  openModal({
                    title: "일일 리포트 작성",
                    content: "학생의 오늘 학습에 대한 총평을 남겨주세요.",
                    type: "input",
                    inputType: "textarea", // Use textarea
                    inputPlaceholder:
                      "예: 계획 이행률이 아주 좋아! 수학 문제 풀이 시간만 조금 늘려보자.",
                    defaultValue: dailyReview,
                    confirmText: "작성 완료",
                    onConfirm: (val) => {
                      setDailyReview(val);
                      openModal({
                        title: "작성 완료",
                        content: "✅ 리포트가 저장되었습니다.",
                        type: "success",
                      });
                    },
                  });
                }}
                onTaskClick={(task) => {
                  const isMentorTask = task.isMentorTask;
                  openModal({
                    title: task.title,
                    type: "info",
                    size: "2xl",
                    content: (
                      <div className="space-y-4 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-0.5 rounded textxs font-bold ${task.badgeColor || "bg-gray-100 text-gray-500"}`}
                          >
                            {task.categoryId || (task as any).subject}
                          </span>
                          {isMentorTask ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold rounded">
                              MENTOR TASK
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold rounded">
                              SELF PLAN
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                            <h4 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                              <FileText size={12} /> 과제 설명
                            </h4>
                            <p className="text-sm text-gray-800 leading-relaxed">
                              {task.description}
                            </p>

                            {/* Attachments */}
                            {task.attachments &&
                              task.attachments.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {task.attachments.map(
                                    (file: any, i: number) => (
                                      <button
                                        key={i}
                                        onClick={() =>
                                          setPreviewMedia({
                                            url: file.url,
                                            type: "pdf",
                                            name: file.name,
                                          })
                                        }
                                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                      >
                                        <Download
                                          size={12}
                                          className="text-gray-400"
                                        />{" "}
                                        {file.name}
                                      </button>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>
                        )}

                        {/* Submissions & Records */}
                        <div className="space-y-3">
                          {(task.submissions?.length > 0 ||
                            task.studyRecord) && (
                            <h4 className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                              <ImageIcon size={12} /> 학생 제출물
                            </h4>
                          )}
                          {task.userQuestion && (
                            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                              <h4 className="text-xs font-bold text-orange-600 mb-1">
                                🙋 질문이 있어요
                              </h4>
                              <p className="text-sm text-gray-800">
                                {task.userQuestion}
                              </p>
                            </div>
                          )}
                          {task.studyRecord?.note && (
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                              <h4 className="text-xs font-bold text-blue-600 mb-1">
                                📒 학습 노트
                              </h4>
                              <p className="text-sm text-gray-800">
                                {task.studyRecord.note}
                              </p>
                            </div>
                          )}

                          {/* Gallery */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {task.submissions?.map((sub: any, i: number) => (
                              <div
                                key={`sub-${i}`}
                                className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group/img cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewMedia({
                                    url: sub.previewUrl || sub.url,
                                    type: "image",
                                    name: sub.name,
                                  });
                                }}
                              >
                                <img
                                  src={sub.previewUrl || sub.url}
                                  alt={sub.name}
                                  className="w-full h-full object-cover transition-transform group-hover/img:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                  <ExternalLink
                                    size={20}
                                    className="text-white drop-shadow-md"
                                  />
                                </div>
                                <div className="absolute bottom-2 left-2 right-2">
                                  <span className="text-[10px] text-white bg-black/60 px-2 py-1 rounded-full backdrop-blur-md truncate block text-center">
                                    {sub.name}
                                  </span>
                                </div>
                              </div>
                            ))}
                            {task.studyRecord?.photos &&
                              task.studyRecord.photos.map(
                                (photo: string, i: number) => (
                                  <div
                                    key={`record-${i}`}
                                    className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group/img cursor-pointer"
                                    onClick={() =>
                                      setPreviewMedia({
                                        url: photo,
                                        type: "image",
                                        name: "학습 인증샷",
                                      })
                                    }
                                  >
                                    <img
                                      src={photo}
                                      alt="Study record"
                                      className="w-full h-full object-cover transition-transform group-hover/img:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                      <ExternalLink
                                        size={20}
                                        className="text-white drop-shadow-md"
                                      />
                                    </div>
                                  </div>
                                ),
                              )}
                          </div>
                        </div>

                        {/* Feedback */}
                        {(task.mentorFeedback || task.mentorComment) && (
                          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                            <h4 className="text-xs font-bold text-indigo-600 mb-1">
                              💬 멘토 피드백
                            </h4>
                            <p className="text-sm text-gray-800">
                              {task.mentorFeedback || task.mentorComment}
                            </p>
                          </div>
                        )}
                      </div>
                    ),
                    confirmText:
                      !task.mentorFeedback &&
                      !task.mentorComment &&
                      task.status === "submitted"
                        ? "피드백 작성하기"
                        : "확인",
                    onConfirm: () => {
                      if (
                        !task.mentorFeedback &&
                        !task.mentorComment &&
                        task.status === "submitted"
                      ) {
                        setTimeout(() => {
                          openModal({
                            title: "피드백 작성",
                            content: "학생에게 전달할 피드백을 입력해주세요.",
                            type: "input",
                            inputPlaceholder:
                              "예: 개념 정리가 아주 잘 되어있네! 고생했어.",
                            confirmText: "전송",
                            onConfirm: (feedback) => {
                              openModal({
                                title: "전송 완료",
                                content: `✅ ${student.name} 학생에게 피드백을 보냈습니다.`,
                                type: "success",
                              });
                            },
                          });
                        }, 200);
                      }
                    },
                  });
                }}
              />,
              document.body,
            )}

          {activeTab === "report" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
              <span className="block mb-2 text-4xl">📊</span>
              <p className="font-bold text-gray-900 mb-1">주간 성취도 리포트</p>
              <p className="text-xs">데이터 집계 중입니다.</p>
            </div>
          )}
        </div>

        {/* Sidebar Widget Area */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 mb-4">학습 통계</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-500">주간 달성률</span>
                  <span className="text-blue-600">84%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-[84%] rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-500">총 학습 시간</span>
                  <span className="text-gray-900">42시간 15분</span>
                </div>
              </div>
            </div>
          </div>

          <AssignTaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            studentName={student.name}
          />
          <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
            <h3 className="text-sm font-black text-indigo-900 mb-2">
              멘토 노트
            </h3>
            <textarea
              className="w-full bg-white border-0 rounded-xl p-3 text-xs font-medium text-gray-700 placeholder-indigo-300 focus:ring-2 focus:ring-indigo-200 min-h-[120px]"
              placeholder="학생에 대한 특이사항이나 상담 내용을 기록하세요."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
