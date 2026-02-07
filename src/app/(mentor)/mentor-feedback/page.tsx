"use client";

import { Suspense, useEffect, useState } from "react";
import FeedbackClient from "./FeedbackClient";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function FeedbackPageContent() {
  const searchParams = useSearchParams();
  const taskId = searchParams?.get("taskId");

  const [mentorId, setMentorId] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("로그인이 필요합니다.");
          return;
        }

        setMentorId(user.id);

        const response = await fetch(
          `/api/mentor/feedback/pending?mentorId=${encodeURIComponent(user.id)}`,
        );
        const result = await response.json();

        if (result.success) {
          setItems(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Feedback Fetch Error:", err);
        setError("피드백 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingItems();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (error || !mentorId) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>{error || "로그인이 필요합니다."}</p>
      </div>
    );
  }

  return (
    <FeedbackClient
      mentorId={mentorId}
      initialItems={items}
      initialSelectedTaskId={taskId || undefined}
    />
  );
}

function FeedbackPageFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<FeedbackPageFallback />}>
      <FeedbackPageContent />
    </Suspense>
  );
}
