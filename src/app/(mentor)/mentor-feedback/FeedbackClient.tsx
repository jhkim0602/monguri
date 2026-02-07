"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Send,
  Maximize2,
  MessageSquare,
  FileText,
  Calendar,
  HelpCircle,
} from "lucide-react";
import { USER_TASKS, WEEKLY_SCHEDULE, DAILY_RECORDS } from "@/constants/mentee";
import { STUDENTS_MOCK } from "@/constants/mentor"; // For avatars
import { useModal } from "@/contexts/ModalContext";
import DailyPlannerCard from "@/components/mentee/calendar/DailyPlannerCard";
import { generateTimeBlocksFromTasks } from "@/utils/timeUtils";
import PlannerDetailModal from "@/components/mentee/calendar/PlannerDetailModal";
import { FeedbackItem } from "@/services/mentorFeedbackService";
import { MENTOR_TASKS } from "@/constants/mentee"; // Keep for getPlanData helpers for now

// --- Helpers ---
const getStudentAvatar = (name: string, url?: string) => {
  if (url) return url;
  const student = STUDENTS_MOCK.find((s) => s.name === name);
  return (
    student?.avatar ||
    `https://ui-avatars.com/api/?name=${name}&background=random`
  );
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  });
};

const formatTimeAgo = (date: Date) => {
  const diff = new Date().getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "방금 전";
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

export default function FeedbackClient({
  mentorId,
  initialItems,
  initialSelectedTaskId,
}: {
  mentorId: string;
  initialItems: FeedbackItem[];
  initialSelectedTaskId?: string;
}) {
  const { openModal } = useModal();
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(
    initialSelectedTaskId ? `task-${initialSelectedTaskId}` : null,
  );
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending",
  );
  const [filterType, setFilterType] = useState<
    "all" | "task" | "plan" | "question"
  >("all");
  const [feedbackText, setFeedbackText] = useState("");
  const [expandedPlanDate, setExpandedPlanDate] = useState<Date | null>(null);
  const [publishedFeedback, setPublishedFeedback] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Data Aggregation ---
  // 1. Tasks (From Props)
  const taskItems = initialItems.filter((i) => i.type === "task");

  // 2. Plan Reviews
  const planItems = initialItems.filter((i) => i.type === "plan");

  // 3. Questions (Mock removed)
  const questionItems: FeedbackItem[] = [];

  const allItems = [...taskItems, ...planItems, ...questionItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Apply Filters
  const filteredItems = allItems.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false;
    return true;
  });

  const selectedItem = allItems.find((i) => i.id === selectedItemId);

  // --- Handlers ---
  const handleSendFeedback = async () => {
    if (!selectedItem) return;

    if (selectedItem.type === "task") {
      if (!feedbackText.trim()) {
        alert("피드백 내용을 입력해주세요.");
        return;
      }

      setIsSubmitting(true);
      // Extract raw ID from "task-UUID" string
      const taskId = String(selectedItem.id).replace("task-", "");

      try {
        const response = await fetch("/api/mentor/feedback/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mentorId,
            taskId,
            comment: feedbackText,
            rating: 5, // Default rating
            type: "mentor_task",
          }),
        });

        const result = await response.json();

        if (result.success) {
          openModal({
            title: "전송 완료",
            content: "✅ 과제 피드백이 전송되었습니다.",
            type: "success",
          });
          setSelectedItemId(null);
          setFeedbackText("");
          // Ideally refresh list here
        } else {
          openModal({
            title: "전송 실패",
            content: result.error || "알 수 없는 오류가 발생했습니다.",
            type: "confirm",
          });
        }
      } catch (error) {
        console.error("Feedback Submit Error:", error);
        alert("피드백 전송 중 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // For other types (mock implementation)
    openModal({
      title: "리포트 전송",
      content: "작성하신 총평을 전송하고 플래너에 반영하시겠습니까?",
      type: "confirm",
      onConfirm: () => {
        setPublishedFeedback(feedbackText); // Apply feedback to card
        openModal({
          title: "전송 완료",
          content: "✅ 리포트가 전송되었습니다.",
          type: "success",
        });
      },
    });
  };

  const handleApprovePlan = () => {
    openModal({
      title: "계획 승인",
      content:
        "학생의 계획을 별도 코멘트 없이 승인하시겠습니까? '확인했습니다' 알림이 전송됩니다.",
      type: "confirm",
      confirmText: "승인",
      onConfirm: () => {
        openModal({
          title: "승인 완료",
          content: "👌 계획이 승인되었습니다.",
          type: "success",
        });
        setSelectedItemId(null);
      },
    });
  };

  // --- Helper for Plan Data ---
  const getPlanData = (date: Date) => {
    const targetDate = new Date(date);
    // Filter tasks for this date (reusing logic from student page)
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const mentorDeadlines = MENTOR_TASKS.filter(
      (t) => t.deadline && isSameDay(t.deadline, targetDate),
    );
    const userTasksRaw = USER_TASKS.filter(
      (t) => t.deadline && isSameDay(t.deadline, targetDate),
    ).map((t) => ({
      ...t,
      status:
        t.status === "pending" || t.status === "submitted"
          ? t.status
          : undefined,
    })) as unknown as import("@/lib/menteeAdapters").PlannerTaskLike[];
    const studyTimeBlocks = generateTimeBlocksFromTasks([
      ...mentorDeadlines,
      ...userTasksRaw,
    ]);

    const dailyRecord = DAILY_RECORDS.find((r) =>
      isSameDay(r.date, targetDate),
    ) || { studyTime: 0, memo: "" };
    const dailySchedule =
      WEEKLY_SCHEDULE.find((s) => isSameDay(s.date, targetDate))?.events || [];

    return {
      mentorDeadlines,
      userTasks: userTasksRaw,
      studyTimeBlocks,
      dailyRecord,
      dailyEvents: dailySchedule,
    };
  };

  const handleExpandPlan = (date: Date) => {
    setExpandedPlanDate(date);
  };

  // Prepare data for the modal if open
  const expandedPlanData = expandedPlanDate
    ? getPlanData(expandedPlanDate)
    : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* LEFT PANEL: Inbox List */}
      <div
        className={`${selectedItemId ? "hidden lg:flex" : "flex"} w-full lg:w-[420px] flex-col border-r border-gray-100 bg-gray-50/30`}
      >
        <div className="p-5 border-b border-gray-100 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              📥 피드백 인박스{" "}
              <span className="text-blue-600 text-lg">
                {filteredItems.length}
              </span>
            </h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <Filter size={18} />
            </button>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: "all", label: "전체", icon: null },
              { id: "question", label: "질문", icon: <HelpCircle size={14} /> },
              { id: "task", label: "과제", icon: <FileText size={14} /> },
              { id: "plan", label: "플래너", icon: <Calendar size={14} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filterType === tab.id ? "bg-gray-900 text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="보낸 사람 또는 제목 검색"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <CheckCircle2 size={40} className="mb-3 text-gray-200" />
              <p className="text-sm font-medium">
                대기 중인 피드백이 없습니다.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-white ${selectedItemId === item.id ? "bg-white border-l-4 border-l-blue-600 shadow-sm z-10" : "bg-transparent border-l-4 border-l-transparent"}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {item.type === "question" && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <HelpCircle size={10} /> 질문
                      </span>
                    )}
                    {item.type === "task" && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <FileText size={10} /> 과제
                      </span>
                    )}
                    {item.type === "plan" && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <Calendar size={10} /> 플래너
                      </span>
                    )}
                    {item.isUrgent && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-md animate-pulse">
                        급함
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {formatTimeAgo(item.date)}
                  </span>
                </div>

                <h3
                  className={`text-sm font-bold mb-1 truncate ${selectedItemId === item.id ? "text-gray-900" : "text-gray-700"}`}
                >
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs text-gray-500 truncate mb-3">
                    {item.subtitle}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <img
                    src={getStudentAvatar(item.studentName, item.avatarUrl)}
                    alt={item.studentName}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-xs font-medium text-gray-600">
                    {item.studentName}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Detail View */}
      <div
        className={`flex-1 flex flex-col bg-white ${!selectedItemId ? "hidden lg:flex" : "flex"}`}
      >
        {selectedItem ? (
          <>
            {/* Header */}
            <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedItemId(null)}
                  className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <span
                    className={`p-2 rounded-lg
                                ${
                                  selectedItem.type === "question"
                                    ? "bg-orange-100 text-orange-600"
                                    : selectedItem.type === "plan"
                                      ? "bg-purple-100 text-purple-600"
                                      : "bg-blue-100 text-blue-600"
                                }`}
                  >
                    {selectedItem.type === "question" ? (
                      <HelpCircle size={20} />
                    ) : selectedItem.type === "plan" ? (
                      <Calendar size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">
                      {selectedItem.title}
                    </h2>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {selectedItem.studentName} •{" "}
                      {formatDate(selectedItem.date)}
                    </p>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {selectedItem.type === "plan" && (
                  <button
                    onClick={handleApprovePlan}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    빠른 승인
                  </button>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* 1. PLAN REVIEW DETAIL */}
                {selectedItem.type === "plan" && (
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Daily Planner Card Preview */}
                    <div className="w-full md:w-[320px] shrink-0">
                      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-0">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Calendar size={16} className="text-purple-600" />{" "}
                            플래너 미리보기
                          </h3>
                          <button
                            onClick={() => handleExpandPlan(selectedItem.date)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="크게 보기"
                          >
                            <Maximize2 size={16} />
                          </button>
                        </div>

                        {/* Use IIFE-like logic to get props */}
                        {(() => {
                          const props = getPlanData(selectedItem.date);
                          return (
                            <div className="transform scale-100 origin-top-left relative group">
                              <DailyPlannerCard
                                date={selectedItem.date}
                                isToday={false} // Reviewing past/current plan
                                studyTime={props.dailyRecord.studyTime || 0}
                                memo={props.dailyRecord.memo || ""}
                                mentorDeadlines={props.mentorDeadlines}
                                userTasks={props.userTasks}
                                dailyEvents={props.dailyEvents}
                                mentorReview={publishedFeedback ?? undefined} // Only show if published
                                studyTimeBlocks={props.studyTimeBlocks}
                                onClick={() =>
                                  handleExpandPlan(selectedItem.date)
                                } // Click to expand too
                              />
                              {/* Hover overlay hint */}
                              <div
                                onClick={() =>
                                  handleExpandPlan(selectedItem.date)
                                }
                                className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-sm"
                              >
                                <span className="bg-white/90 text-gray-800 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                  크게 보기
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Feedback Input Side */}
                    <div className="flex-1 space-y-6">
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              📅 일일 학습 계획 점검
                            </h3>
                            <p className="text-sm text-gray-500">
                              {selectedItem.studentName} 학생의{" "}
                              {formatDate(selectedItem.date)} 계획입니다.
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                          <h4 className="text-xs font-bold text-gray-500 mb-2">
                            🚩 오늘의 목표
                          </h4>
                          <p className="text-gray-900 font-medium">
                            "{selectedItem.data.dailyGoal}"
                          </p>
                        </div>
                      </div>

                      {/* Feedback Input */}
                      <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm ring-4 ring-blue-50/50">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <MessageSquare size={16} className="text-blue-500" />
                          📝 일일 플래너 총평 (Daily Review)
                        </h3>
                        <p className="text-xs text-blue-500 mb-3">
                          작성하신 내용은 학생의 플래너 하단에 '멘토의 총평'으로
                          강조되어 표시됩니다. 왼쪽 미리보기 카드에서
                          확인해보세요.
                        </p>
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="오늘의 학습량, 집중도, 계획 달성률 등을 종합적으로 평가해주세요."
                          className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none mb-4 font-medium"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={handleSendFeedback}
                            className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                          >
                            <Send size={14} /> 총평 리포트 전송
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TASK DETAIL */}
                {selectedItem.type === "task" && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <span
                          className={`px-2 py-0.5 rounded textxs font-bold ${selectedItem.data.badgeColor}`}
                        >
                          {selectedItem.data.subject}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">
                          {selectedItem.data.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-6 border-b border-gray-50 pb-4">
                        {selectedItem.data.description}
                      </p>

                      <h4 className="text-xs font-bold text-gray-500 mb-3 block">
                        제출된 파일
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedItem.data.submissions?.map(
                          (sub: any, i: number) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                <FileText size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                  {sub.name}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  PDF Document
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm ring-4 ring-blue-50/50">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare size={16} className="text-blue-500" />
                        과제 피드백
                      </h3>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="과제에 대한 피드백을 자세히 남겨주세요."
                        className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none mb-4"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleSendFeedback}
                          disabled={isSubmitting}
                          className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
                        >
                          <Send size={14} />{" "}
                          {isSubmitting ? "전송 중..." : "피드백 전송"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. QUESTION DETAIL */}
                {selectedItem.type === "question" && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600 mb-3">
                          관련 과제: {selectedItem.data.taskTitle}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Q. {selectedItem.data.question}
                        </h3>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm ring-4 ring-blue-50/50">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare size={16} className="text-blue-500" />
                        답변 작성
                      </h3>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="학생의 질문에 대한 답변을 입력해주세요."
                        className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none mb-4"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleSendFeedback}
                          className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                        >
                          <Send size={14} /> 답변 전송
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
              <MessageSquare size={40} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              피드백 항목을 선택해주세요
            </h3>
            <p className="text-sm max-w-xs text-center text-gray-500">
              왼쪽 인박스에서 처리할 항목을 선택하면
              <br />
              상세 내용 확인 및 피드백 작성이 가능합니다.
            </p>
          </div>
        )}
      </div>

      {expandedPlanData && expandedPlanDate && (
        <PlannerDetailModal
          isOpen={!!expandedPlanDate}
          onClose={() => setExpandedPlanDate(null)}
          date={expandedPlanDate}
          dailyRecord={expandedPlanData.dailyRecord}
          mentorDeadlines={expandedPlanData.mentorDeadlines}
          plannerTasks={expandedPlanData.userTasks}
          dailyEvents={expandedPlanData.dailyEvents}
          mentorReview={publishedFeedback ?? undefined}
        />
      )}
    </div>
  );
}
