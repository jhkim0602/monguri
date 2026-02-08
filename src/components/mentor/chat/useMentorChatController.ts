"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  getCachedSignedUrl,
  readMentorChatCache,
  setCachedSignedUrl,
  writeMentorChatCache,
} from "@/lib/mentorChatCache";
import {
  ATTACHMENT_BUCKET,
  ChatAttachment,
  ChatMessage,
  formatPreviewTime,
  getFallbackMessage,
  Student,
  SUBJECT_META,
} from "./types";
import { useMentorChatComposer } from "./useMentorChatComposer";

const PAGE_SIZE = 50;

export function useMentorChatController() {
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

  const persistCache = useCallback(
    (nextMessages: ChatMessage[]) => {
      if (!selectedStudentId) return;
      writeMentorChatCache(selectedStudentId, { messages: nextMessages });
    },
    [selectedStudentId],
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
          "id, mentee:profiles!mentor_mentee_mentee_id_fkey(id, name, avatar_url), chat_messages(id, body, created_at, sender_id, message_type)",
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
        const menteeProfile = Array.isArray(pair.mentee) ? pair.mentee[0] : pair.mentee;
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
        setSelectedStudentId((prev) => prev ?? nextStudents[0]?.id ?? null);
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
    markChatNotificationsRead(selectedStudentId, mentorId);
  }, [mentorId, selectedStudentId, markChatNotificationsRead]);

  useEffect(() => {
    activePairIdRef.current = selectedStudentId;
  }, [selectedStudentId]);

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
    async (list: ChatAttachment[]) =>
      Promise.all(
        list.map(async (attachment) => {
          const cached = getCachedSignedUrl(attachment.path);
          if (cached !== undefined) {
            return { ...attachment, signed_url: cached };
          }
          const signedUrl = await fetchSignedUrl(attachment.path);
          return { ...attachment, signed_url: signedUrl };
        }),
      ),
    [fetchSignedUrl],
  );

  const normalizeMessage = useCallback(
    async (raw: ChatMessage) => {
      if (!raw.chat_attachments || raw.chat_attachments.length === 0) {
        return raw;
      }

      const hydrated = await hydrateAttachments(raw.chat_attachments);
      return { ...raw, chat_attachments: hydrated };
    },
    [hydrateAttachments],
  );

  const fetchMessagesPage = useCallback(
    async (cursor?: string | null) => {
      if (!selectedStudentId) return null;

      let query = supabase
        .from("chat_messages")
        .select(
          "id, mentor_mentee_id, sender_id, body, message_type, created_at, chat_attachments(id, message_id, bucket, path, mime_type, size_bytes, width, height)",
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
    [selectedStudentId, normalizeMessage],
  );

  const loadMessages = useCallback(async () => {
    if (!selectedStudentId) return;
    const pairId = selectedStudentId;
    loadSeqRef.current += 1;

    const cached = readMentorChatCache<{ messages: ChatMessage[] }>(
      selectedStudentId,
    );
    if (cached?.data?.messages?.length) {
      messagesPairIdRef.current = pairId;
      setMessages(cached.data.messages);
      setHasMore(cached.data.messages.length >= PAGE_SIZE);
      if (!cached.stale) return;
    }

    if (loadingPairsRef.current.has(pairId)) return;
    loadingPairsRef.current.add(pairId);

    const page = await fetchMessagesPage();
    if (!page) {
      loadingPairsRef.current.delete(pairId);
      return;
    }
    if (activePairIdRef.current !== pairId) {
      loadingPairsRef.current.delete(pairId);
      return;
    }

    messagesPairIdRef.current = pairId;
    setMessages(page.items);
    setHasMore(page.rawCount >= PAGE_SIZE);
    persistCache(page.items);
    shouldScrollToBottomRef.current = true;
    loadingPairsRef.current.delete(pairId);
  }, [selectedStudentId, fetchMessagesPage, persistCache]);

  const loadOlderMessages = useCallback(async () => {
    if (!selectedStudentId || !hasMore || isLoadingMore) return;
    const pairId = selectedStudentId;
    const oldest = messages[0];
    if (!oldest?.created_at) return;

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
      return;
    }
    if (activePairIdRef.current !== pairId) {
      setIsLoadingMore(false);
      return;
    }

    messagesPairIdRef.current = pairId;
    setMessages((prev) => [...page.items, ...prev]);
    setHasMore(page.rawCount >= PAGE_SIZE);
    setIsLoadingMore(false);
  }, [selectedStudentId, hasMore, isLoadingMore, messages, fetchMessagesPage]);

  useEffect(() => {
    if (!selectedStudentId) return;

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
          if (chatScrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
            const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 160;
            shouldScrollToBottomRef.current = isNearBottom;
          } else {
            shouldScrollToBottomRef.current = true;
          }

          setMessages((prev) => {
            if (prev.some((item) => item.id === fullMessage.id)) return prev;
            messagesPairIdRef.current = selectedStudentId;
            return [...prev, fullMessage].sort(
              (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
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
            }),
          );

          if (
            mentorId &&
            fullMessage.sender_id !== mentorId &&
            fullMessage.mentor_mentee_id === selectedStudentId
          ) {
            await markChatNotificationsRead(selectedStudentId, mentorId);
          }
        },
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
          if (!messageIdsRef.current.has(rawAttachment.message_id)) return;

          const signedUrl = await fetchSignedUrl(rawAttachment.path);
          const hydrated: ChatAttachment = { ...rawAttachment, signed_url: signedUrl };

          setMessages((prev) =>
            prev.map((message) => {
              if (message.id !== hydrated.message_id) return message;
              const nextAttachments = message.chat_attachments ?? [];
              if (nextAttachments.some((item) => item.id === hydrated.id)) {
                return message;
              }
              return { ...message, chat_attachments: [...nextAttachments, hydrated] };
            }),
          );
        },
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
  ]);

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    if (pendingScrollAdjustRef.current) {
      const { prevScrollHeight, prevScrollTop } = pendingScrollAdjustRef.current;
      const nextScrollHeight = container.scrollHeight;
      container.scrollTop = nextScrollHeight - prevScrollHeight + prevScrollTop;
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

  const { handleSend, handleSendFiles } = useMentorChatComposer({
    mentorId,
    selectedStudentId,
    students,
    inputText,
    setInputText,
    isSending,
    setIsSending,
    textareaRef,
    fileInputRef,
    shouldScrollToBottomRef,
  });

  const handleSelectStudent = useCallback((id: string) => {
    setSelectedStudentId(id);
    setStudents((prev) =>
      prev.map((student) => (student.id === id ? { ...student, unread: 0 } : student)),
    );
  }, []);

  useEffect(() => {
    messageIdsRef.current = new Set(messages.map((msg) => msg.id));
    if (messages.length > 0 && messagesPairIdRef.current) {
      writeMentorChatCache(messagesPairIdRef.current, { messages });
    }
  }, [messages]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId);
  const selectedSubject = selectedStudent
    ? SUBJECT_META[selectedStudent.subject]
    : SUBJECT_META.math;

  return {
    mentorId,
    students,
    selectedStudentId,
    selectedStudent,
    selectedSubject,
    isSidebarOpen,
    setIsSidebarOpen,
    showScrollToBottom,
    messages,
    inputText,
    setInputText,
    isLoading,
    isLoadingMore,
    isSending,
    chatScrollRef,
    textareaRef,
    fileInputRef,
    handleSend,
    handleSendFiles,
    handleSelectStudent,
  };
}
