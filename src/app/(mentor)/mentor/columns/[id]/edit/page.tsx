"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Link from "next/link";
import ColumnBlockNoteEditor from "@/components/common/editor/BlockNoteEditor";
import { COLUMN_SERIES } from "@/constants/mentee/columns";

export default function EditColumnPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [seriesId, setSeriesId] = useState(COLUMN_SERIES[0].id);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  // Image State
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchColumn = async () => {
      try {
        const { data, error } = await supabase
          .from("columns")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Column not found");

        setTitle(data.title);
        setSubtitle(data.subtitle || "");
        setSeriesId(data.series_id || COLUMN_SERIES[0].id);
        setContent(data.content || "");
        setStatus(data.status as "draft" | "published");
        setExistingCoverUrl(data.cover_image_url);
        setCoverPreview(data.cover_image_url);
      } catch (error) {
        console.error("Error fetching column:", error);
        alert("칼럼 정보를 불러오는데 실패했습니다.");
        router.push("/mentor/columns");
      } finally {
        setLoading(false);
      }
    };

    fetchColumn();
  }, [params.id, router]);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (newStatus?: "draft" | "published") => {
    if (!title) return alert("제목을 입력해주세요.");

    setSaving(true);
    try {
      let finalCoverUrl = existingCoverUrl;

      if (coverImage) {
        const fileExt = coverImage.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("column-images")
          .upload(filePath, coverImage);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("column-images")
          .getPublicUrl(filePath);

        finalCoverUrl = publicUrlData.publicUrl;
      }

      const targetStatus = newStatus || status;

      const updateData: any = {
        title,
        subtitle,
        series_id: seriesId,
        content,
        cover_image_url: finalCoverUrl,
        status: targetStatus,
        updated_at: new Date().toISOString(),
      };

      // Only update published_at if it's being published for the first time or re-published
      if (targetStatus === "published" && status !== "published") {
          updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("columns")
        .update(updateData)
        .eq("id", params.id);

      if (error) throw error;

      alert("저장되었습니다.");
      router.push("/mentor/columns");
    } catch (error) {
      console.error("Error updating column:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
      return <div className="p-20 text-center text-gray-500">로딩 중...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center justify-between sticky top-0 bg-gray-50/80 backdrop-blur-md z-20 py-4 border-b border-gray-200 -mx-8 px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/mentor/columns"
            className="p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900">칼럼 수정</h1>
            <span className="text-xs text-gray-500 font-medium">최종 수정: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {status === 'published' ? (
                 <button
                 onClick={() => handleSubmit("draft")}
                 disabled={saving}
                 className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm"
               >
                 임시저장으로 전환
               </button>
            ) : (
                <button
                onClick={() => handleSubmit("draft")}
                disabled={saving}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                임시저장
              </button>
            )}

          <button
            onClick={() => handleSubmit("published")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 text-sm"
          >
            <Save size={16} />
            {status === 'published' ? '수정사항 게시' : '게시하기'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="칼럼 제목을 입력하세요"
              className="w-full text-2xl font-black placeholder:text-gray-300 border-none bg-transparent outline-none focus:ring-0 px-0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">부제목</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="부제목을 입력하세요 (선택)"
              className="w-full text-lg font-medium text-gray-600 placeholder:text-gray-300 border-none bg-transparent outline-none focus:ring-0 px-0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">내용</label>
            <ColumnBlockNoteEditor
              initialContent={content}
              onChange={setContent}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">설정</h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">시리즈</label>
              <select
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
              >
                {COLUMN_SERIES.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">
                커버 이미지
              </label>
              <div
                className={`relative w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer group ${
                  coverPreview ? "border-solid border-gray-100" : ""
                }`}
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center space-y-1">
                    <Upload className="w-6 h-6 text-gray-300 mx-auto group-hover:text-gray-400 transition-colors" />
                    <span className="text-xs text-gray-400 font-medium">
                      이미지 업로드
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
