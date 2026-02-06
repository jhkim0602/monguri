"use client";

import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  BookOpen,
  AlertCircle,
  Clock,
  FileText,
  Link as LinkIcon,
  Trash2,
  FolderOpen,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { createMentorTaskAction } from "@/actions/mentorActions";
import { getMaterialsAction } from "@/actions/materialsActions";
import { MentorMaterial } from "@/repositories/materialsRepository";
// ... imports at top ...
import { getSubjectsAction } from "@/actions/mentorActions";
import { SubjectRow } from "@/repositories/subjectsRepository";

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  menteeId: string;
  selectedDate?: Date;
}

export default function TaskAssignmentModal({
  isOpen,
  onClose,
  menteeId,
  selectedDate,
}: TaskAssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  // ...
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);

  useEffect(() => {
    if (isOpen) {
      getSubjectsAction().then((res) => {
        if (res.success && res.data) setSubjects(res.data);
      });
    }
  }, [isOpen]);

  const [date, setDate] = useState(
    selectedDate
      ? selectedDate.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [materials, setMaterials] = useState<{ title: string; url: string }[]>(
    [],
  );
  const [materialInput, setMaterialInput] = useState({ title: "", url: "" });

  // Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [libraryMaterials, setLibraryMaterials] = useState<MentorMaterial[]>(
    [],
  );
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedFromLibrary, setSelectedFromLibrary] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("과제 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    const result = await createMentorTaskAction(
      menteeId,
      title,
      date,
      subjectId,
      startTime,
      endTime,
      description,
      materials,
    );
    setIsSubmitting(false);

    if (result.success) {
      alert("과제가 부여되었습니다.");
      onClose();
      // Reset form
      setTitle("");
      setStartTime("");
      setEndTime("");
      setDescription("");
      setMaterials([]);
      setMaterialInput({ title: "", url: "" });
      setSelectedFromLibrary([]);
    } else {
      alert(result.error);
    }
  };

  const openPicker = async () => {
    setIsPickerOpen(true);
    // Always fetch fresh data when opening to avoid stale state
    setIsLoadingLibrary(true);
    const res = await getMaterialsAction();
    if (res.success && res.data) {
      setLibraryMaterials(res.data);

      // Pre-select items that are already in the materials list (by URL)
      const existingUrls = new Set(materials.map((m) => m.url));
      const matchedIds = res.data
        .filter((m) => existingUrls.has(m.url))
        .map((m) => m.id);

      setSelectedFromLibrary(matchedIds);
    }
    setIsLoadingLibrary(false);
  };

  const handleLibraryConfirm = () => {
    const selectedItems = libraryMaterials
      .filter((m) => selectedFromLibrary.includes(m.id))
      .map((m) => ({ title: m.title, url: m.url }));

    // Simple duplicate check by URL
    const newItems = selectedItems.filter(
      (newItem) => !materials.some((existing) => existing.url === newItem.url),
    );

    setMaterials([...materials, ...newItems]);
    setIsPickerOpen(false);
    setSelectedFromLibrary([]);
  };

  const toggleLibrarySelection = (id: string) => {
    if (selectedFromLibrary.includes(id)) {
      setSelectedFromLibrary((prev) => prev.filter((x) => x !== id));
    } else {
      setSelectedFromLibrary((prev) => [...prev, id]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            과제 부여
            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              New
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors shadow-sm border border-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar relative">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <Calendar size={14} /> 수행 날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            {/* Time Picker Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <Clock size={14} /> 시작 시간
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <Clock size={14} /> 종료 시간
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Subject Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <BookOpen size={14} /> 과목 선택 (선택 사항)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {subjects.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() =>
                      setSubjectId(sub.id === subjectId ? "" : sub.id)
                    }
                    className={`px-2 py-2 rounded-lg text-xs font-bold border transition-all ${
                      subjectId === sub.id
                        ? "border-transparent text-white shadow-md transform scale-105"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    style={{
                      backgroundColor:
                        subjectId === sub.id
                          ? sub.color_hex || "#3b82f6"
                          : undefined,
                      color:
                        subjectId === sub.id
                          ? sub.text_color_hex || "#ffffff"
                          : undefined,
                    }}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <AlertCircle size={14} /> 과제 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 수학 정석 p.40-45 풀기"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            {/* Materials Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <LinkIcon size={14} /> 학습 자료
                </label>
                <button
                  type="button"
                  onClick={openPicker}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors border border-blue-100 shadow-sm"
                >
                  <FolderOpen size={14} /> 자료실에서 불러오기
                </button>
              </div>

              {materials.length > 0 && (
                <div className="space-y-2 mb-2">
                  {materials.map((mat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="bg-blue-100 p-1.5 rounded-md text-blue-600 shrink-0">
                          <LinkIcon size={12} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {mat.title}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">
                            {mat.url}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setMaterials(materials.filter((_, i) => i !== idx))
                        }
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                <FileText size={14} /> 상세 내용 / 메모
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="과제에 대한 상세한 설명이나 메모를 남겨주세요."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24 resize-none"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? "저장 중..." : "과제 부여하기"}
              </button>
            </div>
          </form>
        </div>

        {/* Library Picker Valid Overlay */}
        {isPickerOpen && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in fade-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900">자료실 선택</h3>
                <p className="text-xs text-gray-500">
                  추가할 자료를 선택해주세요.
                </p>
              </div>
              <button
                onClick={() => setIsPickerOpen(false)}
                type="button"
                className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-600 border border-gray-200 shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-gray-50/30">
              {isLoadingLibrary ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : libraryMaterials.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <FolderOpen size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-medium">등록된 자료가 없습니다.</p>
                  <p className="text-[10px] mt-1">
                    자료실 메뉴에서 자료를 먼저 등록해주세요.
                  </p>
                </div>
              ) : (
                libraryMaterials.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => toggleLibrarySelection(m.id)}
                    className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                      selectedFromLibrary.includes(m.id)
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        m.type === "pdf"
                          ? "bg-red-50 text-red-500"
                          : m.type === "image"
                            ? "bg-purple-50 text-purple-500"
                            : "bg-blue-50 text-blue-500"
                      }`}
                    >
                      {m.type === "pdf" ? (
                        <FileText size={18} />
                      ) : m.type === "image" ? (
                        <CheckCircle2 size={18} /> // Generic fallback or Image icon
                      ) : (
                        <LinkIcon size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {m.title}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {m.url}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedFromLibrary.includes(m.id)
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 text-transparent"
                      }`}
                    >
                      <CheckCircle2 size={14} strokeWidth={3} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-white">
              <button
                type="button"
                onClick={handleLibraryConfirm}
                disabled={selectedFromLibrary.length === 0}
                className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
              >
                {selectedFromLibrary.length > 0
                  ? `${selectedFromLibrary.length}개 자료 추가하기`
                  : "자료를 선택해주세요"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
