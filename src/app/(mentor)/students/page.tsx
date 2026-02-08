"use client";

import { useEffect, useState } from "react";
import StudentsClient from "./StudentsClient";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  readMentorStudentsCache,
  writeMentorStudentsCache,
} from "@/lib/mentorStudentsCache";

export default function StudentsPage() {
  const [mentees, setMentees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mentorId, setMentorId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
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
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!mentorId) return;

    const cached = readMentorStudentsCache(mentorId);
    if (cached) {
      setMentees(cached.data.mentees);
      setIsLoading(false);
      if (!cached.stale) {
        return () => {
          isMounted = false;
        };
      }
    }

    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `/api/mentor/students?mentorId=${encodeURIComponent(mentorId)}`,
        );
        const result = await response.json();

        if (!isMounted) return;

        if (result.success) {
          setMentees(result.data);
          writeMentorStudentsCache(mentorId, { mentees: result.data });
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Students Fetch Error:", err);
        if (isMounted) {
          setError("학생 목록을 불러오는데 실패했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStudents();

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

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>{error}</p>
      </div>
    );
  }

  return <StudentsClient mentees={mentees} />;
}
