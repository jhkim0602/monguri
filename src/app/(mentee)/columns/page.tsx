"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { COLUMN_ARTICLES, COLUMN_SERIES } from "@/constants/mentee/columns";
import Header from "@/components/mentee/layout/Header";
import {
  Bookmark,
  BookmarkCheck,
  LayoutGrid,
  List,
  Search,
} from "lucide-react";

type ViewMode = "card" | "list";

const BOOKMARKS_KEY = "column-bookmarks";

export default function ColumnsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [search, setSearch] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setBookmarks(parsed);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const filteredArticles = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return COLUMN_ARTICLES.filter((article) => {
      if (seriesFilter !== "all" && article.seriesId !== seriesFilter) return false;
      if (bookmarksOnly && !bookmarks.includes(article.slug)) return false;
      if (!normalized) return true;
      return (
        article.title.toLowerCase().includes(normalized) ||
        article.subtitle.toLowerCase().includes(normalized) ||
        article.excerpt.toLowerCase().includes(normalized) ||
        article.author.toLowerCase().includes(normalized)
      );
    });
  }, [bookmarks, bookmarksOnly, search, seriesFilter]);

  const toggleBookmark = (slug: string) => {
    setBookmarks((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug],
    );
  };

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

        {filteredArticles.length === 0 ? (
          <div className="py-16 text-center text-sm font-bold text-gray-300 bg-white rounded-3xl border border-dashed border-gray-200">
            조건에 맞는 칼럼이 없습니다.
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
            {filteredArticles.map((article) => {
              const isBookmarked = bookmarks.includes(article.slug);
              const series = COLUMN_SERIES.find((s) => s.id === article.seriesId);
              const card = (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all h-full flex flex-col">
                  <div className="relative h-[150px]">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className={`w-full h-full object-cover ${
                        article.status !== "published" ? "grayscale" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        toggleBookmark(article.slug);
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
                        {article.author}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-gray-900 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold mt-auto">
                      <span>{article.date}</span>
                    </div>
                    {article.status !== "published" && (
                      <div className="text-[10px] font-black text-gray-300">
                        준비 중
                      </div>
                    )}
                  </div>
                </div>
              );

              return article.status === "published" ? (
                <Link key={article.slug} href={`/column/${article.slug}`}>
                  {card}
                </Link>
              ) : (
                <div key={article.slug} className="opacity-70">
                  {card}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 pb-6">
            {filteredArticles.map((article) => {
              const isBookmarked = bookmarks.includes(article.slug);
              const series = COLUMN_SERIES.find((s) => s.id === article.seriesId);
              const row = (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all">
                  <div className="w-20 h-16 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className={`w-full h-full object-cover ${
                        article.status !== "published" ? "grayscale" : ""
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-bold">
                        {article.author}
                      </span>
                    </div>
                    <h3 className="text-sm font-black text-gray-900 truncate">
                      {article.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                      <span>{article.date}</span>
                      {article.status !== "published" && (
                        <>
                          <span>·</span>
                          <span className="text-gray-300">준비 중</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      toggleBookmark(article.slug);
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

              return article.status === "published" ? (
                <Link key={article.slug} href={`/column/${article.slug}`}>
                  {row}
                </Link>
              ) : (
                <div key={article.slug} className="opacity-70">
                  {row}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
