"use client";

import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Upload,
  CheckCircle2,
  Book,
  PenTool,
  FolderOpen,
  BookOpen,
  Edit3,
  HelpCircle,
  Folder,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Attachment {
  id?: string;
  fileId?: string;
  name: string;
  type: "pdf" | "image";
  url?: string | null;
  previewUrl?: string | null;
}

interface TaskDetailViewProps {
  task: {
    id: string | number;
    title: string;
    description: string;
    status?: string;
    badgeColor: {
      bg: string;
      text: string;
    };
    categoryId: string;
    attachments?: Attachment[];
    submissions?: Attachment[];
    submissionNote?: string | null;
    submittedAt?: string | null;
    mentorComment?: string;
    feedbackFiles?: Attachment[];
    isMentorTask?: boolean;
    completed?: boolean;
    studyRecord?: {
      photo?: string;
      photos?: string[];
      note?: string;
    };
    userQuestion?: string;
    hasMentorResponse?: boolean;
    recurringGroupId?: string | null;
  };
  mode?: "page" | "modal";
  onClose?: () => void;
  isReadOnly?: boolean;
  enableFeedbackInput?: boolean;
  onFeedbackSubmit?: (comment: string, rating: number) => Promise<void>;
}

export default function TaskDetailView({
  task,
  mode = "page",
  onClose,
  isReadOnly = false,
  enableFeedbackInput = false,
  onFeedbackSubmit,
}: TaskDetailViewProps) {
  console.log("TaskDetailView Debug:", {
    id: task.id,
    title: task.title,
    isMentorTask: task.isMentorTask,
    completed: task.completed,
    status: task.status,
    studyRecord: !!task.studyRecord,
  });
  const category =
    DEFAULT_CATEGORIES.find((c) => c.id === task.categoryId) ||
    DEFAULT_CATEGORIES[0];
  const isMentorTask = task.isMentorTask ?? true;
  const hasSubmissionFiles = (task.submissions?.length ?? 0) > 0;
  const isSubmitted =
    task.status === "submitted" ||
    task.status === "feedback_completed" ||
    hasSubmissionFiles ||
    !!task.studyRecord;
  const isCompleted = isMentorTask
    ? isSubmitted
    : !!task.completed || !!task.studyRecord;
  const isFeedbackAlreadySubmitted =
    !!task.hasMentorResponse || task.status === "feedback_completed";
  const showFeedbackInput = enableFeedbackInput && !isFeedbackAlreadySubmitted;
  const [memo, setMemo] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectFiles = (files: FileList | null) => {
    if (!files) return;
    const next: File[] = [];
    const rejected: string[] = [];

    Array.from(files).forEach((file) => {
      const lowerType = file.type.toLowerCase();
      const lowerName = file.name.toLowerCase();
      const isPdf =
        lowerType === "application/pdf" || lowerName.endsWith(".pdf");
      const isImage = lowerType.startsWith("image/");
      if (!isPdf && !isImage) {
        rejected.push(file.name);
        return;
      }
      next.push(file);
    });

    if (rejected.length > 0) {
      setSubmissionError(
        `PDF 또는 이미지 파일만 업로드할 수 있습니다: ${rejected.join(", ")}`,
      );
    } else {
      setSubmissionError(null);
    }

    if (next.length > 0) {
      setSelectedFiles((prev) => [...prev, ...next]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmitRecord = async () => {
    if (isSubmittingRecord) return;

    if (isMentorTask && selectedFiles.length === 0) {
      alert("과제 제출은 PDF 또는 이미지 첨부가 필요합니다.");
      return;
    }

    if (!isMentorTask) {
      alert("자율 학습 제출은 아직 준비 중입니다.");
      return;
    }

    setIsSubmittingRecord(true);
    setSubmissionError(null);

    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      const attachments: {
        bucket: string;
        path: string;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
      }[] = [];

      for (const file of selectedFiles) {
        const ext = file.name.split(".").pop() || "bin";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const filePath = `submissions/${user.id}/${task.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("materials")
          .upload(filePath, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        attachments.push({
          bucket: "materials",
          path: filePath,
          originalName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        });
      }

      const response = await fetch(
        `/api/mentee/tasks/${task.id}/submissions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            menteeId: user.id,
            note: memo || null,
            attachments,
          }),
        },
      );

      if (!response.ok) {
        const res = await response.json().catch(() => ({}));
        throw new Error(res.error || "제출에 실패했습니다.");
      }

      setSelectedFiles([]);
      setMemo("");
      alert("과제가 제출되었습니다.");
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      setSubmissionError(error?.message || "제출에 실패했습니다.");
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  // Feedback State
  const [feedbackComment, setFeedbackComment] = useState(
    task.mentorComment || "",
  );
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!onFeedbackSubmit) return;
    setIsSubmittingFeedback(true);
    try {
      await onFeedbackSubmit(feedbackComment, 5); // Default rating 5 for now
      onClose?.();
    } catch (e) {
      console.error(e);
      alert("피드백 저장 실패");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const searchParams = useSearchParams();
  const router = useRouter();

  const handleBackNavigation = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/planner");
  };

  useEffect(() => {
    if (mode === "modal") return;
    const focus = searchParams?.get("focus");
    if (focus === "submit") {
      const target = document.getElementById("submission-section");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [searchParams]);

  return (
    <div
      className={
        mode === "page"
          ? "min-h-screen bg-gray-50 pb-32"
          : "h-full bg-white overflow-y-auto"
      }
    >
      {/* Top Header - Only for Page mode */}
      {mode === "page" && (
        <header className="bg-white px-4 safe-top-header-lg pb-5 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100/50 backdrop-blur-xl">
          <button
            type="button"
            onClick={handleBackNavigation}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-black text-gray-900 tracking-tight truncate">
              {task.title}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5 flex items-center gap-1">
              {isMentorTask ? "멘토 과제" : "나의 과제"}
              {isCompleted && " • 완수됨"}
            </p>
          </div>
        </header>
      )}

      <div
        className={`${mode === "page" ? "max-w-[430px] mx-auto" : "w-full"} px-6 pt-4 pb-8 space-y-6`}
      >
        {/* Section 1: Task Information (Unified) */}
        <section className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                  isMentorTask
                    ? "bg-primary/10 text-primary"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isMentorTask ? "과제 정보" : "학습 목표"}
              </span>
              <span className="text-[10px] text-gray-400 font-bold ml-auto">
                {isMentorTask ? "Mentor's Library" : "Self Planning"}
              </span>
            </div>
            <h2 className="text-[18px] font-black text-gray-900 leading-tight">
              {task.title}
            </h2>
            <p className="text-[13px] text-gray-500 font-medium leading-relaxed mt-1">
              {task.description ||
                (isMentorTask
                  ? "멘토가 배정한 과제입니다."
                  : "직접 세운 학습 계획입니다.")}
            </p>
          </div>

          {/* Task Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="pt-2">
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                {isMentorTask ? "멘토 첨부 파일" : "학습 첨부 파일"}
              </p>
              <div className="space-y-3">
                {task.attachments.map((file, idx) => (
                  <FileCard key={idx} file={file} />
                ))}
              </div>
            </div>
          )}
          <div
            className={`absolute top-0 left-0 w-1.5 h-full ${isMentorTask ? "bg-primary" : "bg-gray-200"}`}
          />
        </section>

        {/* Section 2: Study Record / Submission (Unified) */}
        <section
          id="submission-section"
          className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                task.studyRecord
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isMentorTask ? "과제 제출" : "학습 기록"}
            </span>
            <span className="text-[10px] text-gray-400 font-bold ml-auto">
              {isCompleted ? "완료됨" : "미완료"}
            </span>
          </div>

          {isMentorTask &&
            !hasSubmissionFiles &&
            !task.studyRecord &&
            !isSubmitted &&
            !isReadOnly && (
            <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4">
              <p className="text-[11px] font-black text-orange-600 mb-1">
                멘토 과제 완료 규칙
              </p>
              <p className="text-[12px] text-orange-700/90 font-medium">
                멘토가 만든 과제는 제출을 완료해야 체크됩니다. 제출 후 완료로
                처리돼요.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {isMentorTask && hasSubmissionFiles ? (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                  <div className="p-4 bg-white border-b border-gray-100">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      제출된 파일
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    {task.submissions?.map((file, idx) => (
                      <FileCard key={`${file.fileId ?? file.name}-${idx}`} file={file} />
                    ))}
                  </div>
                </div>

                {task.submissionNote && task.submissionNote.trim() ? (
                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <p className="text-[10px] text-gray-500 font-bold mb-2 flex items-center gap-1.5">
                      <MessageCircle size={12} className="text-gray-400" />
                      제출 메모
                    </p>
                    <p className="text-[13px] text-gray-700 font-medium leading-relaxed italic">
                      "{task.submissionNote}"
                    </p>
                  </div>
                ) : null}
              </div>
            ) : task.studyRecord ? (
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                {/* Photos Preview */}
                <div className="p-3">
                  {task.studyRecord.photos &&
                  task.studyRecord.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {task.studyRecord.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group"
                        >
                          <img
                            src={photo}
                            alt={`study record ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-[10px] font-bold text-gray-900 shadow-lg">
                              상세보기
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : task.studyRecord.photo ? (
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group max-w-[50%]">
                      <img
                        src={task.studyRecord.photo}
                        alt="study record"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-[10px] font-bold text-gray-900 shadow-lg">
                          상세보기
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Message/Note Content */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <p className="text-[10px] text-gray-500 font-bold mb-2 flex items-center gap-1.5">
                    <MessageCircle size={12} className="text-gray-400" />
                    나의 메모
                  </p>
                  <p className="text-[13px] text-gray-700 font-medium leading-relaxed italic">
                    "
                    {task.studyRecord.note ||
                      task.userQuestion ||
                      "기록된 메모가 없습니다."}
                    "
                  </p>
                </div>
              </div>
            ) : isReadOnly ? (
              // Helper message for Mentor view when no record
              isCompleted ? (
                <div className="text-center py-10 bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-100/80">
                  <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-emerald-50">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-emerald-600">
                    인증 없이 완료된 과제입니다.
                  </p>
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100/80">
                  <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-gray-50">
                    <CheckCircle2 size={18} className="text-gray-300" />
                  </div>
                  <p className="text-xs font-bold text-gray-400">
                    아직 학습 기록이 제출되지 않았습니다.
                  </p>
                </div>
              )
            ) : (
              /* Upload UI (When no record exists) */
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 rounded-[24px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 hover:border-primary/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:bg-primary/5 group-hover:scale-110 transition-all">
                    <Upload size={24} />
                  </div>
                  <div className="text-center">
                    <span className="text-[13px] font-black text-gray-900 block">
                      오늘 공부 인증하기
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 mt-0.5 block">
                      사진이나 PDF를 업로드하세요
                    </span>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleSelectFiles(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />

                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600"
                      >
                        <span className="truncate font-semibold">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {submissionError && (
                  <p className="text-xs text-red-500 font-semibold">
                    {submissionError}
                  </p>
                )}

                {/* Shared Memo Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[12px] font-black text-gray-900">
                      멘토에게 남기는 메모
                    </label>
                    <span className="text-[10px] text-primary font-bold">
                      멘토와 공유됨
                    </span>
                  </div>
                  <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="멘토님께 전달할 메시지나 궁금한 점을 자유롭게 적어주세요."
                    className="w-full min-h-[100px] p-4 rounded-2xl bg-gray-50 border border-gray-100 text-[13px] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all resize-none"
                  />
                  <p className="text-[10px] text-gray-400 font-bold px-1 italic">
                    * 과제 제출 시 멘토에게 함께 전달되는 메시지입니다.
                  </p>
                </div>

                {!isMentorTask && (
                  <p className="text-[11px] text-center text-gray-400 font-medium">
                    * 자율 학습은 기록 제출이 선택 사항입니다.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action buttons (only when not completed) */}
          {!isReadOnly &&
            !(isMentorTask ? hasSubmissionFiles || isSubmitted : task.studyRecord) && (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleSubmitRecord}
                disabled={isSubmittingRecord}
                className={`w-full py-4 rounded-2xl text-[13px] font-black flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  isMentorTask
                    ? "bg-primary text-white shadow-xl shadow-blue-200 hover:bg-blue-600"
                    : "bg-gray-900 text-white shadow-xl shadow-gray-200 hover:bg-black"
                } ${isSubmittingRecord ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSubmittingRecord
                  ? "제출 중..."
                  : isMentorTask
                    ? "과제 제출 완료하기"
                    : "학습 기록 저장하기"}
              </button>
            </div>
          )}
        </section>

        {/* Section 3: Mentor Feedback (Always visible if a record exists or is mentor task OR feedback enabled) */}
        {(isMentorTask || task.studyRecord || enableFeedbackInput) && (
          <section className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-gray-900 text-white text-[10px] font-bold uppercase tracking-tight">
                  멘토 피드백
                </span>
              </div>
              {(!showFeedbackInput || isFeedbackAlreadySubmitted) && (
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                    isFeedbackAlreadySubmitted
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {isFeedbackAlreadySubmitted ? "답변 완료" : "답변 대기"}
                </span>
              )}
            </div>

            {showFeedbackInput ? (
              <div className="space-y-3">
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full min-h-[120px] p-4 rounded-2xl bg-gray-50 border border-gray-100 text-[13px] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all resize-none"
                  placeholder="칭찬과 격려의 말을 남겨주세요!"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={isSubmittingFeedback || !feedbackComment.trim()}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-lg disabled:opacity-50 disabled:shadow-none"
                  >
                    {isSubmittingFeedback ? "저장 중..." : "피드백 등록"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Mentor's Response
                  </p>
                  <div
                    className={`min-h-[100px] rounded-[24px] p-5 border transition-colors ${isFeedbackAlreadySubmitted ? "bg-primary/5 border-primary/10" : "bg-gray-50 border-gray-100"}`}
                  >
                    {isFeedbackAlreadySubmitted ? (
                      <p className="text-[14px] text-gray-800 font-bold leading-relaxed">
                        {task.mentorComment || "피드백이 등록되었습니다."}
                      </p>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 py-4">
                        <MessageCircle size={24} className="animate-pulse" />
                        <p className="text-[12px] font-bold">
                          멘토가 학습 내용을 확인 중입니다.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function FileCard({ file }: { file: Attachment }) {
  const hasDirectPreviewUrl =
    typeof file.previewUrl === "string" &&
    file.previewUrl.length > 0 &&
    !file.previewUrl.startsWith("/api/files/");
  const [previewSrc, setPreviewSrc] = useState<string | null>(
    hasDirectPreviewUrl ? file.previewUrl! : null,
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(
    Boolean(file.fileId) && !hasDirectPreviewUrl,
  );
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (hasDirectPreviewUrl) {
      setPreviewSrc(file.previewUrl!);
      setIsLoadingPreview(false);
      return;
    }

    if (!file.fileId) {
      setPreviewSrc(null);
      setIsLoadingPreview(false);
      return;
    }

    let isMounted = true;
    let objectUrl: string | null = null;

    const loadPreview = async () => {
      setIsLoadingPreview(true);
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;

        const res = await fetch(`/api/files/${file.fileId}?mode=preview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (isMounted) {
          setPreviewSrc(objectUrl);
        } else {
          URL.revokeObjectURL(objectUrl);
        }
      } finally {
        if (isMounted) {
          setIsLoadingPreview(false);
        }
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file.fileId, file.previewUrl, hasDirectPreviewUrl]);

  const handleDownload = async () => {
    if (isDownloading) return;

    if (!file.fileId) {
      if (file.url) {
        window.open(file.url, "_blank", "noopener,noreferrer");
      } else {
        alert("다운로드할 수 있는 파일 정보가 없습니다.");
      }
      return;
    }

    setIsDownloading(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const res = await fetch(`/api/files/${file.fileId}?mode=download`, {
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
      link.download = file.name || "attachment";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    if (previewSrc) {
      window.open(previewSrc, "_blank", "noopener,noreferrer");
      return;
    }

    if (hasDirectPreviewUrl && file.previewUrl) {
      window.open(file.previewUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!file.fileId) return;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const res = await fetch(`/api/files/${file.fileId}?mode=preview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      alert("미리보기에 실패했습니다.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const canDownload = Boolean(file.fileId || file.url);
  const canPreview = Boolean(previewSrc || hasDirectPreviewUrl || file.fileId);

  return (
    <div className="bg-gray-50 rounded-[24px] border border-gray-100 overflow-hidden group">
      <div className="p-4 flex items-center justify-between border-b border-gray-100/50">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              file.type === "pdf"
                ? "bg-red-50 text-red-500"
                : "bg-emerald-50 text-emerald-500"
            }`}
          >
            {file.type === "pdf" ? (
              <FileText size={20} />
            ) : (
              <ImageIcon size={20} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-[10px] text-gray-400 font-medium uppercase">
              {file.type}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!canDownload || isDownloading}
          className={`p-2 transition-colors ${
            canDownload
              ? "text-gray-400 hover:text-gray-900"
              : "text-gray-300 cursor-not-allowed"
          }`}
        >
          <Download size={18} />
        </button>
      </div>
      <div className="aspect-video bg-gray-100 relative overflow-hidden flex items-center justify-center">
        {file.type === "image" ? (
          previewSrc ? (
            <img
              src={previewSrc}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : isLoadingPreview ? (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <ImageIcon size={40} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Preview Loading
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <ImageIcon size={40} />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Preview Unavailable
              </span>
            </div>
          )
        ) : (
          previewSrc ? (
            <iframe
              src={previewSrc}
              title={`${file.name} PDF Preview`}
              className="w-full h-full bg-white"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FileText size={40} className="text-gray-300" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {isLoadingPreview ? "PDF Loading" : "PDF Preview Unavailable"}
              </span>
            </div>
          )
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {canPreview ? (
            <button
              type="button"
              onClick={handlePreview}
              className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold text-gray-900 shadow-lg flex items-center gap-2"
            >
              <Eye size={14} /> 미리보기
            </button>
          ) : (
            <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold text-gray-400 shadow-lg flex items-center gap-2">
              <Eye size={14} /> 미리보기 없음
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
