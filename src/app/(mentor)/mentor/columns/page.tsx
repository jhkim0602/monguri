"use client";

import { useState } from "react";
import { useMentorStore } from "@/features/mentor/context/MentorStoreProvider";
import { MOCK_COLUMN_SERIES } from "@/features/mentor/data/mock";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=1200&q=80";

export default function MentorColumnsPage() {
  const { store, createColumnDraft, publishColumn } = useMentorStore();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("서울대 멘토");
  const [content, setContent] = useState("");

  const handleCreate = () => {
    if (!title || !seriesId) return;
    createColumnDraft({
      title,
      subtitle,
      seriesId,
      author,
      coverImage: DEFAULT_COVER,
      excerpt,
      content,
    });
    setTitle("");
    setSubtitle("");
    setExcerpt("");
    setContent("");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          SeolStudy Column
        </p>
        <h1 className="text-2xl font-bold text-gray-900">칼럼 작성</h1>
        <p className="text-sm text-gray-500">
          칼럼 초안을 작성하고 멘티에게 발행합니다.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">새 칼럼 작성</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500">
                제목
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="칼럼 제목을 입력하세요"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">
                부제
              </label>
              <input
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="부제목"
                className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">
                시리즈
              </label>
              <select
                value={seriesId}
                onChange={(event) => setSeriesId(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">시리즈 선택</option>
                {MOCK_COLUMN_SERIES.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">
                작성자
              </label>
              <input
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">
                요약
              </label>
              <textarea
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                placeholder="간단 요약을 작성하세요"
                rows={3}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">
                본문
              </label>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="칼럼 본문을 작성하세요"
                rows={6}
                className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="w-full rounded-2xl bg-gray-900 py-2 text-sm font-semibold text-white"
            >
              초안 저장
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">발행 목록</h2>
          <div className="mt-4 space-y-3">
            {store.columns.map((article) => (
              <div
                key={article.id}
                className="rounded-2xl border border-gray-100 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {article.author} · {article.date}
                    </p>
                  </div>
                  {article.status === "draft" ? (
                    <button
                      type="button"
                      onClick={() => publishColumn(article.id)}
                      className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-600"
                    >
                      발행
                    </button>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {article.excerpt}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-500">
                  {article.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
