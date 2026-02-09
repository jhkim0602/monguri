"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { COLUMN_SERIES } from "@/constants/mentee/columns";
import Header from "@/components/mentee/layout/Header";
import {
  Bookmark,
  BookmarkCheck,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type ViewMode = "card" | "list";

type Column = {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  series_id: string;
  cover_image_url: string | null;
  created_at: string;
  author: {
    name: string;
  };
};

export default function ColumnsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [search, setSearch] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [bookmarksOnly, setBookmarksOnly] = useState(false);

  const [columns, setColumns] = useState<Column[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColumns();
    fetchBookmarks();
  }, []);

  const fetchColumns = async () => {
    try {
      const { data, error } = await supabase
        .from("columns")
        .select(`
          id,
          title,
          subtitle,
          slug,
          series_id,
          cover_image_url,
          created_at,
          author:author_id (
            name
          )
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match our needs (handling the join)
      const formattedData = data?.map(item => ({
        ...item,
        author: { name: (item.author as any)?.name || "정보 없음" }
      })) || [];

      setColumns(formattedData);
    } catch (error) {
      console.error("Error fetching columns:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("column_bookmarks")
        .select("column_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setBookmarkedIds(data?.map(b => b.column_id) || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const toggleBookmark = async (columnId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      if (bookmarkedIds.includes(columnId)) {
        // Remove bookmark
        const { error } = await supabase
          .from("column_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("column_id", columnId);

        if (error) throw error;
        setBookmarkedIds(prev => prev.filter(id => id !== columnId));
      } else {
        // Add bookmark
        const { error } = await supabase
          .from("column_bookmarks")
          .insert({ user_id: user.id, column_id: columnId });

        if (error) throw error;
        setBookmarkedIds(prev => [...prev, columnId]);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("북마크 처리에 실패했습니다.");
    }
  };

  const filteredArticles = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return columns.filter((article) => {
      if (seriesFilter !== "all" && article.series_id !== seriesFilter) return false;
      if (bookmarksOnly && !bookmarkedIds.includes(article.id)) return false;
      if (!normalized) return true;
      return (
        article.title.toLowerCase().includes(normalized) ||
        (article.subtitle && article.subtitle.toLowerCase().includes(normalized)) ||
        article.author.name.toLowerCase().includes(normalized)
      );
    });
  }, [columns, bookmarkedIds, bookmarksOnly, search, seriesFilter]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="서울대쌤 칼럼" variant="clean" />

      <section className="px-6 pt-6 space-y-5">
        <div className="space-y-2">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            SeolStudy Column
          </p>
          <h2 className="text-xl font-black text-gray-900">
            실전 루틴과 공부법을 모아봤어요
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="칼럼 제목, 시리즈, 작성자 검색"
            className="flex-1 text-sm font-medium text-gray-700 placeholder:text-gray-300 outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSeriesFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
              seriesFilter === "all"
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            전체
          </button>
          {COLUMN_SERIES.map((series) => (
            <button
              key={series.id}
              type="button"
              onClick={() => setSeriesFilter(series.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
                seriesFilter === series.id
                  ? `${series.themeClass} border-transparent`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {series.title}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setBookmarksOnly((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
              bookmarksOnly
                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            북마크
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400 font-bold">
            {filteredArticles.length}개 칼럼
          </span>
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "card" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"
              }`}
              aria-label="카드 보기"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-400"
              }`}
              aria-label="리스트 보기"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {loading ? (
             <div className="py-20 text-center text-sm font-bold text-gray-300">
             로딩 중...
           </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-16 text-center text-sm font-bold text-gray-300 bg-white rounded-3xl border border-dashed border-gray-200">
            조건에 맞는 칼럼이 없습니다.
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
            {filteredArticles.map((article) => {
              const isBookmarked = bookmarkedIds.includes(article.id);

              const card = (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
                  <div className="relative h-[150px] bg-gray-100">
                    {article.cover_image_url ? (
                        <img
                        src={article.cover_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                          src="/images/noImage.png"
                          alt="No Image"
                          className="w-full h-full object-cover"
                        />
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        toggleBookmark(article.id);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center"
                      aria-label="북마크"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck size={16} className="text-yellow-500" />
                      ) : (
                        <Bookmark size={16} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-black">
                        {article.author.name}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-gray-900 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-2">
                      {article.subtitle}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mt-auto">
                      <span>{format(new Date(article.created_at), "yyyy.MM.dd")}</span>
                    </div>
                  </div>
                </div>
              );

              return (
                <Link key={article.id} href={`/column/${article.slug}`}>
                  {card}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {filteredArticles.map((article) => {
              const isBookmarked = bookmarkedIds.includes(article.id);
              const row = (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="w-20 h-16 rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-100">
                     {article.cover_image_url ? (
                        <img
                        src={article.cover_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        />
                     ) : (
                        <img
                          src="/images/noImage.png"
                          alt="No Image"
                          className="w-full h-full object-cover"
                        />
                     )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-bold">
                        {article.author.name}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-gray-900 truncate">
                      {article.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {article.subtitle}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                      <span>{format(new Date(article.created_at), "yyyy.MM.dd")}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      toggleBookmark(article.id);
                    }}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
                    aria-label="북마크"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck size={16} className="text-yellow-500" />
                    ) : (
                      <Bookmark size={16} className="text-gray-400" />
                    )}
                  </button>
                </div>
              );

              return (
                <Link key={article.id} href={`/column/${article.slug}`}>
                  {row}
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
