"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import ColumnViewer from "@/components/common/viewer/ColumnViewer";

type ColumnDetail = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  cover_image_url: string | null;
  created_at: string;
  author: {
    name: string;
  };
};

export default function ColumnDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [article, setArticle] = useState<ColumnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // Decode the slug to handle URL-encoded Korean characters
        const decodedSlug = decodeURIComponent(params.slug);

        // Fetch article data
        const { data, error } = await supabase
          .from("columns")
          .select(`
            id,
            title,
            subtitle,
            content,
            cover_image_url,
            created_at,
            author:author_id (
              name
            )
          `)
          .eq("slug", decodedSlug)
          .eq("status", "published")
          .single();

        if (error) throw error;
        if (!data) return notFound();

        setArticle({
            ...data,
            author: { name: (data.author as any)?.name || "정보 없음" }
        });

      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.slug]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <span className="text-gray-400 font-bold">로딩 중...</span>
        </div>
    );
  }

  if (!article) return notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-8 pb-6">
        <Link
          href="/columns"
          className="text-sm text-gray-400 flex items-center gap-1 mb-5"
        >
          <ArrowLeft size={16} /> 목록으로
        </Link>
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            [설스터디] 서울대쌤 칼럼
          </span>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="text-sm text-gray-500 font-medium">
                {article.subtitle}
            </p>
          )}
          <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold">
            <span>{article.author.name}</span>
            <span>·</span>
            <span>{format(new Date(article.created_at), "yyyy. MM. dd")}</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-16 space-y-8">
        {article.cover_image_url && (
          <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white">
            <img
              src={article.cover_image_url}
              alt="칼럼 이미지"
              className="w-full h-[220px] object-cover"
            />
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <ColumnViewer content={article.content} />
        </div>
      </div>
    </div>
  );
}
