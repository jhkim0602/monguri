import { supabaseServer } from "@/lib/supabaseServer";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MentorRecentChatRow = {
  id: string;
  mentee: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
  chat_messages:
    | {
        id: string;
        body: string | null;
        created_at: string;
        sender_id: string;
        message_type:
          | "text"
          | "image"
          | "file"
          | "meeting_request"
          | "system"
          | "meeting_scheduled";
      }[]
    | null;
};

export type ChatQueryClient = Pick<SupabaseClient<any, any, any>, "from">;

export async function getRecentChatsByMentorId(
  mentorId: string,
  limit = 5,
  queryClient: ChatQueryClient = supabaseServer,
) {
  const { data: pairs, error } = await queryClient
    .from("mentor_mentee")
    .select(
      `
      id,
      mentee:profiles!mentor_mentee_mentee_id_fkey(
        id,
        name,
        avatar_url
      )
    `,
    )
    .eq("mentor_id", mentorId)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (pairs ?? []) as unknown as MentorRecentChatRow[];
  if (rows.length === 0) return [];

  const pairIds = rows.map((row) => row.id);
  const { data: messages, error: msgError } = await queryClient
    .from("chat_messages")
    .select("id, body, created_at, sender_id, message_type, mentor_mentee_id")
    .in("mentor_mentee_id", pairIds)
    .order("created_at", { ascending: false })
    .limit(Math.max(50, pairIds.length * 20));

  if (msgError) {
    throw new Error(msgError.message);
  }

  const latestMessageByPairId = new Map<
    string,
    {
      id: string;
      body: string | null;
      created_at: string;
      sender_id: string;
      message_type:
        | "text"
        | "image"
        | "file"
        | "meeting_request"
        | "system"
        | "meeting_scheduled";
    }
  >();

  (messages ?? []).forEach((msg: any) => {
    const pairId = String(msg.mentor_mentee_id ?? "");
    if (!pairId || latestMessageByPairId.has(pairId)) return;

    latestMessageByPairId.set(pairId, {
      id: msg.id,
      body: msg.body ?? null,
      created_at: msg.created_at,
      sender_id: msg.sender_id,
      message_type: msg.message_type,
    });
  });

  return rows.map((row) => {
    const latest = latestMessageByPairId.get(row.id);
    return {
      ...row,
      chat_messages: latest ? [latest] : [],
    };
  });
}
