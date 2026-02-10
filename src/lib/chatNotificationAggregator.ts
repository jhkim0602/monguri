import type { SupabaseClient } from "@supabase/supabase-js";

const CHAT_NOTIFICATION_WINDOW_MS = 10 * 60 * 1000;

type ChatNotificationMessageType = "text" | "image" | "file";

type UpsertChatNotificationInput = {
  client: SupabaseClient<any, any, any>;
  recipientId: string;
  recipientRole: "mentor" | "mentee";
  mentorMenteeId: string;
  senderName: string;
  messagePreview: string;
  actionUrl: string;
  actorId?: string | null;
  avatarUrl?: string | null;
  refId?: string | null;
  messageType: ChatNotificationMessageType;
};

type RecentNotificationRow = {
  id: string;
  ref_id: string | null;
  meta: Record<string, unknown> | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const resolveBatchedCount = (meta: unknown) => {
  if (!isRecord(meta)) return 1;
  const raw = meta.batchedCount;
  if (typeof raw === "number" && Number.isFinite(raw) && raw >= 1) {
    return Math.floor(raw);
  }
  if (typeof raw === "string") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 1) return Math.floor(parsed);
  }
  return 1;
};

const buildChatTitle = (senderName: string, count: number) =>
  count > 1 ? `${senderName} 새 메시지 ${count}개` : `${senderName} 새 메시지`;

const buildChatMeta = (
  baseMeta: Record<string, unknown> | null,
  input: UpsertChatNotificationInput,
  batchedCount: number,
  nowIso: string,
) => ({
  ...(baseMeta ?? {}),
  mentorMenteeId: input.mentorMenteeId,
  messageType: input.messageType,
  batchedCount,
  lastMessageAt: nowIso,
  lastMessagePreview: input.messagePreview,
});

const insertChatNotification = async (
  input: UpsertChatNotificationInput,
  nowIso: string,
) =>
  input.client.from("notifications").insert({
    recipient_id: input.recipientId,
    recipient_role: input.recipientRole,
    type: "chat_message",
    ref_type: "chat_message",
    ref_id: input.refId ?? null,
    title: buildChatTitle(input.senderName, 1),
    message: input.messagePreview,
    action_url: input.actionUrl,
    actor_id: input.actorId ?? null,
    avatar_url: input.avatarUrl ?? null,
    meta: buildChatMeta(null, input, 1, nowIso),
  });

export async function upsertGroupedChatNotification(
  input: UpsertChatNotificationInput,
) {
  const now = new Date();
  const nowIso = now.toISOString();
  const windowStartIso = new Date(now.getTime() - CHAT_NOTIFICATION_WINDOW_MS).toISOString();

  const { data: existing, error: selectError } = await input.client
    .from("notifications")
    .select("id, ref_id, meta")
    .eq("recipient_id", input.recipientId)
    .eq("type", "chat_message")
    .contains("meta", { mentorMenteeId: input.mentorMenteeId })
    .is("read_at", null)
    .gte("created_at", windowStartIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selectError) {
    console.error("Failed to query grouped chat notification:", selectError);
    await insertChatNotification(input, nowIso);
    return;
  }

  if (!existing) {
    await insertChatNotification(input, nowIso);
    return;
  }

  const row = existing as RecentNotificationRow;
  const nextCount = resolveBatchedCount(row.meta) + 1;
  const mergedMeta = buildChatMeta(row.meta, input, nextCount, nowIso);
  const updatePayload = {
    ref_id: input.refId ?? row.ref_id ?? null,
    title: buildChatTitle(input.senderName, nextCount),
    message: input.messagePreview,
    action_url: input.actionUrl,
    actor_id: input.actorId ?? null,
    avatar_url: input.avatarUrl ?? null,
    meta: mergedMeta,
    read_at: null,
    created_at: nowIso,
  };

  const { error: updateError } = await input.client
    .from("notifications")
    .update(updatePayload)
    .eq("id", row.id);

  if (!updateError) return;

  const { created_at: _, ...fallbackPayload } = updatePayload;
  const { error: fallbackError } = await input.client
    .from("notifications")
    .update(fallbackPayload)
    .eq("id", row.id);

  if (!fallbackError) return;

  console.error("Failed to update grouped chat notification:", fallbackError);
  await insertChatNotification(input, nowIso);
}
