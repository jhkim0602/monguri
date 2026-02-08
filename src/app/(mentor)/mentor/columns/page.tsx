"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit3, Trash2, Eye, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type Column = {
  id: string;
  title: string;
  subtitle: string | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  published_at: string | null;
  slug: string;
};

export default function MentorColumnsPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchColumns = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("columns")
        .select("*")
        .eq("author_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setColumns(data || []);
    } catch (error) {
      console.error("Error fetching columns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("정말 이 칼럼을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("columns").delete().eq("id", id);
      if (error) throw error;
      setColumns((prev) => prev.filter((col) => col.id !== id));
    } catch (error) {
      console.error("Error deleting column:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  const filteredColumns = columns.filter((col) =>
    col.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">칼럼 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            작성한 칼럼을 조회하고 관리합니다.
          </p>
        </div>
        <Link
          href="/mentor/columns/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
        >
          <Plus size={16} />새 칼럼 작성
        </Link>
      </header>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm max-w-md">
        <Search size={16} className="text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="칼럼 제목 검색"
          className="flex-1 text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">로딩 중...</div>
      ) : filteredColumns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <FileText size={20} />
          </div>
          <h3 className="text-gray-900 font-bold">작성된 칼럼이 없습니다</h3>
          <p className="text-sm text-gray-500">
            첫 번째 칼럼을 작성하여 멘티들에게 지식을 공유해보세요.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3 w-[40px]">#</th>
                <th className="px-6 py-3">제목</th>
                <th className="px-6 py-3 w-[120px]">상태</th>
                <th className="px-6 py-3 w-[150px]">작성일</th>
                <th className="px-6 py-3 w-[120px] text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredColumns.map((col, index) => (
                <tr key={col.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-400">
                    {filteredColumns.length - index}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/mentor/columns/${col.id}/edit`}
                      className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 block max-w-md"
                    >
                      {col.title}
                    </Link>
                    {col.subtitle && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {col.subtitle}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        col.status === "published"
                          ? "bg-green-100 text-green-700"
                          : col.status === "draft"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {col.status === "published"
                        ? "게시됨"
                        : col.status === "draft"
                        ? "임시저장"
                        : "보관됨"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(col.created_at), "yyyy. MM. dd", {
                      locale: ko,
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {/* Preview Link (only if published, ideally via simplified Mentee route) */}
                       {col.status === 'published' && (
                           <Link
                            href={`/column/${col.slug}`}
                            target="_blank"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="보기"
                           >
                            <Eye size={16}/>
                           </Link>
                       )}
                      <Link
                        href={`/mentor/columns/${col.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(col.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
