"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  ArrowLeft,
  Send,
  Maximize2,
  MessageSquare,
  FileText,
  Calendar,
  BookOpen,
  Download,
} from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import PlannerDetailModal from "@/components/mentee/calendar/PlannerDetailModal";
import PlannerDetailView from "@/components/mentee/calendar/PlannerDetailView";
import { FeedbackItem } from "@/services/mentorFeedbackService";
import { supabase } from "@/lib/supabaseClient";

// --- Helpers ---
const getStudentAvatar = (name: string, url?: string) => {
  if (url) return url;
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`;
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

const toDate = (value: Date | string | number) =>
  value instanceof Date ? value : new Date(value);

const toDateKey = (value: Date | string | number) => {
  const date = toDate(value);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const resolveCategoryId = (row: any) => {
  const direct = row?.subjects?.slug ?? row?.subject_slug ?? row?.subject_id ?? null;
  if (direct) return String(direct);
  return "unknown";
};

const hasUploadedSelfStudyFile = (materials: any): boolean => {
  if (!Array.isArray(materials) || materials.length === 0) return false;

  return materials.some((file: any) => {
    if (!file || typeof file !== "object") return false;

    const rawType = String(
      file.type ?? file.fileType ?? file.mime_type ?? file.mimeType ?? "",
    ).toLowerCase();
    if (
      rawType === "pdf" ||
      rawType === "image" ||
      rawType === "application/pdf" ||
      rawType.startsWith("image/")
    ) {
      return true;
    }

    const rawPath = String(
      file.url ?? file.previewUrl ?? file.path ?? file.name ?? file.title ?? "",
    ).toLowerCase();

    return /\.(pdf|png|jpe?g|gif|webp|bmp|heic|heif|svg)(\?|$)/.test(rawPath);
  });
};

export default function FeedbackClient({
  mentorId,
  initialItems,
  initialSelectedItemId,
}: {
  mentorId: string;
  initialItems: FeedbackItem[];
  initialSelectedItemId?: string;
}) {
  const { openModal } = useModal();
  const [items, setItems] = useState<FeedbackItem[]>(initialItems);
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(
    null,
  );
  const hasAppliedInitialSelection = useRef(false);
  const [filterType, setFilterType] = useState<"all" | "task" | "plan" | "self">(
    "all",
  );
  const [feedbackStatus, setFeedbackStatus] = useState<"pending" | "all">(
    "pending",
  );
  const [feedbackText, setFeedbackText] = useState("");
  const [expandedPlanItemId, setExpandedPlanItemId] = useState<
    string | number | null
  >(null);
  const [publishedFeedback, setPublishedFeedback] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Daily comment state for plan type
  const [dailyMenteeComment, setDailyMenteeComment] = useState<string | null>(null);
  const [dailyMentorReply, setDailyMentorReply] = useState<string | null>(null);
  const [isDailyCommentLoading, setIsDailyCommentLoading] = useState(false);

  const handleDownloadAttachment = async (
    fileId: string | null | undefined,
    name: string,
  ) => {
    if (!fileId) return;
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const res = await fetch(`/api/files/${fileId}?mode=download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        alert("파일 다운로드에 실패했습니다.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name || "attachment";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("파일 다운로드에 실패했습니다.");
    }
  };

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const { rawPlanItems, allItems } = useMemo(() => {
      const taskItems = items.filter((i) => i.type === "task");

      const rawPlanItems = items.filter((i) => i.type === "plan");
      const groupedPlans = new Map<string, FeedbackItem[]>();
      rawPlanItems.forEach((item) => {
        const key = `${item.studentId}-${toDateKey(item.date)}`;
        const list = groupedPlans.get(key) ?? [];
        list.push(item);
        groupedPlans.set(key, list);
      });

      const planItems: FeedbackItem[] = Array.from(groupedPlans.entries()).map(
        ([groupKey, groupedItems]) => {
          const first = groupedItems[0];
          const planDate = toDate(first.date);
          const plannerTasks = groupedItems.map((i) => i.data);
          const totalStudySeconds = plannerTasks.reduce(
            (sum, row) => sum + (Number(row?.time_spent_sec) || 0),
            0,
          );

          return {
            id: `plan-${groupKey}`,
            type: "plan",
            studentId: first.studentId,
            studentName: first.studentName,
            avatarUrl: first.avatarUrl,
            title: `${planDate.getMonth() + 1}월 ${planDate.getDate()}일 플래너`,
            subtitle: `완료한 할 일 ${plannerTasks.length}개`,
            date: planDate,
            status: "submitted",
            data: {
              plannerTasks,
              totalStudySeconds,
              dailyGoal: first.data?.dailyGoal ?? first.data?.daily_goal ?? "",
            },
          };
        },
      );

      const selfItems: FeedbackItem[] = rawPlanItems
        .filter(
          (item) =>
            !item.data?.is_mentor_task &&
            hasUploadedSelfStudyFile(item.data?.materials),
        )
        .map((item) => {
          const selfDate = toDate(item.date);
          return {
            id: `self-${item.id}`,
            type: "self",
            studentId: item.studentId,
            studentName: item.studentName,
            avatarUrl: item.avatarUrl,
            title: item.data?.title || item.title || "자습 할 일",
            subtitle: item.data?.subjects?.name || item.subtitle || "자습",
            date: selfDate,
            status: "submitted",
            data: {
              ...item.data,
              plannerTaskId: item.data?.id,
            },
          };
        });

      const allItems = [...taskItems, ...planItems, ...selfItems].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

      return { rawPlanItems, allItems };
    }, [items]);

  const resolvedInitialSelectedItemId = useMemo(() => {
    if (!initialSelectedItemId) return null;

    if (allItems.some((item) => String(item.id) === initialSelectedItemId)) {
      return initialSelectedItemId;
    }

    if (initialSelectedItemId.startsWith("plan-")) {
      const rawPlan = rawPlanItems.find(
        (item) => String(item.id) === initialSelectedItemId,
      );

      if (rawPlan) {
        const groupedPlanId = `plan-${rawPlan.studentId}-${toDateKey(rawPlan.date)}`;
        if (allItems.some((item) => String(item.id) === groupedPlanId)) {
          return groupedPlanId;
        }

        const selfItemId = `self-${initialSelectedItemId}`;
        if (allItems.some((item) => String(item.id) === selfItemId)) {
          return selfItemId;
        }
      }
    }

    const prefixedSelfId = `self-${initialSelectedItemId}`;
    if (allItems.some((item) => String(item.id) === prefixedSelfId)) {
      return prefixedSelfId;
    }

    return null;
  }, [initialSelectedItemId, allItems, rawPlanItems]);

  useEffect(() => {
    if (hasAppliedInitialSelection.current) return;
    if (!resolvedInitialSelectedItemId) return;
    setSelectedItemId(resolvedInitialSelectedItemId);
    hasAppliedInitialSelection.current = true;
  }, [resolvedInitialSelectedItemId]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filterType !== "all" && item.type !== filterType) return false;
      if (feedbackStatus === "pending" && item.status === "reviewed") return false;
      return true;
    });
  }, [allItems, filterType, feedbackStatus]);

  const selectedItem = useMemo(
    () => allItems.find((i) => i.id === selectedItemId),
    [allItems, selectedItemId],
  );
  const selectedTaskFeedback = useMemo(
    () =>
      selectedItem?.type === "task"
        ? selectedItem.data?.task_feedback?.[0]?.comment ?? ""
        : "",
    [selectedItem],
  );
  const selectedSelfFeedback = useMemo(
    () =>
      selectedItem?.type === "self"
        ? selectedItem.data?.mentor_comment ??
          selectedItem.data?.mentorComment ??
          ""
        : "",
    [selectedItem],
  );
  const isTaskReviewed = useMemo(
    () => selectedItem?.type === "task" && selectedItem.status === "reviewed",
    [selectedItem],
  );

  // Load daily comment when plan item is selected
  useEffect(() => {
    if (!selectedItem || selectedItem.type !== "plan") {
      setDailyMenteeComment(null);
      setDailyMentorReply(null);
      return;
    }

    const loadDailyComment = async () => {
      setIsDailyCommentLoading(true);
      try {
        const planDate = toDate(selectedItem.date);
        const dateStr = toDateKey(planDate);
        const res = await fetch(
          `/api/mentee/planner/daily-comment?menteeId=${selectedItem.studentId}&date=${dateStr}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setDailyMenteeComment(json.data.menteeComment || null);
            setDailyMentorReply(json.data.mentorReply || null);
          }
        }
      } catch (e) {
        console.error("Failed to load daily comment", e);
      } finally {
        setIsDailyCommentLoading(false);
      }
    };

    loadDailyComment();
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedItem) {
      setFeedbackText("");
      return;
    }

    if (selectedItem.type === "task") {
      setFeedbackText(selectedTaskFeedback);
      return;
    }

    if (selectedItem.type === "self") {
      setFeedbackText(selectedSelfFeedback);
      return;
    }

    if (selectedItem.type === "plan") {
      setFeedbackText(dailyMentorReply ?? publishedFeedback ?? "");
    }
  }, [
    selectedItemId,
    selectedItem,
    selectedTaskFeedback,
    selectedSelfFeedback,
    publishedFeedback,
    dailyMentorReply,
  ]);

  // --- Handlers ---
  const handleSendFeedback = async () => {
    if (!selectedItem) return;

    if (selectedItem.type === "task") {
      if (isTaskReviewed) {
        openModal({
          title: "이미 피드백 완료",
          content:
            "이미 등록된 피드백이 있습니다. 변경이 필요하면 별도 요청해주세요.",
          type: "confirm",
        });
        return;
      }
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
          setItems((prev) =>
            prev.map((item) => {
              if (item.id !== selectedItem.id) return item;
              return {
                ...item,
                status: "reviewed",
                data: {
                  ...item.data,
                  task_feedback: [
                    {
                      comment: feedbackText,
                      created_at: new Date().toISOString(),
                      status: "reviewed",
                    },
                  ],
                },
              };
            }),
          );
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

    if (selectedItem.type === "self") {
      if (!feedbackText.trim()) {
        alert("피드백 내용을 입력해주세요.");
        return;
      }

      const plannerTaskId = String(
        selectedItem.data?.plannerTaskId ?? selectedItem.data?.id ?? "",
      );
      if (!plannerTaskId) {
        alert("자습 항목 ID를 찾을 수 없습니다.");
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch("/api/mentor/feedback/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mentorId,
            taskId: plannerTaskId,
            comment: feedbackText,
            type: "planner_task",
          }),
        });

        const result = await response.json();

        if (result.success) {
          openModal({
            title: "전송 완료",
            content: "✅ 자습 피드백이 전송되었습니다.",
            type: "success",
          });
          setItems((prev) =>
            prev.map((item) => {
              if (item.id !== selectedItem.id) return item;
              return {
                ...item,
                data: {
                  ...item.data,
                  mentor_comment: feedbackText,
                },
              };
            }),
          );
        } else {
          openModal({
            title: "전송 실패",
            content: result.error || "알 수 없는 오류가 발생했습니다.",
            type: "confirm",
          });
        }
      } catch (error) {
        console.error("Self Study Feedback Submit Error:", error);
        alert("피드백 전송 중 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // For plan types - save to daily_records
    if (selectedItem.type === "plan") {
      if (!feedbackText.trim()) {
        alert("답글 내용을 입력해주세요.");
        return;
      }

      setIsSubmitting(true);
      try {
        const planDate = toDate(selectedItem.date);
        const dateStr = toDateKey(planDate);

        const response = await fetch("/api/mentor/feedback/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mentorId,
            menteeId: selectedItem.studentId,
            date: dateStr,
            comment: feedbackText,
            type: "daily_plan",
          }),
        });

        const result = await response.json();

        if (result.success) {
          setPublishedFeedback(feedbackText);
          setDailyMentorReply(feedbackText);
          openModal({
            title: "전송 완료",
            content: "✅ 일일 플래너 답글이 전송되었습니다.",
            type: "success",
          });
        } else {
          openModal({
            title: "전송 실패",
            content: result.error || "알 수 없는 오류가 발생했습니다.",
            type: "confirm",
          });
        }
      } catch (error) {
        console.error("Daily plan feedback submit error:", error);
        alert("답글 전송 중 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // For other types
    openModal({
      title: "리포트 전송",
      content: "작성하신 총평을 전송하고 플래너에 반영하시겠습니까?",
      type: "confirm",
      onConfirm: () => {
        setPublishedFeedback(feedbackText);
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
  const getPlanData = (item: FeedbackItem) => {
    const planDate = toDate(item.date);
    const plannerRows = (item.data?.plannerTasks ?? []) as any[];

    const plannerTasks = plannerRows.map((row) => ({
      id: row?.id,
      taskType: "plan",
      title: row?.title || "학습 항목",
      description: row?.description || "",
      date: row?.date || planDate.toISOString().slice(0, 10),
      completed: Boolean(row?.completed ?? true),
      categoryId: resolveCategoryId(row),
      subject: row?.subjects?.name || row?.subject || "자습",
      timeSpent: Number(row?.time_spent_sec) || 0,
      startTime: row?.start_time || undefined,
      endTime: row?.end_time || undefined,
      hasMentorResponse: Boolean(row?.mentor_comment),
      mentorComment: row?.mentor_comment || undefined,
    }));

    return {
      planDate,
      mentorDeadlines: [],
      userTasks: plannerTasks,
      dailyRecord: {
        studyTime: Number(item.data?.totalStudySeconds) || 0,
        memo: item.data?.dailyGoal || "",
      },
      dailyEvents: [],
      dailyGoalText: item.data?.dailyGoal || "",
      completedTaskCount: plannerTasks.length,
    };
  };

  const handleExpandPlan = (itemId: string | number) => {
    setExpandedPlanItemId(itemId);
  };

  const expandedPlanItem = allItems.find(
    (item) => item.id === expandedPlanItemId && item.type === "plan",
  );
  const expandedPlanData = expandedPlanItem ? getPlanData(expandedPlanItem) : null;
  const selectedPlanData =
    selectedItem?.type === "plan" ? getPlanData(selectedItem) : null;

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

          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={() => setFeedbackStatus("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                feedbackStatus === "pending"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              미피드백
            </button>
            <button
              type="button"
              onClick={() => setFeedbackStatus("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                feedbackStatus === "all"
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              전체
            </button>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { id: "all", label: "전체", icon: null },
              { id: "task", label: "과제", icon: <FileText size={14} /> },
              { id: "plan", label: "플래너", icon: <Calendar size={14} /> },
              { id: "self", label: "자습", icon: <BookOpen size={14} /> },
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
                    {item.type === "self" && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md flex items-center gap-1">
                        <BookOpen size={10} /> 자습
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
                  {item.status === "reviewed" && (
                    <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      피드백 완료
                    </span>
                  )}
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
                                  selectedItem.type === "plan"
                                    ? "bg-purple-100 text-purple-600"
                                    : selectedItem.type === "self"
                                      ? "bg-emerald-100 text-emerald-600"
                                      : "bg-blue-100 text-blue-600"
                                }`}
                  >
                    {selectedItem.type === "plan" ? (
                      <Calendar size={20} />
                    ) : selectedItem.type === "self" ? (
                      <BookOpen size={20} />
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
                    <div className="w-full md:w-[420px] shrink-0">
                      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-0">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Calendar size={16} className="text-purple-600" />{" "}
                            플래너 미리보기
                          </h3>
                          <button
                            onClick={() => handleExpandPlan(selectedItem.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="크게 보기"
                          >
                            <Maximize2 size={16} />
                          </button>
                        </div>

                        {selectedPlanData && (
                          <div
                            className="h-[620px] rounded-xl border border-gray-100 overflow-hidden cursor-pointer"
                            onClick={() => handleExpandPlan(selectedItem.id)}
                          >
                            <PlannerDetailView
                              date={selectedPlanData.planDate}
                              dailyRecord={selectedPlanData.dailyRecord}
                              mentorDeadlines={selectedPlanData.mentorDeadlines}
                              userTasks={selectedPlanData.userTasks}
                              dailyEvents={selectedPlanData.dailyEvents}
                              mentorReview={publishedFeedback ?? undefined}
                              size="full"
                            />
                          </div>
                        )}
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
                            "
                            {selectedPlanData?.dailyGoalText ||
                              `완료한 할 일 ${selectedPlanData?.completedTaskCount ?? 0}개를 점검해주세요.`}
                            "
                          </p>
                        </div>

                        {/* Mentee Daily Comment */}
                        {isDailyCommentLoading ? (
                          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4">
                            <p className="text-xs text-orange-600 font-medium">
                              멘티 코멘트 로딩중...
                            </p>
                          </div>
                        ) : dailyMenteeComment ? (
                          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4">
                            <h4 className="text-xs font-bold text-orange-600 mb-2 flex items-center gap-1">
                              💬 멘티 코멘트
                            </h4>
                            <p className="text-gray-900 font-medium">
                              "{dailyMenteeComment}"
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                            <p className="text-xs text-gray-400 font-medium">
                              아직 멘티가 코멘트를 작성하지 않았습니다.
                            </p>
                          </div>
                        )}
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
                                  {sub.type === "image" ? "Image" : "PDF Document"}
                                </p>
                              </div>
                              {sub.fileId ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownloadAttachment(sub.fileId, sub.name)
                                  }
                                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                  <Download size={16} />
                                </button>
                              ) : null}
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
                        className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none mb-4 disabled:bg-gray-100 disabled:text-gray-500"
                        disabled={isTaskReviewed}
                      />
                      {isTaskReviewed && (
                        <p className="text-[11px] text-emerald-600 font-bold mb-3">
                          이미 피드백이 완료된 과제입니다.
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleSendFeedback}
                          disabled={isSubmitting || isTaskReviewed}
                          className="px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
                        >
                          <Send size={14} />{" "}
                          {isSubmitting ? "전송 중..." : "피드백 전송"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SELF STUDY DETAIL */}
                {selectedItem.type === "self" && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-600">
                          {selectedItem.data?.subjects?.name ||
                            selectedItem.data?.subject ||
                            "자습"}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">
                          {selectedItem.data?.title || selectedItem.title}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-600 mb-6 border-b border-gray-50 pb-4">
                        {selectedItem.data?.description ||
                          "학생이 직접 만든 자습 할 일입니다."}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <p className="font-bold text-gray-500 mb-1">학습일</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(selectedItem.date)}
                          </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <p className="font-bold text-gray-500 mb-1">
                            완료 상태
                          </p>
                          <p className="font-semibold text-gray-900">
                            {selectedItem.data?.completed ? "완료" : "미완료"}
                          </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <p className="font-bold text-gray-500 mb-1">
                            학습 시간
                          </p>
                          <p className="font-semibold text-gray-900">
                            {Math.floor(
                              Number(selectedItem.data?.time_spent_sec || 0) / 60,
                            )}
                            분
                          </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <p className="font-bold text-gray-500 mb-1">
                            학습 시간대
                          </p>
                          <p className="font-semibold text-gray-900">
                            {selectedItem.data?.start_time && selectedItem.data?.end_time
                              ? `${selectedItem.data.start_time} - ${selectedItem.data.end_time}`
                              : "미설정"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm ring-4 ring-blue-50/50">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare size={16} className="text-blue-500" />
                        자습 피드백
                      </h3>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="학생이 작성한 자습 할 일에 대한 피드백을 입력해주세요."
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

      {expandedPlanData && expandedPlanItem && (
        <PlannerDetailModal
          isOpen={!!expandedPlanItem}
          onClose={() => setExpandedPlanItemId(null)}
          date={expandedPlanData.planDate}
          dailyRecord={expandedPlanData.dailyRecord}
          mentorDeadlines={expandedPlanData.mentorDeadlines}
          plannerTasks={expandedPlanData.userTasks as any}
          dailyEvents={expandedPlanData.dailyEvents}
          mentorReview={publishedFeedback ?? undefined}
        />
      )}
    </div>
  );
}
