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

        const [dashboardResponse, clientChatsResult] = await Promise.all([
          fetch(`/api/mentor/dashboard?mentorId=${encodeURIComponent(user.id)}`),
          supabase
            .from("mentor_mentee")
            .select(
              "id, mentee:profiles!mentor_mentee_mentee_id_fkey(id, name, avatar_url), chat_messages(id, body, created_at, sender_id, message_type)",
            )
            .eq("mentor_id", user.id)
            .eq("status", "active")
            .order("started_at", { ascending: false })
            .order("created_at", {
              foreignTable: "chat_messages",
              ascending: false,
            })
            .limit(1, { foreignTable: "chat_messages" }),
        ]);

        const result = await dashboardResponse.json();

        const recentChatsFromClient = ((clientChatsResult.data ?? []) as any[])
          .map((pair) => {
            const menteeProfile = Array.isArray(pair.mentee)
              ? pair.mentee[0]
              : pair.mentee;
            const lastMessage = pair.chat_messages?.[0] as
              | {
                  body: string | null;
                  created_at: string;
                  message_type: "text" | "image" | "file";
                }
              | undefined;

            const preview = lastMessage
              ? lastMessage.body?.trim()
                ? lastMessage.body
                : lastMessage.message_type === "image"
                  ? "이미지를 전송했습니다."
                  : lastMessage.message_type === "file"
                    ? "파일을 전송했습니다."
                    : "메시지를 보냈습니다."
              : "대화 내역이 없습니다.";

            return {
              id: pair.id,
              menteeName: menteeProfile?.name || "멘티",
              menteeAvatarUrl: menteeProfile?.avatar_url || null,
              lastMessage: preview,
              lastMessageAt: lastMessage?.created_at || null,
              unreadCount: 0,
            };
          })
          .sort((a, b) => {
            const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return bTime - aTime;
          });

        if (result.success) {
          setData({
            ...result.data,
            recentChats:
              recentChatsFromClient.length > 0
                ? recentChatsFromClient
                : (result.data?.recentChats ?? []),
          });
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
      mentorName={data.mentorName}
      mentees={data.mentees}
      recentActivity={data.recentActivity}
      recentChats={data.recentChats}
      recentFeedback={data.recentFeedback}
      stats={data.stats}
    />
  );
}
