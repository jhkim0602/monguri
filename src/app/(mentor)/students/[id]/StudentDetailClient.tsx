"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MoreHorizontal,
  GraduationCap,
  Plus,
  MessageCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
} from "lucide-react";
import { MentorMentee } from "@/features/mentor/types";
import { useModal } from "@/contexts/ModalContext";
import { createPortal } from "react-dom";
import PlannerDetailModal from "@/components/mentee/calendar/PlannerDetailModal";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";
import PlannerDetailView from "@/components/mentee/calendar/PlannerDetailView";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { generateTimeBlocksFromTasks } from "@/utils/timeUtils";
import AssignTaskModal from "@/components/mentor/tasks/AssignTaskModal";

type StudentDetailClientProps = {
  mentorId: string;
  student: MentorMentee;
  initialTasks: any[]; // Replace with proper type later
  initialDailyRecord: any;
  initialDailyEvents: any[];
};

export default function StudentDetailClient({
  mentorId,
  student,
  initialTasks = [],
  initialDailyRecord,
  initialDailyEvents = [],
}: StudentDetailClientProps) {
  const { openModal } = useModal();
  const [mounted, setMounted] = useState(false);
  const [isPlannerDetailOpen, setIsPlannerDetailOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<"planner" | "report">("planner");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dailyReview, setDailyReview] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFeedbackSubmit = async (comment: string, rating: number) => {
    if (!selectedTask) return;

    try {
      const response = await fetch("/api/mentor/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          selectedTask.isMentorTask
            ? {
                mentorId,
                taskId: String(selectedTask.id),
                comment,
                rating,
                type: "mentor_task",
              }
            : {
                mentorId,
                taskId: String(selectedTask.id),
                comment,
                type: "planner_task",
              },
        ),
      });
      const result = await response.json();

      if (result.success) {
        alert("피드백이 등록되었습니다.");
        setIsModalOpen(false);
        window.location.reload();
      } else {
        alert(result.error || "오류가 발생했습니다.");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  };

  const getWeekDates = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

  // Filter Tasks for Selected Date
  const currentDateTasks = initialTasks.filter((task) => {
    const d = new Date(task.deadline || task.date); // Handle different task types
    return (
      d.getFullYear() === selectedDate.getFullYear() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getDate() === selectedDate.getDate()
    );
  });

  // Apply UI Filters for List View
  const filteredListTasks = currentDateTasks.filter((task) => {
    if (
      filterCategory !== "all" &&
      (task.categoryId || task.subject) !== filterCategory
    )
      return false;

    if (filterStatus !== "all") {
      if (filterStatus === "completed" && !task.completed) return false;
      if (filterStatus === "pending" && task.completed) return false;
    }
    return true;
  });

  const filterCategoryOptions = useMemo(() => {
    const optionMap = new Map<string, string>();

    currentDateTasks.forEach((task) => {
      const value = String(task.categoryId || task.subject || "").trim();
      if (!value || optionMap.has(value)) return;

      const matched = DEFAULT_CATEGORIES.find((c) => c.id === value);
      optionMap.set(value, matched?.name || task.subject || value);
    });

    return Array.from(optionMap.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [currentDateTasks]);

  const listSections = DEFAULT_CATEGORIES.map((category) => ({
    category,
    tasks: filteredListTasks.filter((t) => t.categoryId === category.id),
  })).filter((section) => section.tasks.length > 0);

  const hasActiveFilters = filterCategory !== "all" || filterStatus !== "all";

  // Prepare Data for Planner Card
  const mentorDeadlines = currentDateTasks.filter((t) => t.isMentorTask);
  const userTasksRaw = currentDateTasks.filter((t) => !t.isMentorTask);

  // Statistics Calculation
  const totalStudySeconds = currentDateTasks.reduce(
    (acc, task) => acc + (task.timeSpent || 0),
    0,
  );
  const totalTasksCount = currentDateTasks.length;
  const completedTasksCount = currentDateTasks.filter(
    (t) => t.completed,
  ).length;
  const achievementRate =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  const formatSeconds = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const weekDays = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <div className="space-y-6">
      <Link
        href="/students"
        className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        학생 목록으로 돌아가기
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex items-start justify-between">
        <div className="flex gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gray-100 shrink-0 overflow-hidden border-2 border-white shadow-lg shadow-gray-100">
            <img
              src={
                student.avatarUrl ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${student.name}`
              }
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
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-4">
              <span className="flex items-center gap-1.5">
                <GraduationCap size={16} /> {student.track}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="flex items-center gap-1.5">
                <Clock size={16} /> 목표: {student.goal}
              </span>
              {typeof student.dDay === "number" && (
                <>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <span className="text-blue-600 font-bold">
                    {(student.dDayLabel ?? "D-day") + " "}
                    {student.dDay > 0
                      ? `D-${student.dDay}`
                      : student.dDay === 0
                        ? "D-Day"
                        : `D+${Math.abs(student.dDay)}`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsAssignmentModalOpen(true)}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            과제 부여
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-6">
          {/* Tabs */}
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
              {/* Date & View Controls */}
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
                        <CalendarIcon size={14} /> 플래너
                      </button>
                    </div>
                  </div>

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
              </div>

              {/* View Mode: Card (Planner View) */}
              {viewMode === "card" && (
                <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                  <div className="flex gap-4 min-w-max">
                    {weekDates.map((date, i) => {
                      const isSelected =
                        date.toDateString() === selectedDate.toDateString();

                      // Helper for local date comparison
                      const toLocalDateString = (
                        d: Date | string | undefined | null,
                      ) => {
                        if (!d) return "";
                        const dateObj = new Date(d);
                        const y = dateObj.getFullYear();
                        const m = String(dateObj.getMonth() + 1).padStart(
                          2,
                          "0",
                        );
                        const day = String(dateObj.getDate()).padStart(2, "0");
                        return `${y}-${m}-${day}`;
                      };

                      const dateStr = toLocalDateString(date);

                      const dayMentorDeadlines = initialTasks.filter(
                        (t) =>
                          t.isMentorTask &&
                          toLocalDateString(t.deadline || t.date) === dateStr,
                      );

                      const dayUserTasksRaw = initialTasks.filter(
                        (t) =>
                          !t.isMentorTask &&
                          toLocalDateString(t.date) === dateStr,
                      );

                      const dayEvents = initialDailyEvents.filter(
                        (e: any) => toLocalDateString(e.date) === dateStr,
                      );

                      const dayRecord =
                        date.toDateString() === new Date().toDateString()
                          ? initialDailyRecord || { studyTime: 0, memo: "" }
                          : { studyTime: 0, memo: "" };

                      return (
                        <div
                          key={i}
                          className={`w-[360px] h-[560px] bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col shadow-sm ${
                            isSelected
                              ? "ring-2 ring-gray-900 ring-offset-2 opacity-100"
                              : "opacity-60 hover:opacity-100"
                          }`}
                          onClick={() => {
                            setSelectedDate(date);
                            setIsPlannerDetailOpen(true);
                          }}
                        >
                          <PlannerDetailView
                            date={date}
                            dailyRecord={{
                              studyTime:
                                dayRecord?.total_study_time ||
                                dayRecord.studyTime ||
                                0,
                              memo: dayRecord?.memo || "",
                            }}
                            mentorDeadlines={dayMentorDeadlines}
                            userTasks={dayUserTasksRaw}
                            dailyEvents={dayEvents}
                            size="full"
                            onTaskClick={(task) => {
                              setSelectedTask(task);
                              setIsModalOpen(true);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* View Mode: List */}
              {viewMode === "list" && (
                <div className="space-y-8">
                  <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 px-2">
                        필터
                      </span>

                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="all">전체 과목</option>
                        {filterCategoryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
                        <button
                          onClick={() => setFilterStatus("all")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                            filterStatus === "all"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          전체
                        </button>
                        <button
                          onClick={() => setFilterStatus("completed")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                            filterStatus === "completed"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          완료
                        </button>
                        <button
                          onClick={() => setFilterStatus("pending")}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                            filterStatus === "pending"
                              ? "bg-white text-gray-900 shadow-sm"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          미완료
                        </button>
                      </div>

                      {hasActiveFilters && (
                        <button
                          onClick={() => {
                            setFilterCategory("all");
                            setFilterStatus("all");
                          }}
                          className="ml-auto h-9 px-3 rounded-lg bg-gray-100 text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                          필터 초기화
                        </button>
                      )}
                    </div>
                  </div>

                  {listSections.length === 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-sm text-gray-500 font-medium shadow-sm">
                      조건에 맞는 학습 항목이 없습니다.
                    </div>
                  )}

                  {listSections.map(({ category, tasks: categoryTasks }) => {
                    return (
                      <div key={category.id} className="space-y-3">
                        {/* Category Header */}
                        <div className="flex items-center gap-2 px-1">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: category.textColorHex }}
                          />
                          <h3 className="text-sm font-bold text-gray-800">
                            {category.name}
                          </h3>
                          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {categoryTasks.length}
                          </span>
                        </div>

                        {/* Task Grid/List */}
                        <div className="grid grid-cols-1 gap-3">
                          {categoryTasks.map((task, idx) => {
                            const isMentorTask = task.isMentorTask;
                            const isCompleted = task.completed;
                            const d = new Date(task.deadline || task.date);
                            const timeStr = d.toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            });

                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsModalOpen(true);
                                }}
                                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group text-left w-full relative overflow-hidden"
                              >
                                {/* Left Color Bar */}
                                <div
                                  className="absolute left-0 top-0 bottom-0 w-1.5"
                                  style={{
                                    backgroundColor: category.colorHex,
                                  }}
                                />

                                <div className="flex-1 pl-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                        isMentorTask
                                          ? "bg-indigo-50 text-indigo-600"
                                          : "bg-gray-100 text-gray-500"
                                      }`}
                                    >
                                      {isMentorTask ? "멘토 과제" : "자습"}
                                    </span>
                                    {isCompleted && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-600 flex items-center gap-1">
                                        <CheckCircle2 size={10} /> 완료
                                      </span>
                                    )}
                                    {task.hasMentorResponse && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 flex items-center gap-1">
                                        <MessageCircle size={10} /> 피드백
                                      </span>
                                    )}
                                    <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1 ml-auto">
                                      <Clock size={10} />
                                      {task.startTime
                                        ? `${task.startTime} - ${task.endTime}`
                                        : timeStr}
                                    </span>
                                  </div>

                                  <h4
                                    className={`text-[15px] font-bold text-gray-900 mb-0.5 truncate ${
                                      isCompleted ? "text-gray-500" : ""
                                    }`}
                                  >
                                    {task.title}
                                  </h4>
                                  <p className="text-[12px] text-gray-500 truncate">
                                    {task.description || task.subject}
                                  </p>
                                </div>

                                <div className="text-gray-300 group-hover:text-gray-400">
                                  <ChevronRight size={16} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Task Detail Modal */}
              {/* @ts-ignore - Temporary ignore for strict type check if needed, but imported correctly it should work */}
              <TaskDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                isReadOnly={true}
                enableFeedbackInput={true}
                onFeedbackSubmit={handleFeedbackSubmit}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar (Stats) */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">학습 요약</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">총 학습 시간</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatSeconds(totalStudySeconds)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">계획 달성률</span>
                <span className="text-lg font-bold text-blue-600">
                  {achievementRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Subject Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">과목별 진행률</h3>
            <div className="space-y-4">
              {DEFAULT_CATEGORIES.map((category) => {
                const catTasks = currentDateTasks.filter(
                  (t) => t.categoryId === category.id,
                );
                if (catTasks.length === 0) return null;
                const completed = catTasks.filter((t) => t.completed).length;
                const progress = Math.round(
                  (completed / catTasks.length) * 100,
                );

                return (
                  <div key={category.id}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span style={{ color: category.textColorHex }}>
                        {category.name}
                      </span>
                      <span className="text-gray-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: category.colorHex,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {currentDateTasks.length === 0 && (
                <div className="text-center py-4">
                  <span className="text-xs text-gray-400">
                    등록된 과제가 없습니다.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Learning History */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">최근 학습 기록</h3>
            <div className="space-y-4">
              {initialTasks
                .filter((t) => t.completed)
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .slice(0, 5)
                .map((task, idx) => (
                  <div key={idx} className="flex items-start gap-3 group">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-500 transition-colors shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-700 group-hover:text-gray-900 transition-colors line-clamp-1">
                        {task.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {(() => {
                          const d = new Date(task.date);
                          return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
                        })()}{" "}
                        | {task.subject || "자습"}
                      </p>
                    </div>
                  </div>
                ))}
              {initialTasks.filter((t) => t.completed).length === 0 && (
                <div className="text-center py-4">
                  <span className="text-xs text-gray-400">
                    완료된 학습이 없습니다.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {mounted && (
        <>
          {createPortal(
            <PlannerDetailModal
              isOpen={isPlannerDetailOpen}
              onClose={() => setIsPlannerDetailOpen(false)}
              date={selectedDate}
              dailyRecord={initialDailyRecord}
              mentorDeadlines={mentorDeadlines}
              dailyEvents={initialDailyEvents}
              plannerTasks={userTasksRaw}
              mentorReview={dailyReview}
            />,
            document.body,
          )}

          {/* Detailed Task Modal (for clicking tasks) */}
          {/* @ts-ignore */}
          <TaskDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            task={selectedTask}
            isReadOnly={true}
            enableFeedbackInput={true}
            onFeedbackSubmit={handleFeedbackSubmit}
          />

          {/* Assignment Modal */}
          {createPortal(
            <AssignTaskModal
              isOpen={isAssignmentModalOpen}
              onClose={() => setIsAssignmentModalOpen(false)}
              mentorId={mentorId}
              menteeId={student.id}
              studentName={student.name}
            />,
            document.body,
          )}
        </>
      )}
    </div>
  );
}
