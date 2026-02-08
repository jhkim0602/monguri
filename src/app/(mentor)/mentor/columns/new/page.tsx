"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Link from "next/link";
import ColumnBlockNoteEditor from "@/components/common/editor/BlockNoteEditor";
import { COLUMN_SERIES } from "@/constants/mentee/columns";

export default function NewColumnPage() {
  const router = useRouter();

  // State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Cover image upload handler
  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `cover-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("column-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("column-images").getPublicUrl(filePath);

      setCoverImageUrl(publicUrl);
    } catch (error) {
      console.error("Error uploading cover image:", error);
      alert("커버 이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  // Submit handler
  const handleSubmit = async (status: "draft" | "published") => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!seriesId) {
      alert("시리즈를 선택해주세요.");
      return;
    }

    if (status === "draft") {
      setSaving(true);
    } else {
      setPublishing(true);
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Generate slug from title
      const slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 100);

      const columnData = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        slug,
        content,
        cover_image_url: coverImageUrl || null,
        series_id: seriesId || null,
        author_id: userData.user.id,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from("columns")
        .insert(columnData)
        .select()
        .single();

      if (error) throw error;

      alert(status === "draft" ? "임시저장되었습니다." : "게시되었습니다.");
      router.push("/mentor/columns");
    } catch (error) {
      console.error("Error creating column:", error);
      alert("칼럼 생성 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Premium Floating Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <Link
              href="/mentor/columns"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">칼럼 목록</span>
            </Link>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSubmit("draft")}
                disabled={saving || publishing}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
              >
                {saving ? "저장 중..." : "임시저장"}
              </button>
              <button
                onClick={() => handleSubmit("published")}
                disabled={publishing || saving || !title.trim()}
                className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                게시하기
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Hero Title Input */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full text-5xl font-black text-gray-900 placeholder-gray-300 bg-transparent border-none outline-none focus:ring-0 px-0 tracking-tight"
            style={{ lineHeight: "1.1", letterSpacing: "-0.02em" }}
          />

          {/* Subtitle Input */}
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="부제목을 입력하세요 (선택사항)"
            className="w-full text-xl text-gray-500 placeholder-gray-300 bg-transparent border-none outline-none focus:ring-0 px-0 font-normal"
            style={{ lineHeight: "1.6" }}
          />

          {/* Metadata Bar */}
          <div className="flex items-center gap-6 py-4 border-y border-gray-100">
            {/* Series Selection - REQUIRED */}
            <div className="flex items-center gap-3 flex-1">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                시리즈 <span className="text-red-500">*</span>
              </span>
              <select
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="flex-1 text-sm px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">시리즈 선택 (필수)</option>
                {COLUMN_SERIES.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover Image Upload */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                커버 이미지
              </span>
              <label className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {coverImageUrl ? "변경" : "업로드"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Cover Image Preview */}
          {coverImageUrl && (
            <div className="relative group">
              <img
                src={coverImageUrl}
                alt="Cover"
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
              <button
                onClick={() => setCoverImageUrl("")}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* BlockNote Editor */}
          <div className="mt-8">
            <ColumnBlockNoteEditor
              initialContent={content}
              onChange={setContent}
            />
          </div>

          {/* Bottom Spacer */}
          <div className="h-32" />
        </div>
      </main>

      {/* Floating Help Tip */}
      <div className="fixed bottom-8 right-8 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-gray-200 max-w-xs opacity-75 hover:opacity-100 transition-opacity">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">💡 Tip:</span> Type{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-600 font-mono">
            /
          </code>{" "}
          for commands,{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-pink-600 font-mono">
            #
          </code>{" "}
          for headings
        </p>
      </div>
    </div>
  );
}
