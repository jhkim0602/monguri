"use client";

import { useEffect, useState } from "react";
import StudentDetailClient from "./StudentDetailClient";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
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
          `/api/mentor/students/${params.id}?mentorId=${encodeURIComponent(user.id)}`,
        );
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Student Detail Fetch Error:", err);
        setError("학생 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (error || !data || !mentorId) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>{error || "데이터가 없습니다."}</p>
      </div>
    );
  }

  return (
    <StudentDetailClient
      mentorId={mentorId}
      student={data.student}
      initialTasks={data.tasks || []}
      initialDailyRecords={data.dailyRecords || []}
      initialDailyEvents={data.events || []}
    />
  );
}
