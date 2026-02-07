"use client";

import { useEffect, useState } from "react";
import StudentsClient from "./StudentsClient";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function StudentsPage() {
  const [mentees, setMentees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("로그인이 필요합니다.");
          return;
        }

        const response = await fetch(
          `/api/mentor/students?mentorId=${encodeURIComponent(user.id)}`,
        );
        const result = await response.json();

        if (result.success) {
          setMentees(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Students Fetch Error:", err);
        setError("학생 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>{error}</p>
      </div>
    );
  }

  return <StudentsClient mentees={mentees} />;
}
