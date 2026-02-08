import { supabaseServer } from "@/lib/supabaseServer";

export type NotificationInsert = {
  recipientId: string;
  recipientRole: "mentor" | "mentee" | "admin";
  type: string;
  refType?: string | null;
  refId?: string | null;
  title: string;
  message: string;
  actionUrl?: string | null;
  actorId?: string | null;
  avatarUrl?: string | null;
  meta?: Record<string, any> | null;
};

export async function createNotification(input: NotificationInsert) {
  const { data, error } = await supabaseServer
    .from("notifications")
    .insert({
      recipient_id: input.recipientId,
      recipient_role: input.recipientRole,
      type: input.type,
      ref_type: input.refType ?? null,
      ref_id: input.refId ?? null,
      title: input.title,
      message: input.message,
      action_url: input.actionUrl ?? null,
      actor_id: input.actorId ?? null,
      avatar_url: input.avatarUrl ?? null,
      meta: input.meta ?? {},
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
