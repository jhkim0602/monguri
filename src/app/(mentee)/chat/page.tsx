"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, Plus, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const ATTACHMENT_BUCKET = "chat-attachments";

type MentorProfile = {
  id: string;
  name: string | null;
  avatar_url: string | null;
};

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

export default function ChatPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [mentorMenteeId, setMentorMenteeId] = useState<string | null>(null);
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id ?? null;

      if (!uid) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setUserId(uid);
      }

      const { data: pair } = await supabase
        .from("mentor_mentee")
        .select(
          "id, mentor:profiles!mentor_mentee_mentor_id_fkey(id, name, avatar_url)"
        )
        .eq("mentee_id", uid)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (isMounted) {
        const mentorProfile = Array.isArray(pair?.mentor)
          ? pair.mentor[0]
          : pair?.mentor;
        setMentorMenteeId(pair?.id ?? null);
        setMentor(mentorProfile ?? null);
        setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

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
    if (!mentorMenteeId) return;

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
    if (!mentorMenteeId) return;

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
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_attachments"
        },
        async (payload) => {
          const rawAttachment = payload.new as ChatAttachment;
          const { data, error } = await supabase.storage
            .from(ATTACHMENT_BUCKET)
            .createSignedUrl(rawAttachment.path, 60 * 5);

          const hydrated: ChatAttachment = {
            ...rawAttachment,
            signed_url: error ? null : data?.signedUrl ?? null
          };

          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== hydrated.message_id) return message;

              const nextAttachments = message.chat_attachments ?? [];
              if (nextAttachments.some((item) => item.id === hydrated.id)) {
                return message;
              }

              return {
                ...message,
                chat_attachments: [...nextAttachments, hydrated]
              };
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentorMenteeId, loadMessages, fetchMessageById]);

  useEffect(() => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !userId || !mentorMenteeId || isSending) return;

    setIsSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      mentor_mentee_id: mentorMenteeId,
      sender_id: userId,
      body: inputValue.trim(),
      message_type: "text"
    });

    if (!error) {
      setInputValue("");
    }

    setIsSending(false);
  };

  const handleSendFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !userId || !mentorMenteeId || isSending) return;

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

  const dateLabel = (messages[messages.length - 1]?.created_at
    ? new Date(messages[messages.length - 1].created_at)
    : new Date()
  ).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="bg-[#F2F2F7] h-full flex flex-col overflow-hidden">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-4 pt-10 pb-4 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-primary hover:bg-gray-100 rounded-full transition-colors active:scale-90"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>

          <div className="flex flex-col items-center">
            <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
              {mentor?.name ?? "멘토"}
            </h2>
            <span className="text-[11px] text-gray-500 font-semibold">
              {mentorMenteeId ? "연결됨" : "연결 대기"}
            </span>
          </div>

          <div className="w-10" />
        </div>
      </header>

      <div className="flex-1 min-h-0 px-4 pt-4 pb-8 space-y-4 overflow-y-auto">
        <div className="text-center pb-3">
          <span className="bg-gray-200/50 text-gray-500 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-white">
            {dateLabel}
          </span>
        </div>

        {isLoading && (
          <p className="text-center text-sm text-gray-400">채팅을 불러오는 중...</p>
        )}

        {!isLoading && !mentorMenteeId && (
          <p className="text-center text-sm text-gray-400">연결된 멘토가 없습니다.</p>
        )}

        {messages.length === 0 && mentorMenteeId && !isLoading && (
          <p className="text-center text-sm text-gray-400">아직 메시지가 없습니다.</p>
        )}

        {messages.map((msg) => {
          const isMentee = msg.sender_id === userId;
          const timeLabel = new Date(msg.created_at).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <div
              key={msg.id}
              className={`flex ${isMentee ? "justify-end" : "justify-start"} items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {!isMentee && (
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm border border-white mb-1 bg-gray-200">
                  {mentor?.avatar_url ? (
                    <img
                      src={mentor.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              )}

              <div
                className={`max-w-[75%] px-4 py-3 rounded-[20px] shadow-sm text-[14px] font-bold leading-relaxed tracking-tight flex flex-col gap-2
                  ${isMentee
                    ? "bg-primary text-white rounded-br-none shadow-blue-100"
                    : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                  }`}
              >
                {msg.body && <span>{msg.body}</span>}
                {msg.chat_attachments?.length ? (
                  <div className="flex flex-col gap-2">
                    {msg.chat_attachments.map((attachment) => {
                      if (attachment.signed_url && attachment.mime_type?.startsWith("image/")) {
                        return (
                          <img
                            key={attachment.id}
                            src={attachment.signed_url}
                            alt="attachment"
                            className="max-w-[220px] rounded-xl border border-white/40"
                          />
                        );
                      }

                      return (
                        <a
                          key={attachment.id}
                          href={attachment.signed_url ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[12px] underline"
                        >
                          파일 다운로드
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <span className="text-[10px] text-gray-400 font-bold mb-1 shrink-0">
                {timeLabel}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-all active:scale-90"
            disabled={!mentorMenteeId || isSending}
          >
            <Plus size={24} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            onChange={(event) => handleSendFiles(event.target.files)}
          />

          <div className="flex-1">
            <input
              type="text"
              placeholder="메시지 입력..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-[22px] px-5 py-3.5 text-[15px] font-bold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
              disabled={!mentorMenteeId || isSending}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !mentorMenteeId || isSending}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90
              ${inputValue.trim() && mentorMenteeId && !isSending
                ? "bg-primary text-white shadow-lg shadow-blue-200"
                : "bg-gray-100 text-gray-300"
              }`}
          >
            <Send size={20} fill={inputValue.trim() ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}
