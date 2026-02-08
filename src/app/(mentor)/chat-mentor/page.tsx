"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  useCallback,
} from "react";
import { Input } from "@/components/ui";
import {
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Sparkles,
  Paperclip,
  Smile,
  CheckCheck,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import MentorMeetingRequestCard from "@/components/mentor/chat/MentorMeetingRequestCard";
import MeetingConfirmedMessage from "@/components/common/chat/MeetingConfirmedMessage";
import {
  getCachedSignedUrl,
  readMentorChatCache,
  setCachedSignedUrl,
  writeMentorChatCache,
} from "@/lib/mentorChatCache";

const ATTACHMENT_BUCKET = "chat-attachments";

const bodyFont = { className: "font-sans" };
const headingFont = { className: "font-sans" };

const SUBJECT_META = {
  math: {
    label: "수학",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    avatar: "from-emerald-500/90 to-emerald-700",
  },
  english: {
    label: "영어",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    avatar: "from-amber-500/90 to-amber-700",
  },
  korean: {
    label: "국어",
    badge: "bg-sky-50 text-sky-700 border-sky-100",
    avatar: "from-sky-500/90 to-sky-700",
  },
};

type SubjectKey = keyof typeof SUBJECT_META;

type Student = {
  id: string;
  menteeId: string;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  subject: SubjectKey;
  level: string;
  online: boolean;
  avatarUrl: string | null;
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
  message_type: "text" | "image" | "file" | "meeting_request" | "system";
  created_at: string;
  chat_attachments?: ChatAttachment[];
};

const QUICK_REPLIES = [
  "핵심 개념 3줄 요약 부탁해요.",
  "풀이 과정을 단계별로 적어줘.",
  "오답 원인을 한 문장으로 정리해봐.",
  "다음 목표를 같이 정해보자.",
];

const formatPreviewTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
};

const getFallbackMessage = (message: ChatMessage) => {
  if (message.body) return message.body;
  if (message.message_type === "image") return "이미지를 전송했습니다.";
  if (message.message_type === "meeting_request") return "미팅 신청이 도착했습니다.";
  return "파일을 전송했습니다.";
};

export default function MentorChatPage() {
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const loadingPairsRef = useRef<Set<string>>(new Set());
  const activePairIdRef = useRef<string | null>(null);
  const messagesPairIdRef = useRef<string | null>(null);
  const loadSeqRef = useRef(0);
  const pendingScrollAdjustRef = useRef<{
    prevScrollHeight: number;
    prevScrollTop: number;
  } | null>(null);
  const shouldScrollToBottomRef = useRef(true);
  const PAGE_SIZE = 50;

  const debugLog = useCallback((...args: unknown[]) => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("debugChat") !== "1") return;
    console.log("[mentor-chat]", ...args);
  }, []);

  const persistCache = useCallback(
    (nextMessages: ChatMessage[]) => {
      if (!selectedStudentId) return;
      writeMentorChatCache(selectedStudentId, { messages: nextMessages });
    },
    [selectedStudentId]
  );

  const markChatNotificationsRead = useCallback(
    async (pairId: string, recipientId: string) => {
      const timestamp = new Date().toISOString();
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: timestamp })
        .eq("recipient_id", recipientId)
        .eq("type", "chat_message")
        .contains("meta", { mentorMenteeId: pairId })
        .is("read_at", null);

      if (error) {
        console.error("Failed to mark chat notifications as read:", error);
      }
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      const { data } = await supabase.auth.getUser();
      const uid = data?.user?.id ?? null;

      if (!uid) {
        if (isMounted) setIsLoading(false);
        return;
      }

      if (isMounted) setMentorId(uid);

      const { data: pairs, error } = await supabase
        .from("mentor_mentee")
        .select(
          "id, mentee:profiles!mentor_mentee_mentee_id_fkey(id, name, avatar_url), chat_messages(id, body, created_at, sender_id, message_type)"
        )
        .eq("mentor_id", uid)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .order("created_at", { foreignTable: "chat_messages", ascending: false })
        .limit(1, { foreignTable: "chat_messages" });

      if (error) {
        if (isMounted) setIsLoading(false);
        return;
      }

      const nextStudents: Student[] = (pairs ?? []).map((pair) => {
        const menteeProfile = Array.isArray(pair.mentee)
          ? pair.mentee[0]
          : pair.mentee;
        const lastMessage = pair.chat_messages?.[0] as
          | {
              body: string | null;
              created_at: string;
              sender_id: string;
              message_type: "text" | "image" | "file" | "meeting_request" | "system";
            }
          | undefined;

        const lastMsgText = lastMessage
          ? lastMessage.body ??
            (lastMessage.message_type === "image"
              ? "이미지를 전송했습니다."
              : lastMessage.message_type === "meeting_request"
              ? "미팅 신청이 도착했습니다."
              : lastMessage.message_type === "system"
              ? "시스템 메시지"
              : "파일을 전송했습니다.")
          : "대화 없음";

        return {
          id: pair.id,
          menteeId: menteeProfile?.id ?? "",
          name: menteeProfile?.name ?? "멘티",
          lastMsg: lastMsgText,
          time: formatPreviewTime(lastMessage?.created_at),
          unread: 0,
          subject: "math",
          level: "멘티",
          online: false,
          avatarUrl: menteeProfile?.avatar_url ?? null,
        };
      });

      if (isMounted) {
        setStudents(nextStudents);
        if (!selectedStudentId && nextStudents[0]) {
          setSelectedStudentId(nextStudents[0].id);
        }
        setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mentorId || !selectedStudentId) return;
    debugLog("markChatNotificationsRead", { selectedStudentId, mentorId });
    markChatNotificationsRead(selectedStudentId, mentorId);
  }, [mentorId, selectedStudentId, markChatNotificationsRead, debugLog]);

  useEffect(() => {
    activePairIdRef.current = selectedStudentId;
    debugLog("activePairIdRef set", selectedStudentId);
  }, [selectedStudentId, debugLog]);

  const fetchSignedUrl = useCallback(async (path: string) => {
    const cached = getCachedSignedUrl(path);
    if (cached !== undefined) return cached;

    const { data, error } = await supabase.storage
      .from(ATTACHMENT_BUCKET)
      .createSignedUrl(path, 60 * 5);

    const signedUrl = error ? null : data?.signedUrl ?? null;
    setCachedSignedUrl(path, signedUrl);
    return signedUrl;
  }, []);

  const hydrateAttachments = useCallback(
    async (list: ChatAttachment[]) => {
      const hydrated = await Promise.all(
        list.map(async (attachment) => {
          const cached = getCachedSignedUrl(attachment.path);
          if (cached !== undefined) {
            return { ...attachment, signed_url: cached };
          }
          const signedUrl = await fetchSignedUrl(attachment.path);
          return { ...attachment, signed_url: signedUrl };
        })
      );

      return hydrated;
    },
    [fetchSignedUrl]
  );

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

  const fetchMessagesPage = useCallback(
    async (cursor?: string | null) => {
      if (!selectedStudentId) return null;

      let query = supabase
        .from("chat_messages")
        .select(
          "id, mentor_mentee_id, sender_id, body, message_type, created_at, chat_attachments(id, message_id, bucket, path, mime_type, size_bytes, width, height)"
        )
        .eq("mentor_mentee_id", selectedStudentId)
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (cursor) {
        query = query.lt("created_at", cursor);
      }

      const { data, error } = await query;

      if (error || !data) return null;

      const normalized = await Promise.all(data.map(normalizeMessage));
      return {
        items: normalized.reverse(),
        rawCount: data.length,
      };
    },
    [selectedStudentId, normalizeMessage]
  );

  const loadMessages = useCallback(async () => {
    if (!selectedStudentId) return;
    const pairId = selectedStudentId;
    const loadId = ++loadSeqRef.current;
    debugLog("loadMessages:start", { loadId, pairId });

    const cached = readMentorChatCache<{ messages: ChatMessage[] }>(
      selectedStudentId
    );
    if (cached?.data?.messages?.length) {
      messagesPairIdRef.current = pairId;
      debugLog("loadMessages:cache", {
        loadId,
        pairId,
        count: cached.data.messages.length,
        stale: cached.stale,
      });
      setMessages(cached.data.messages);
      setHasMore(cached.data.messages.length >= PAGE_SIZE);
      if (!cached.stale) {
        debugLog("loadMessages:cache-hit", { loadId, pairId });
        return;
      }
    }

    if (loadingPairsRef.current.has(pairId)) {
      debugLog("loadMessages:skip-inflight", { loadId, pairId });
      return;
    }
    loadingPairsRef.current.add(pairId);

    const page = await fetchMessagesPage();
    if (!page) {
      loadingPairsRef.current.delete(pairId);
      debugLog("loadMessages:empty", { loadId, pairId });
      return;
    }
    if (activePairIdRef.current !== pairId) {
      loadingPairsRef.current.delete(pairId);
      debugLog("loadMessages:aborted", {
        loadId,
        pairId,
        active: activePairIdRef.current,
      });
      return;
    }

    messagesPairIdRef.current = pairId;
    debugLog("loadMessages:apply", {
      loadId,
      pairId,
      count: page.items.length,
    });
    setMessages(page.items);
    setHasMore(page.rawCount >= PAGE_SIZE);
    persistCache(page.items);
    shouldScrollToBottomRef.current = true;
    loadingPairsRef.current.delete(pairId);
  }, [selectedStudentId, fetchMessagesPage, persistCache, debugLog]);

  const loadOlderMessages = useCallback(async () => {
    if (!selectedStudentId || !hasMore || isLoadingMore) return;
    const pairId = selectedStudentId;
    const oldest = messages[0];
    if (!oldest?.created_at) return;
    const loadId = ++loadSeqRef.current;
    debugLog("loadOlder:start", { loadId, pairId, oldest: oldest.created_at });

    setIsLoadingMore(true);
    if (chatScrollRef.current) {
      pendingScrollAdjustRef.current = {
        prevScrollHeight: chatScrollRef.current.scrollHeight,
        prevScrollTop: chatScrollRef.current.scrollTop,
      };
    }

    const page = await fetchMessagesPage(oldest.created_at);
    if (!page || page.items.length === 0) {
      setHasMore(false);
      setIsLoadingMore(false);
      debugLog("loadOlder:empty", { loadId, pairId });
      return;
    }
    if (activePairIdRef.current !== pairId) {
      setIsLoadingMore(false);
      debugLog("loadOlder:aborted", {
        loadId,
        pairId,
        active: activePairIdRef.current,
      });
      return;
    }

    messagesPairIdRef.current = pairId;
    debugLog("loadOlder:apply", {
      loadId,
      pairId,
      count: page.items.length,
    });
    setMessages((prev) => [...page.items, ...prev]);
    setHasMore(page.rawCount >= PAGE_SIZE);
    setIsLoadingMore(false);
  }, [
    selectedStudentId,
    hasMore,
    isLoadingMore,
    messages,
    fetchMessagesPage,
    debugLog,
  ]);

  useEffect(() => {
    if (!selectedStudentId) return;
    debugLog("selectStudentEffect", selectedStudentId);

    setMessages([]);
    setHasMore(true);
    shouldScrollToBottomRef.current = true;
    loadMessages();

    const channel = supabase
      .channel(`mentor-chat:${selectedStudentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `mentor_mentee_id=eq.${selectedStudentId}`,
        },
        async (payload) => {
          const fullMessage = payload.new as ChatMessage;
          debugLog("realtime:message", {
            pair: fullMessage.mentor_mentee_id,
            sender: fullMessage.sender_id,
            id: fullMessage.id,
          });
          if (chatScrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } =
              chatScrollRef.current;
            const isNearBottom =
              scrollHeight - (scrollTop + clientHeight) < 160;
            shouldScrollToBottomRef.current = isNearBottom;
          } else {
            shouldScrollToBottomRef.current = true;
          }

          setMessages((prev) => {
            if (prev.some((item) => item.id === fullMessage.id)) {
              return prev;
            }
            messagesPairIdRef.current = selectedStudentId;
            return [...prev, fullMessage].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            );
          });

          setStudents((prev) =>
            prev.map((student) => {
              if (student.id !== fullMessage.mentor_mentee_id) return student;
              return {
                ...student,
                lastMsg: getFallbackMessage(fullMessage),
                time: formatPreviewTime(fullMessage.created_at),
                unread: student.id === selectedStudentId ? 0 : student.unread + 1,
              };
            })
          );

          if (
            mentorId &&
            fullMessage.sender_id !== mentorId &&
            fullMessage.mentor_mentee_id === selectedStudentId
          ) {
            debugLog("realtime:markRead", {
              pair: selectedStudentId,
              mentorId,
            });
            await markChatNotificationsRead(selectedStudentId, mentorId);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_attachments",
        },
        async (payload) => {
          const rawAttachment = payload.new as ChatAttachment;
          if (!messageIdsRef.current.has(rawAttachment.message_id)) {
            return;
          }

          const signedUrl = await fetchSignedUrl(rawAttachment.path);
          const hydrated: ChatAttachment = {
            ...rawAttachment,
            signed_url: signedUrl,
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
                chat_attachments: [...nextAttachments, hydrated],
              };
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    selectedStudentId,
    mentorId,
    loadMessages,
    fetchSignedUrl,
    markChatNotificationsRead,
    debugLog,
  ]);

  useEffect(() => {
    if (!chatScrollRef.current) return;
    const container = chatScrollRef.current;
    if (!container) return;

    if (pendingScrollAdjustRef.current) {
      const { prevScrollHeight, prevScrollTop } = pendingScrollAdjustRef.current;
      const nextScrollHeight = container.scrollHeight;
      container.scrollTop =
        nextScrollHeight - prevScrollHeight + prevScrollTop;
      pendingScrollAdjustRef.current = null;
      return;
    }

    if (shouldScrollToBottomRef.current) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      shouldScrollToBottomRef.current = false;
    }
  }, [messages, selectedStudentId]);

  const updateScrollState = useCallback(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollToBottom(distanceFromBottom > 800);

    if (container.scrollTop <= 40 && hasMore && !isLoadingMore) {
      loadOlderMessages();
    }
  }, [hasMore, isLoadingMore, loadOlderMessages]);

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    const handleScroll = () => updateScrollState();
    container.addEventListener("scroll", handleScroll);
    updateScrollState();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [updateScrollState]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const nextHeight = Math.min(el.scrollHeight, 180);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > 180 ? "auto" : "hidden";
  }, [inputText]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !mentorId || !selectedStudentId || isSending) return;

    setIsSending(true);
    shouldScrollToBottomRef.current = true;
    const { data: message, error } = await supabase
      .from("chat_messages")
      .insert({
        mentor_mentee_id: selectedStudentId,
        sender_id: mentorId,
        body: trimmed,
        message_type: "text",
      })
      .select("id")
      .single();

    if (!error) {
      setInputText("");
      const selectedStudent = students.find((student) => student.id === selectedStudentId);
      const menteeId = selectedStudent?.menteeId;
      if (menteeId) {
        const mentorTitle = "멘토 새 메시지";
        await supabase.from("notifications").insert({
          recipient_id: menteeId,
          recipient_role: "mentee",
          type: "chat_message",
          ref_type: "chat_message",
          ref_id: message?.id ?? null,
          title: mentorTitle,
          message: trimmed,
          action_url: "/chat",
          actor_id: mentorId,
          avatar_url: null,
          meta: {
            mentorMenteeId: selectedStudentId,
            messageType: "text",
          },
        });
      }
    }

    setIsSending(false);
  };

  const handleSendFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !mentorId || !selectedStudentId || isSending) {
      return;
    }

    setIsSending(true);
    shouldScrollToBottomRef.current = true;

    const fileArray = Array.from(files);
    const messageType = fileArray.every((file) => file.type.startsWith("image/"))
      ? "image"
      : "file";

    const { data: message, error: messageError } = await supabase
      .from("chat_messages")
      .insert({
        mentor_mentee_id: selectedStudentId,
        sender_id: mentorId,
        body: messageType === "file" ? "파일을 전송했습니다." : null,
        message_type: messageType,
      })
      .select("id")
      .single();

    if (messageError || !message) {
      setIsSending(false);
      return;
    }

    const selectedStudent = students.find((student) => student.id === selectedStudentId);
    const menteeId = selectedStudent?.menteeId;
    if (menteeId) {
      const preview =
        messageType === "image" ? "이미지를 전송했습니다." : "파일을 전송했습니다.";
      await supabase.from("notifications").insert({
        recipient_id: menteeId,
        recipient_role: "mentee",
        type: "chat_message",
        ref_type: "chat_message",
        ref_id: message.id,
        title: "멘토 새 메시지",
        message: preview,
        action_url: "/chat",
        actor_id: mentorId,
        avatar_url: null,
        meta: {
          mentorMenteeId: selectedStudentId,
          messageType,
        },
      });
    }

    for (const file of fileArray) {
      const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const fileName = `${crypto.randomUUID()}.${extension}`;
      const path = `mentor_mentee/${selectedStudentId}/${message.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(ATTACHMENT_BUCKET)
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        continue;
      }

      await supabase.from("chat_attachments").insert({
        message_id: message.id,
        bucket: ATTACHMENT_BUCKET,
        path,
        mime_type: file.type,
        size_bytes: file.size,
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setIsSending(false);
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setStudents((prev) =>
      prev.map((student) =>
        student.id === id ? { ...student, unread: 0 } : student
      )
    );
  };

  useEffect(() => {
    messageIdsRef.current = new Set(messages.map((msg) => msg.id));
    if (messages.length > 0 && messagesPairIdRef.current) {
      writeMentorChatCache(messagesPairIdRef.current, { messages });
    }
  }, [messages]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedSubject = selectedStudent
    ? SUBJECT_META[selectedStudent.subject]
    : SUBJECT_META.math;

  const themeStyle = {
    "--chat-accent": "#0F766E",
    "--chat-accent-2": "#14B8A6",
    "--chat-warm": "#F97316",
    "--chat-ink": "#0F172A",
    "--chat-muted": "#64748B",
  } as CSSProperties;

  return (
    <div
      className={`${bodyFont.className} relative h-[calc(100vh-12rem)] overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_30px_80px_-55px_rgba(15,23,42,0.65)] animate-[softIn_0.6s_ease-out]`}
      style={themeStyle}
    >
      <style>{`
        @keyframes softIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(18px, -14px) scale(1.05); }
        }
        .chat-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(15, 118, 110, 0.45) transparent;
        }
        .chat-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(15, 118, 110, 0.55), rgba(20, 184, 166, 0.45));
          border-radius: 999px;
          border: 2px solid rgba(255, 255, 255, 0.6);
        }
        .chat-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(15, 118, 110, 0.75), rgba(20, 184, 166, 0.65));
        }
      `}</style>

      <div className="pointer-events-none absolute -top-32 -right-32 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(20,184,166,0.22),_transparent_70%)] blur-3xl animate-[drift_14s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(249,115,22,0.18),_transparent_70%)] blur-3xl animate-[drift_16s_ease-in-out_infinite]" />

      <div className="relative z-10 flex h-full">
        {/* Sidebar */}
        <aside
          className={`flex flex-col border-r border-slate-200/70 bg-gradient-to-b from-white via-slate-50 to-white transition-all duration-300 ${
            isSidebarOpen ? "w-[22rem]" : "w-20"
          }`}
        >
          {isSidebarOpen ? (
            <>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`${headingFont.className} text-[11px] uppercase tracking-[0.3em] text-slate-400`}
                    >
                      Mentor Inbox
                    </p>
                    <h2 className="text-lg font-bold text-[color:var(--chat-ink)]">
                      채팅
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="학생 이름 검색..."
                    className="h-11 bg-white/80 pl-9 pr-10 text-sm shadow-sm border-slate-200/70 focus-visible:ring-[color:var(--chat-accent)]"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm hover:bg-slate-50">
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="px-5 pb-4">
                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.45)]">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>오늘 응답률</span>
                    <span className="font-semibold text-slate-900">92%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                    <div className="h-full w-[92%] rounded-full bg-[linear-gradient(90deg,_var(--chat-accent),_var(--chat-accent-2))]" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>미응답 0건</span>
                    <span>평균 1h 14m</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-5">
                {students.map((student) => {
                  const subject = SUBJECT_META[student.subject];
                  const isActive = selectedStudentId === student.id;

                  return (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student.id)}
                      className={`group w-full rounded-2xl border p-4 text-left transition-all ${
                        isActive
                          ? "border-[color:var(--chat-accent)] bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)]"
                          : "border-transparent bg-white/60 hover:border-slate-200 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div
                            className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${subject.avatar} flex items-center justify-center text-sm font-semibold text-white shadow-sm overflow-hidden`}
                          >
                            {student.avatarUrl ? (
                              <img
                                src={student.avatarUrl}
                                alt={student.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              student.name[0]
                            )}
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                              student.online ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900">
                              {student.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {student.time}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">
                              {student.level}
                            </span>
                          </div>
                          <p className="mt-2 truncate text-xs text-slate-500">
                            {student.lastMsg}
                          </p>
                        </div>

                        {student.unread > 0 && (
                          <div className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--chat-warm)] text-[10px] font-bold text-white shadow-sm">
                            {student.unread}
                          </div>
                        )}
                      </div>

                    </button>
                  );
                })}

                {students.length === 0 && !isLoading && (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-6 text-center text-xs text-slate-400">
                    연결된 멘티가 없습니다.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center px-3 pt-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex-1 space-y-3 overflow-y-auto px-2 pb-4">
                {students.map((student) => {
                  const subject = SUBJECT_META[student.subject];
                  const isActive = selectedStudentId === student.id;

                  return (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student.id)}
                      className={`relative flex w-full items-center justify-center rounded-2xl border p-2 transition-all ${
                        isActive
                          ? "border-[color:var(--chat-accent)] bg-white shadow-[0_12px_30px_-22px_rgba(15,23,42,0.55)]"
                          : "border-transparent bg-white/60 hover:border-slate-200 hover:bg-white"
                      }`}
                    >
                      <div
                        className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${subject.avatar} flex items-center justify-center text-sm font-semibold text-white shadow-sm overflow-hidden`}
                      >
                        {student.avatarUrl ? (
                          <img
                            src={student.avatarUrl}
                            alt={student.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          student.name[0]
                        )}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                          student.online ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {student.unread > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--chat-warm)] text-[10px] font-bold text-white shadow-sm">
                          {student.unread}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </aside>

        {/* Chat Room */}
        <section className="flex flex-1 flex-col">
          {selectedStudent ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-200/70 bg-white/80 px-6 pb-4 pt-5 backdrop-blur">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${selectedSubject.avatar} flex items-center justify-center text-lg font-semibold text-white shadow-md overflow-hidden`}
                      >
                        {selectedStudent.avatarUrl ? (
                          <img
                            src={selectedStudent.avatarUrl}
                            alt={selectedStudent.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          selectedStudent.name[0]
                        )}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          selectedStudent.online
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`${headingFont.className} text-lg font-semibold text-slate-900`}
                        >
                          {selectedStudent.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500">
                        {selectedStudent.level} · 최근 활동: 방금 전
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <button className="rounded-full border border-slate-200 bg-white p-2 hover:bg-slate-50">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="rounded-full border border-slate-200 bg-white p-2 hover:bg-slate-50">
                      <Video className="h-4 w-4" />
                    </button>
                    <button className="rounded-full border border-slate-200 bg-white p-2 hover:bg-slate-50">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Messages */}
              <div className="relative flex-1 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.08),_transparent_65%),_linear-gradient(180deg,_rgba(248,250,252,0.85),_rgba(255,255,255,0.92))]" />
                <div
                  ref={chatScrollRef}
                  className="chat-scroll relative h-full overflow-y-auto px-6 py-6"
                >
                  <div className="min-h-full flex flex-col justify-end py-4 px-2">
                    {isLoadingMore && (
                      <div className="text-center text-xs text-slate-400">
                        이전 메시지 불러오는 중...
                      </div>
                    )}
                    {isLoading && (
                      <div className="text-center text-xs text-slate-400">
                        메시지를 불러오는 중...
                      </div>
                    )}
                    {messages.map((msg, index) => {
                      const isMe = msg.sender_id === mentorId;
                      const prevMsg = messages[index - 1];

                      // Check if it's a sequential message (same sender, within 1 minute)
                      const isSequence =
                        prevMsg &&
                        prevMsg.sender_id === msg.sender_id &&
                        prevMsg.message_type !== "system" && // Don't group with system messages
                        msg.message_type !== "system" &&
                        (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 60000);

                      const senderLabel = isMe ? "멘토 (나)" : selectedStudent.name;
                      const timeLabel = new Date(msg.created_at).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                      if (msg.message_type === "system") {
                        return (
                          <div key={msg.id} className="w-full flex justify-center my-4">
                            {msg.body?.startsWith("MEETING_CONFIRMED:") ? (
                              <MeetingConfirmedMessage
                                  requestId={msg.body.split(":")[1]}
                                  isSender={isMe}
                              />
                            ) : (
                              <span className="bg-gray-100 text-gray-500 text-[11px] px-3 py-1 rounded-full border border-gray-200">
                                  {msg.body}
                              </span>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 relative group ${
                            isMe ? "flex-row-reverse" : ""
                          } ${isSequence ? "mt-[2px]" : "mt-5"}`}
                        >
                          {/* Avatar Area (40px width) */}
                          <div className="flex-shrink-0 w-10 flex flex-col items-center">
                            {!isSequence && !isMe ? (
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200 shadow-sm border border-white">
                                 {selectedStudent?.avatarUrl ? (
                                  <img
                                    src={selectedStudent.avatarUrl}
                                    alt="profile"
                                    className="h-full w-full object-cover"
                                  />
                                ) : null}
                              </div>
                            ) : null}
                          </div>

                          {/* Message Content Area */}
                          <div
                            className={`flex flex-col max-w-[75%] ${
                              isMe ? "items-end" : "items-start"
                            }`}
                          >
                            {/* Header (Name & Time) - Show only if not sequence */}
                            {!isSequence && (
                              <div className={`flex items-end gap-2 mb-1 ${
                                isMe ? "flex-row-reverse" : "flex-row"
                              }`}>
                                <span className="font-semibold text-slate-900 text-[14px]">
                                  {senderLabel}
                                </span>
                                <span className="text-[12px] text-slate-400">
                                  {timeLabel}
                                </span>
                                {isMe && (
                                  <span className="flex items-center gap-1 text-[12px] text-slate-400">
                                    <CheckCheck className="h-3 w-3" />
                                    전송됨
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Message Body */}
                            <div className={`flex flex-col gap-1 w-full ${isMe ? "items-end" : "items-start"}`}>
                              {msg.body && msg.message_type !== "meeting_request" ? (
                                <div className={`text-[15px] leading-relaxed text-slate-800 break-words whitespace-pre-wrap ${
                                  isMe ? "text-right" : "text-left"
                                }`}>
                                  {msg.body}
                                </div>
                              ) : null}

                              {/* Meeting Request Card */}
                              {msg.message_type === "meeting_request" && msg.body?.startsWith("MEETING_REQUEST:") && (
                                  <div className="mt-1">
                                    <MentorMeetingRequestCard requestId={msg.body.split(":")[1]} />
                                  </div>
                              )}

                              {/* Attachments */}
                              {msg.chat_attachments?.length ? (
                                <div className={`mt-1 flex flex-col gap-2 ${isMe ? "items-end" : "items-start"}`}>
                                  {msg.chat_attachments.map((attachment) => {
                                    if (
                                      attachment.signed_url &&
                                      attachment.mime_type?.startsWith("image/")
                                    ) {
                                      return (
                                        <img
                                          key={attachment.id}
                                          src={attachment.signed_url}
                                          alt="attachment"
                                          className="max-w-[280px] rounded-xl border border-slate-100 shadow-sm bg-white"
                                        />
                                      );
                                    }

                                    return (
                                      <a
                                        key={attachment.id}
                                        href={attachment.signed_url ?? "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm"
                                      >
                                        <Paperclip size={14} className="text-slate-400"/>
                                        파일 다운로드
                                      </a>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const container = chatScrollRef.current;
                    if (!container) return;
                    container.scrollTo({
                      top: container.scrollHeight,
                      behavior: "smooth",
                    });
                  }}
                  className={`absolute bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg shadow-slate-200/60 transition-all ${
                    showScrollToBottom
                      ? "opacity-100 translate-y-0"
                      : "pointer-events-none opacity-0 translate-y-2"
                  }`}
                  aria-label="최신 메시지로 이동"
                >
                  <ArrowDown className="h-5 w-5" />
                </button>
              </div>

              {/* Input */}
              <div className="border-t border-slate-200/70 bg-white/80 p-5 backdrop-blur">
                <div className="mt-0 flex items-end gap-3">
                  <div className="relative flex-1">
                    <textarea
                      ref={textareaRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="메시지를 입력하세요..."
                      rows={1}
                      maxLength={500}
                      className="w-full min-h-[52px] max-h-[180px] resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-16 text-sm leading-relaxed shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[color:var(--chat-accent)]"
                      disabled={!selectedStudentId || isSending}
                    />
                    <span className="absolute bottom-3 right-4 text-[10px] text-slate-400">
                      {inputText.length}/500
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        onChange={(event) => handleSendFiles(event.target.files)}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        disabled={!selectedStudentId || isSending}
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                        disabled={!selectedStudentId || isSending}
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() || !selectedStudentId || isSending}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,_var(--chat-accent),_var(--chat-accent-2))] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:opacity-90 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      보내기
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-400">
              {isLoading ? "채팅을 불러오는 중..." : "대화 상대를 선택해주세요."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
