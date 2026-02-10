"use client";

import { useEffect, useState } from "react";
import DashboardClient from "./DashboardClient";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
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

    const fetchDashboardData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          throw new Error("Unauthorized.");
        }

        const dashboardResponse = await fetch(`/api/mentor/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await dashboardResponse.json();

        if (result.success) {
          if (!isMounted) return;
          setData(result.data);
        } else {
          if (!isMounted) return;
          setError(result.error);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        if (isMounted) {
          setError("데이터를 불러오는데 실패했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();

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

  if (error || !data) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>{error || "데이터가 없습니다."}</p>
      </div>
    );
  }

  return (
    <DashboardClient
      mentorName={data.mentorName}
      mentorId={mentorId}
      mentees={data.mentees}
      recentActivity={data.recentActivity}
      recentChats={data.recentChats}
      recentFeedback={data.recentFeedback}
      upcomingMeetings={data.upcomingMeetings}
      stats={data.stats}
    />
  );
}
