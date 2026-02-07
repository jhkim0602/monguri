"use client";

import { useEffect, useState } from "react";
import DashboardClient from "./DashboardClient";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError("로그인이 필요합니다.");
          return;
        }

        const response = await fetch(
          `/api/mentor/dashboard?mentorId=${encodeURIComponent(user.id)}`,
        );
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError("데이터를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      mentees={data.mentees}
      recentActivity={data.recentActivity}
      stats={data.stats}
    />
  );
}
