"use client";

import { Suspense, useEffect, useState } from "react";
import FeedbackClient from "./FeedbackClient";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function FeedbackPageContent() {
  const searchParams = useSearchParams();
  const itemId = searchParams?.get("itemId");
  const taskId = searchParams?.get("taskId");

  const [mentorId, setMentorId] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (!user) {
          setError("로그인이 필요합니다.");
          setIsLoading(false);
          return;
        }

        setMentorId(user.id);
      } catch (err) {
        console.error("Feedback Fetch Error:", err);
        setError("피드백 목록을 불러오는데 실패했습니다.");
        setIsLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!mentorId) return;

    const fetchPendingItems = async () => {
      try {
        const response = await fetch(
          `/api/mentor/feedback/pending?mentorId=${encodeURIComponent(mentorId)}`,
        );
        const result = await response.json();

        if (!isMounted) return;

        if (result.success) {
          setItems(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Feedback Fetch Error:", err);
        if (isMounted) {
          setError("피드백 목록을 불러오는데 실패했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPendingItems();

    return () => {
      isMounted = false;
    };
  }, [mentorId]);

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
      initialSelectedItemId={
        itemId || (taskId ? `task-${taskId}` : undefined)
      }
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
