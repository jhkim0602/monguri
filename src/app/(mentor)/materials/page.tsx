"use client";

import { useState, useEffect } from "react";
import {
  FolderOpen,
  Plus,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type MentorMaterialItem = {
  id: string;
  mentor_id: string | null;
  title: string;
  type: "link" | "pdf" | "image";
  url: string | null;
  file_id: string | null;
  accessUrl?: string | null;
  created_at: string;
  file?: {
    id: string;
    bucket: string;
    path: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    created_at: string;
    deleted_at: string | null;
  } | null;
};

export default function MaterialsPage() {
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<MentorMaterialItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async (activeMentorId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/mentor/materials?mentorId=${encodeURIComponent(activeMentorId)}`,
      );
      const json = await res.json();
      if (json.success && json.data) {
        setMaterials(json.data as MentorMaterialItem[]);
      }
    } catch (e) {
      console.error("Failed to fetch materials", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      setMentorId(user.id);
      await fetchData(user.id);
    };

    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!mentorId) return;
    if (!confirm("이 자료를 삭제하시겠습니까?")) return;

    // Optimistic update
    setMaterials((prev) => prev.filter((m) => m.id !== id));

    try {
      await fetch(
        `/api/mentor/materials?id=${id}&mentorId=${encodeURIComponent(mentorId)}`,
        { method: "DELETE" },
      );
      fetchData(mentorId); // Sync
    } catch (e) {
      alert("삭제 실패");
      fetchData(mentorId); // Revert
    }
  };

  const filteredMaterials = materials.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenMaterial = async (material: MentorMaterialItem) => {
    if (material.type === "link") {
      if (material.url) {
        window.open(material.url, "_blank", "noopener,noreferrer");
      }
      return;
    }

    if (!material.file_id) {
      alert("파일 정보를 찾을 수 없습니다.");
      return;
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const res = await fetch(`/api/files/${material.file_id}?mode=preview`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("파일을 열 수 없습니다.");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <div className="p-8 space-y-8 min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 mb-2">
            <FolderOpen className="text-blue-600" />
            학습 자료실
          </h1>
          <p className="text-gray-500 font-medium">
            학생들에게 배포할 학습 자료를 관리하세요.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          <Plus size={20} />
          자료 추가
        </button>
      </div>

      {/* Search & Stats */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 px-4">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="자료명 검색..."
            className="flex-1 bg-transparent font-medium border-none outline-none text-gray-900 placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 text-sm font-bold text-gray-500">
          총 <span className="text-blue-600">{filteredMaterials.length}</span>개
        </div>
      </div>

      {/* List View */}
      <div className="space-y-3">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  material.type === "pdf"
                    ? "bg-red-50 text-red-500"
                    : material.type === "image"
                      ? "bg-purple-50 text-purple-500"
                      : "bg-blue-50 text-blue-500"
                }`}
              >
                {material.type === "pdf" ? (
                  <FileText size={20} />
                ) : material.type === "image" ? (
                  <ImageIcon size={20} />
                ) : (
                  <LinkIcon size={20} />
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate mb-0.5">
                  {material.title}
                </h3>
                <button
                  onClick={() => handleOpenMaterial(material)}
                  className="text-xs text-gray-400 hover:text-blue-500 transition-colors truncate flex items-center gap-1 max-w-md"
                >
                  <span className="truncate">
                    {material.type === "link"
                      ? material.url ?? "링크 없음"
                      : material.file?.original_name ?? "첨부 파일"}
                  </span>
                  <ExternalLink size={10} className="shrink-0" />
                </button>
              </div>
            </div>

            {/* Meta & Actions */}
            <div className="flex items-center gap-6 pl-4">
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap hidden sm:block">
                {new Date(material.created_at).toLocaleDateString()}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md whitespace-nowrap ${
                  material.type === "pdf"
                    ? "bg-red-50 text-red-600"
                    : material.type === "image"
                      ? "bg-purple-50 text-purple-600"
                      : "bg-blue-50 text-blue-600"
                }`}
              >
                {material.type}
              </span>
              <button
                onClick={() => handleDelete(material.id)}
                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!isLoading && filteredMaterials.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            <FolderOpen size={48} className="mb-4 opacity-50" />
            <p className="font-medium">등록된 자료가 없습니다.</p>
            <p className="text-sm">
              우측 상단의 버튼을 눌러 첫 번째 자료를 추가해보세요.
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AddMaterialModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mentorId={mentorId}
        onSuccess={() => mentorId && fetchData(mentorId)}
      />
    </div>
  );
}

function AddMaterialModal({
  isOpen,
  onClose,
  mentorId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string | null;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<"link" | "pdf" | "image">("link");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const bucketName = "materials";

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let uploadedFileMeta:
      | {
          bucket: string;
          path: string;
          originalName: string;
          mimeType: string;
          sizeBytes: number;
        }
      | null = null;

    try {
      if (!mentorId) {
        alert("로그인이 필요합니다.");
        return;
      }

      // Handle File Upload
      if (type !== "link" && file) {
        setUploadProgress("파일 업로드 중...");
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${type}s/${fileName}`; // e.g. pdfs/123.pdf

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        uploadedFileMeta = {
          bucket: bucketName,
          path: filePath,
          originalName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        };
      } else if (type !== "link" && !file) {
        alert("파일을 선택해주세요.");
        setIsSubmitting(false);
        setUploadProgress("");
        return;
      }

      setUploadProgress("정보 저장 중...");
      if (type !== "link" && !uploadedFileMeta) {
        throw new Error("파일 업로드 정보를 찾을 수 없습니다.");
      }

      const payload =
        type === "link"
          ? { mentorId, title, type, url }
          : { mentorId, title, type, file: uploadedFileMeta ?? undefined };

      const response = await fetch("/api/mentor/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const res = await response.json();

      if (res.success) {
        onSuccess();
        onClose();
        setTitle("");
        setUrl("");
        setFile(null);
        setType("link");
      } else {
        alert(res.error);
      }
    } catch (error: any) {
      console.error("Upload/Save Error:", error);
      alert(
        "업로드 또는 저장 중 오류가 발생했습니다: " +
          (error.message || "Unknown error"),
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">
              자료 추가하기
            </h2>
            <p className="text-gray-500 font-medium text-sm mt-1">
              학생들에게 공유할 새로운 학습 자료를 등록합니다.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
            <FolderOpen size={24} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type Selection - Hero Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block ml-1">
              자료 유형 선택
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(["link", "pdf", "image"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setUrl("");
                    setFile(null);
                  }}
                  className={`relative group flex flex-col items-center justify-center gap-3 py-6 rounded-2xl border-2 transition-all duration-300 ${
                    type === t
                      ? "border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-100 scale-[1.02]"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      type === t
                        ? t === "pdf"
                          ? "bg-red-100 text-red-600"
                          : t === "image"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm"
                    }`}
                  >
                    {t === "pdf" ? (
                      <FileText size={20} strokeWidth={2.5} />
                    ) : t === "image" ? (
                      <ImageIcon size={20} strokeWidth={2.5} />
                    ) : (
                      <LinkIcon size={20} strokeWidth={2.5} />
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold transition-colors ${
                      type === t
                        ? "text-gray-900"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  >
                    {t === "pdf"
                      ? "PDF 문서"
                      : t === "image"
                        ? "이미지"
                        : "웹 링크"}
                  </span>

                  {type === t && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm animate-in zoom-in spin-in-90 duration-300">
                      <Plus size={12} strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 block ml-1">
                자료 제목
              </label>
              <input
                required
                type="text"
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-base font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="자료의 제목을 입력하세요"
              />
            </div>

            {type === "link" ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 block ml-1">
                  웹사이트 URL
                </label>
                <div className="relative">
                  <input
                    required
                    type="url"
                    className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm font-mono"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                    <LinkIcon size={18} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 block ml-1">
                  {type === "pdf" ? "PDF 파일 업로드" : "이미지 파일 업로드"}
                </label>
                <div className="relative group">
                  <input
                    required={type !== "link"}
                    type="file"
                    accept={type === "pdf" ? ".pdf" : "image/*"}
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setFile(e.target.files[0]);
                    }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-white group-hover:bg-gray-50 group-hover:border-blue-400 transition-all"
                  >
                    {file ? (
                      <div className="text-center">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle2 size={20} />
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <div className="mx-auto mb-2 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full group-hover:scale-110 transition-transform">
                          {type === "pdf" ? (
                            <FileText size={20} />
                          ) : (
                            <ImageIcon size={20} />
                          )}
                        </div>
                        <p className="text-sm font-bold">
                          <span className="text-blue-500">클릭하여 업로드</span>{" "}
                          하세요
                        </p>
                        <p className="text-xs mt-1">
                          또는 파일을 여기로 드래그하세요
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all text-sm"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <span className="animate-pulse">
                  {uploadProgress || "저장 중..."}
                </span>
              ) : (
                <>
                  <Plus size={18} strokeWidth={3} />
                  자료 등록하기
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
