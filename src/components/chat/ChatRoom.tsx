"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const ATTACHMENT_BUCKET = "chat-attachments";

type ChatAttachment = {
  id: string;
  message_id: string;
  bucket: string;
  path: string;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  signed_url?: string | null;
};

type ChatMessage = {
  id: string;
  mentor_mentee_id: string;
  sender_id: string;
  body: string | null;
  message_type: "text" | "image" | "file";
  created_at: string;
  chat_attachments?: ChatAttachment[];
};

type ChatRoomProps = {
  mentorMenteeId: string;
  currentUserId?: string;
};

export default function ChatRoom({ mentorMenteeId, currentUserId }: ChatRoomProps) {
  const [userId, setUserId] = useState<string | null>(currentUserId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (currentUserId) return;

    let isMounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      setUserId(data.user?.id ?? null);
    });

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  const hydrateAttachments = useCallback(async (list: ChatAttachment[]) => {
    const hydrated = await Promise.all(
      list.map(async (attachment) => {
        const { data, error } = await supabase.storage
          .from(ATTACHMENT_BUCKET)
          .createSignedUrl(attachment.path, 60 * 5);

        if (error || !data?.signedUrl) {
          return { ...attachment, signed_url: null };
        }

        return { ...attachment, signed_url: data.signedUrl };
      })
    );

    return hydrated;
  }, []);

  const normalizeMessage = useCallback(
    async (raw: ChatMessage) => {
      if (!raw.chat_attachments || raw.chat_attachments.length === 0) {
        return raw;
      }

      const hydrated = await hydrateAttachments(raw.chat_attachments);
      return { ...raw, chat_attachments: hydrated };
    },
    [hydrateAttachments]
  );

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select(
        "id, mentor_mentee_id, sender_id, body, message_type, created_at, chat_attachments(id, message_id, bucket, path, mime_type, size_bytes, width, height)"
      )
      .eq("mentor_mentee_id", mentorMenteeId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error || !data) {
      return;
    }

    const normalized = await Promise.all(data.map(normalizeMessage));
    setMessages(normalized);
  }, [mentorMenteeId, normalizeMessage]);

  const fetchMessageById = useCallback(
    async (messageId: string) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(
          "id, mentor_mentee_id, sender_id, body, message_type, created_at, chat_attachments(id, message_id, bucket, path, mime_type, size_bytes, width, height)"
        )
        .eq("id", messageId)
        .single();

      if (error || !data) {
        return null;
      }

      return normalizeMessage(data);
    },
    [normalizeMessage]
  );

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`chat:${mentorMenteeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `mentor_mentee_id=eq.${mentorMenteeId}`
        },
        async (payload) => {
          const messageId = payload.new.id as string;
          const fullMessage = await fetchMessageById(messageId);

          if (!fullMessage) return;

          setMessages((prev) => {
            if (prev.some((item) => item.id === fullMessage.id)) {
              return prev;
            }
            return [...prev, fullMessage].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentorMenteeId, loadMessages, fetchMessageById]);

  const canSend = useMemo(() => text.trim().length > 0 && !isSending, [text, isSending]);

  const handleSendText = async () => {
    if (!userId || !canSend) return;

    setIsSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      mentor_mentee_id: mentorMenteeId,
      sender_id: userId,
      body: text.trim(),
      message_type: "text"
    });

    if (!error) {
      setText("");
    }

    setIsSending(false);
  };

  const handleSendFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !userId) return;

    setIsSending(true);

    const fileArray = Array.from(files);
    const messageType = fileArray.every((file) => file.type.startsWith("image/"))
      ? "image"
      : "file";

    const { data: message, error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        mentor_mentee_id: mentorMenteeId,
        sender_id: userId,
        body: messageType === "file" ? "파일을 전송했습니다." : null,
        message_type: messageType
      })
      .select("id")
      .single();

    if (messageError || !message) {
      setIsSending(false);
      return;
    }

    for (const file of fileArray) {
      const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const fileName = `${crypto.randomUUID()}.${extension}`;
      const path = `mentor_mentee/${mentorMenteeId}/${message.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(ATTACHMENT_BUCKET)
        .upload(path, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        continue;
      }

      await supabase.from("chat_attachments").insert({
        message_id: message.id,
        bucket: ATTACHMENT_BUCKET,
        path,
        mime_type: file.type,
        size_bytes: file.size
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsSending(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 bg-white">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400">아직 메시지가 없습니다.</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className="text-sm">
            <div className="text-xs text-gray-400">
              {message.sender_id === userId ? "나" : "상대"} · {new Date(message.created_at).toLocaleString()}
            </div>
            {message.body && <p className="text-gray-900 mt-1">{message.body}</p>}
            {message.chat_attachments?.length ? (
              <div className="mt-2 flex flex-col gap-2">
                {message.chat_attachments.map((attachment) => (
                  <div key={attachment.id} className="text-xs text-gray-600">
                    {attachment.signed_url ? (
                      attachment.mime_type?.startsWith("image/") ? (
                        <img
                          src={attachment.signed_url}
                          alt="attachment"
                          className="max-w-[240px] rounded-lg border border-gray-200"
                        />
                      ) : (
                        <a
                          className="underline text-blue-600"
                          href={attachment.signed_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          파일 다운로드
                        </a>
                      )
                    ) : (
                      <span>첨부 파일</span>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="w-full min-h-[100px] rounded-2xl border border-gray-200 p-3 text-sm"
          placeholder="메시지를 입력하세요"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSendText}
            disabled={!canSend}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            텍스트 전송
          </button>
          <label className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
            파일/이미지 선택
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={(event) => handleSendFiles(event.target.files)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
