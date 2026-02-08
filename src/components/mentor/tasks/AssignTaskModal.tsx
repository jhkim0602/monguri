"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X,
  Calendar,
  Clock3,
  AlertCircle,
  FolderOpen,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { useModal } from "@/contexts/ModalContext";
import { supabase } from "@/lib/supabaseClient";

type MentorMaterialOption = {
  id: string;
  title: string;
  type: "link" | "pdf" | "image";
  url: string | null;
  file_id: string | null;
  accessUrl?: string | null;
  created_at: string;
  file?: {
    original_name: string;
  } | null;
};

type DirectUploadItem = {
  id: string;
  file: File;
  type: "pdf" | "image";
};

type WeaknessSolutionOption = {
  id: string;
  title: string;
  subjectId: string | null;
  subjectName: string | null;
  materialId: string | null;
  materialTitle: string | null;
};

const MATERIAL_TYPE_META: Record<
  MentorMaterialOption["type"],
  {
    label: string;
    icon: typeof FileText;
    iconClassName: string;
    badgeClassName: string;
    chipClassName: string;
  }
> = {
  pdf: {
    label: "PDF",
    icon: FileText,
    iconClassName: "bg-red-50 text-red-600",
    badgeClassName: "bg-red-50 text-red-700 border border-red-200",
    chipClassName: "bg-red-50 text-red-700 border border-red-200",
  },
  image: {
    label: "이미지",
    icon: ImageIcon,
    iconClassName: "bg-violet-50 text-violet-600",
    badgeClassName: "bg-violet-50 text-violet-700 border border-violet-200",
    chipClassName: "bg-violet-50 text-violet-700 border border-violet-200",
  },
  link: {
    label: "링크",
    icon: LinkIcon,
    iconClassName: "bg-sky-50 text-sky-600",
    badgeClassName: "bg-sky-50 text-sky-700 border border-sky-200",
    chipClassName: "bg-sky-50 text-sky-700 border border-sky-200",
  },
};

function getMaterialHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "외부 링크";
  }
}

function formatMaterialDate(date: string) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function AssignTaskModal({
  isOpen,
  onClose,
  mentorId,
  studentName,
  menteeId,
}: {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string;
  studentName: string;
  menteeId: string;
}) {
  const { openModal } = useModal();
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [libraryMaterials, setLibraryMaterials] = useState<MentorMaterialOption[]>(
    [],
  );
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isMaterialsLoading, setIsMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  const [weaknessSolutions, setWeaknessSolutions] = useState<
    WeaknessSolutionOption[]
  >([]);
  const [selectedSolutionId, setSelectedSolutionId] = useState("");
  const [isSolutionsLoading, setIsSolutionsLoading] = useState(false);
  const [solutionsError, setSolutionsError] = useState<string | null>(null);

  const [directUploads, setDirectUploads] = useState<DirectUploadItem[]>([]);
  const [uploadingDirectFiles, setUploadingDirectFiles] = useState(false);
  const [directUploadError, setDirectUploadError] = useState<string | null>(null);

  // Form State
  const [subject, setSubject] = useState("국어");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("23:59");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSolutions = useCallback(async () => {
    setIsSolutionsLoading(true);
    setSolutionsError(null);

    try {
      const response = await fetch(
        `/api/mentor/weakness-solutions?mentorId=${encodeURIComponent(mentorId)}`,
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "솔루션을 불러오지 못했습니다.");
      }

      const items = (result.data?.solutions ?? []) as WeaknessSolutionOption[];
      setWeaknessSolutions(items);
    } catch (error) {
      console.error(error);
      setSolutionsError("과목별 솔루션을 불러오지 못했습니다.");
    } finally {
      setIsSolutionsLoading(false);
    }
  }, [mentorId]);

  const resetForm = () => {
    setSubject("국어");
    setTitle("");
    setDescription("");
    setDeadline("");
    setDeadlineTime("23:59");
    setSelectedMaterialIds([]);
    setLibraryMaterials([]);
    setIsLibraryOpen(false);
    setMaterialsError(null);
    setSelectedSolutionId("");
    setDirectUploads([]);
    setDirectUploadError(null);
    setUploadingDirectFiles(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      loadSolutions();
    } else {
      setIsLibraryOpen(false);
      setIsSubmitting(false);
    }
  }, [isOpen, loadSolutions]);

  useEffect(() => {
    setSelectedSolutionId("");
  }, [subject]);

  const selectedMaterials = useMemo(() => {
    const byId = new Map(libraryMaterials.map((m) => [m.id, m]));
    return selectedMaterialIds
      .map((id) => byId.get(id))
      .filter(Boolean) as MentorMaterialOption[];
  }, [libraryMaterials, selectedMaterialIds]);

  const filteredSolutions = useMemo(() => {
    return weaknessSolutions.filter(
      (solution) => solution.subjectName === subject,
    );
  }, [weaknessSolutions, subject]);

  const handleDirectUploadChange = (files: FileList | null) => {
    if (!files) return;
    const nextItems: DirectUploadItem[] = [];
    const rejected: string[] = [];

    Array.from(files).forEach((file) => {
      const lowerType = (file.type || "").toLowerCase();
      const lowerName = file.name.toLowerCase();
      const isPdf =
        lowerType === "application/pdf" || lowerName.endsWith(".pdf");
      const isImage = lowerType.startsWith("image/");

      if (!isPdf && !isImage) {
        rejected.push(file.name);
        return;
      }

      nextItems.push({
        id: crypto.randomUUID(),
        file,
        type: isPdf ? "pdf" : "image",
      });
    });

    if (rejected.length > 0) {
      setDirectUploadError(
        `PDF 또는 이미지 파일만 업로드할 수 있습니다: ${rejected.join(", ")}`,
      );
    } else {
      setDirectUploadError(null);
    }

    if (nextItems.length > 0) {
      setDirectUploads((prev) => [...prev, ...nextItems]);
    }
  };

  const loadMaterials = async () => {
    setIsMaterialsLoading(true);
    setMaterialsError(null);

    try {
      const response = await fetch(
        `/api/mentor/materials?mentorId=${encodeURIComponent(mentorId)}`,
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "자료를 불러오지 못했습니다.");
      }

      const items = (result.data ?? []) as MentorMaterialOption[];
      setLibraryMaterials(items);
      setSelectedMaterialIds((prev) =>
        prev.filter((id) => items.some((item) => item.id === id)),
      );
    } catch (error) {
      console.error(error);
      setMaterialsError("자료실 목록을 불러오지 못했습니다.");
    } finally {
      setIsMaterialsLoading(false);
    }
  };

  const handleAttachFromLibrary = async () => {
    setIsLibraryOpen(true);
    await loadMaterials();
  };

  const handleSelectResource = (materialId: string) => {
    setSelectedMaterialIds((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId],
    );
  };

  const applySolutionMaterial = async (solution: WeaknessSolutionOption) => {
    if (!solution.materialId) return;

    if (!libraryMaterials.some((item) => item.id === solution.materialId)) {
      await loadMaterials();
    }

    setSelectedMaterialIds((prev) =>
      prev.includes(solution.materialId!)
        ? prev
        : [solution.materialId!, ...prev],
    );
  };

  const handleSubmit = async () => {
    if (!title || !deadline) {
      alert("제목과 마감일은 필수입니다.");
      return;
    }

    const mergedDeadline = new Date(`${deadline}T${deadlineTime || "23:59"}:00`);
    if (Number.isNaN(mergedDeadline.getTime())) {
      alert("마감일/시간 형식이 올바르지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    setUploadingDirectFiles(false);
    try {
      if (selectedMaterials.some((m) => m.type !== "link" && !m.file_id)) {
        alert(
          "자료실 파일 정보가 누락되었습니다. 자료실을 새로고침 후 다시 선택해주세요.",
        );
        return;
      }

      const libraryMaterialsPayload = selectedMaterials.map((material) =>
        material.type === "link"
          ? {
            title: material.title,
            type: "link",
            url: material.url,
            sourceMaterialId: material.id,
          }
          : {
            title: material.title,
            type: material.type,
            fileId: material.file_id,
            sourceMaterialId: material.id,
          },
      );

      let directUploadPayload: {
        title: string;
        type: "pdf" | "image";
        file: {
          bucket: string;
          path: string;
          originalName: string;
          mimeType: string;
          sizeBytes: number;
        };
      }[] = [];

      if (directUploads.length > 0) {
        if (!mentorId) {
          alert("로그인이 필요합니다.");
          return;
        }

        setUploadingDirectFiles(true);
        directUploadPayload = [];

        for (const upload of directUploads) {
          const fileExt = upload.file.name.split(".").pop() || "bin";
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `task-uploads/${mentorId}/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from("materials")
            .upload(filePath, upload.file, {
              contentType: upload.file.type || "application/octet-stream",
              upsert: false,
            });

          if (uploadError) {
            throw uploadError;
          }

          directUploadPayload.push({
            title: upload.file.name,
            type: upload.type,
            file: {
              bucket: "materials",
              path: filePath,
              originalName: upload.file.name,
              mimeType: upload.file.type || "application/octet-stream",
              sizeBytes: upload.file.size,
            },
          });
        }
      }

      const response = await fetch("/api/mentor/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId,
          menteeId,
          title,
          description,
          subject,
          deadline: mergedDeadline.toISOString(),
          materials: [...libraryMaterialsPayload, ...directUploadPayload],
        }),
      });

      if (response.ok) {
        onClose();
        openModal({
          title: "과제 부여 완료",
          content: `✅ ${studentName} 학생에게 새 과제가 전송되었습니다.`,
          type: "success",
        });
        // Reset form
        setTitle("");
        setDescription("");
        setSelectedMaterialIds([]);
        setDirectUploads([]);
        setDirectUploadError(null);
        setDeadline("");
        setDeadlineTime("23:59");
      } else {
        const res = await response.json();
        alert(res.error || "과제 전송 실패");
      }
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    } finally {
      setUploadingDirectFiles(false);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Resource Selection Overlay
  if (isLibraryOpen) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsLibraryOpen(false)}
        />
        <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FolderOpen size={20} className="text-blue-600" /> 자료 선택
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
                  onClick={loadMaterials}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  다시 시도
                </button>
              </div>
            )}

            {!isMaterialsLoading &&
              !materialsError &&
              libraryMaterials.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-500 font-medium">
                  자료실에 등록된 자료가 없습니다.
                </div>
              )}

            {!isMaterialsLoading &&
              !materialsError &&
              libraryMaterials.map((material) => {
                const isSelected = selectedMaterialIds.includes(material.id);
                const typeMeta = MATERIAL_TYPE_META[material.type];
                const TypeIcon = typeMeta.icon;
                const materialUrl = material.accessUrl ?? material.url;
                const host = materialUrl ? getMaterialHost(materialUrl) : "파일";
                const createdAtLabel = formatMaterialDate(material.created_at);

                return (
                  <div
                    key={material.id}
                    onClick={() => handleSelectResource(material.id)}
                    className={`flex items-center justify-between p-3.5 mb-2 rounded-xl border transition-all cursor-pointer ${isSelected
                      ? "bg-blue-50/80 border-blue-300 ring-1 ring-blue-200 shadow-sm"
                      : "bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeMeta.iconClassName}`}
                      >
                        <TypeIcon size={17} />
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-gray-300 bg-white"
                          }`}
                      >
                        {isSelected && <CheckCircle2 size={12} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                            {material.title}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${typeMeta.badgeClassName}`}
                          >
                            {typeMeta.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 truncate">
                          {host}
                          {createdAtLabel ? ` • ${createdAtLabel}` : ""}
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
              className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg"
            >
              선택 완료 ({selectedMaterialIds.length})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">
            새 과제 부여 ({studentName})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              과목
            </label>
            <div className="flex gap-2">
              {["국어", "수학", "영어", "탐구"].map((subj) => (
                <button
                  key={subj}
                  onClick={() => setSubject(subj)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${subject === subj
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {subj}
                </button>
              ))}
            </div>
          </div>

          {/* 솔루션 선택 UI */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              과목별 솔루션
            </label>
            <div className="relative">
              <select
                value={selectedSolutionId}
                onChange={async (event) => {
                  const nextId = event.target.value;
                  setSelectedSolutionId(nextId);
                  const selected = filteredSolutions.find(
                    (solution) => solution.id === nextId,
                  );
                  if (selected) {
                    await applySolutionMaterial(selected);
                  }
                }}
                disabled={isSolutionsLoading || filteredSolutions.length === 0}
                className={`w-full px-4 py-2 border border-gray-200 rounded-xl outline-none appearance-none text-sm font-medium ${
                  isSolutionsLoading || filteredSolutions.length === 0
                    ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700"
                }`}
              >
                <option value="">
                  {isSolutionsLoading
                    ? "솔루션 불러오는 중..."
                    : filteredSolutions.length === 0
                      ? "해당 과목 솔루션 없음"
                      : "솔루션을 선택하세요"}
                </option>
                {filteredSolutions.map((solution) => (
                  <option key={solution.id} value={solution.id}>
                    {solution.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {solutionsError && (
              <p className="text-xs text-red-500 font-semibold mt-2">
                {solutionsError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              과제 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              placeholder="예: 수능특강 3강 문제풀이"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              상세 내용
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium min-h-[100px] resize-none"
              placeholder="학생에게 전달할 구체적인 지시사항을 입력하세요."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              학습 자료 (Resource Library)
            </label>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAttachFromLibrary}
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <FolderOpen size={16} />
                </div>
                <span className="text-sm font-bold">
                  자료실에서 파일 가져오기
                </span>
              </button>

              {selectedMaterials.length > 0 && (
                <div className="max-h-44 overflow-y-auto pr-1 space-y-2">
                  {selectedMaterials.map((material) => {
                    const typeMeta = MATERIAL_TYPE_META[material.type];
                    const TypeIcon = typeMeta.icon;

                    return (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${typeMeta.iconClassName}`}
                          >
                            <TypeIcon size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {material.title}
                            </p>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${typeMeta.chipClassName}`}
                            >
                              {typeMeta.label}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setSelectedMaterialIds((prev) =>
                              prev.filter((id) => id !== material.id),
                            )
                          }
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              직접 업로드 (PDF/이미지)
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="direct-task-upload"
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-bold text-gray-500 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-600 transition-all cursor-pointer"
                >
                  <Upload size={16} />
                  파일 선택하기
                </label>
                <input
                  id="direct-task-upload"
                  type="file"
                  accept="application/pdf,image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    handleDirectUploadChange(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
              </div>

              {directUploadError && (
                <p className="text-xs text-red-500 font-semibold">
                  {directUploadError}
                </p>
              )}

              {directUploads.length > 0 && (
                <div className="space-y-2">
                  {directUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {upload.type === "pdf" ? (
                          <FileText size={14} className="text-red-500" />
                        ) : (
                          <ImageIcon size={14} className="text-purple-500" />
                        )}
                        <span className="truncate text-gray-700 font-medium">
                          {upload.file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDirectUploads((prev) =>
                            prev.filter((item) => item.id !== upload.id),
                          )
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadingDirectFiles && (
                <div className="text-xs text-blue-500 font-semibold flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  파일 업로드 중...
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                마감일
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-bold text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                마감 시간
              </label>
              <div className="relative">
                <Clock3
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="time"
                  step={300}
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-bold text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              과제를 부여하면 학생의 플래너에 즉시 반영되며, 알림이 전송됩니다.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:bg-gray-400"
          >
            {isSubmitting ? "전송 중..." : "과제 전송하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
