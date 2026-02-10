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
  const isPinnedToBottomRef = useRef(true);
  const forceBottomRafRef = useRef<number | null>(null);
  const forceBottomUntilRef = useRef(0);
  const lastScrollTopRef = useRef(0);

  const stopForceBottom = useCallback(() => {
    if (forceBottomRafRef.current !== null) {
      cancelAnimationFrame(forceBottomRafRef.current);
      forceBottomRafRef.current = null;
    }
    forceBottomUntilRef.current = 0;
  }, []);

  const forceScrollToBottom = useCallback(
    (durationMs = 1800) => {
      const deadline = Date.now() + durationMs;
      forceBottomUntilRef.current = Math.max(forceBottomUntilRef.current, deadline);

      const step = () => {
        const container = chatScrollRef.current;
        if (!container) {
          forceBottomRafRef.current = null;
          return;
        }

        container.scrollTop = container.scrollHeight;
        isPinnedToBottomRef.current = true;
        setShowScrollToBottom(false);

        if (Date.now() < forceBottomUntilRef.current) {
          forceBottomRafRef.current = requestAnimationFrame(step);
          return;
        }

        forceBottomRafRef.current = null;
      };

      if (forceBottomRafRef.current === null) {
        forceBottomRafRef.current = requestAnimationFrame(step);
      }
    },
    [],
  );

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

      const selectWithGrade =
        "id, mentee:profiles!mentor_mentee_mentee_id_fkey(id, name, avatar_url, grade), chat_messages(id, body, created_at, sender_id, message_type)";
      const selectFallback =
        "id, mentee:profiles!mentor_mentee_mentee_id_fkey(id, name, avatar_url), chat_messages(id, body, created_at, sender_id, message_type)";

      let pairs: any[] | null = null;
      let pairsError: { message: string } | null = null;

      const withGradeResult = await supabase
        .from("mentor_mentee")
        .select(selectWithGrade)
        .eq("mentor_id", uid)
        .eq("status", "active")
        .order("started_at", { ascending: false })
        .order("created_at", { foreignTable: "chat_messages", ascending: false })
        .limit(1, { foreignTable: "chat_messages" });

      pairs = withGradeResult.data;
      pairsError = withGradeResult.error;

      if (
        pairsError &&
        typeof pairsError.message === "string" &&
        pairsError.message.includes("grade")
      ) {
        const fallbackResult = await supabase
          .from("mentor_mentee")
          .select(selectFallback)
          .eq("mentor_id", uid)
          .eq("status", "active")
          .order("started_at", { ascending: false })
          .order("created_at", { foreignTable: "chat_messages", ascending: false })
          .limit(1, { foreignTable: "chat_messages" });

        pairs = fallbackResult.data;
        pairsError = fallbackResult.error;
      }

      if (pairsError) {
        if (isMounted) setIsLoading(false);
        return;
      }

      const gradeByMenteeId = new Map<string, string>();
      const menteeIds = (pairs ?? [])
        .map((pair: any) => {
          const menteeProfile = Array.isArray(pair.mentee) ? pair.mentee[0] : pair.mentee;
          return menteeProfile?.id as string | undefined;
        })
        .filter((id): id is string => Boolean(id));

      if (menteeIds.length > 0) {
        const { data: gradeRows } = await supabase
          .from("profiles")
          .select("id, grade")
          .in("id", menteeIds);

        (gradeRows ?? []).forEach((row: any) => {
          if (typeof row?.id !== "string") return;
          if (typeof row?.grade !== "string") return;
          const trimmed = row.grade.trim();
          if (!trimmed) return;
          gradeByMenteeId.set(row.id, trimmed);
        });
      }

      const nextStudents: Student[] = (pairs ?? []).map((pair) => {
        const menteeProfile = Array.isArray(pair.mentee) ? pair.mentee[0] : pair.mentee;
        const lastMessage = pair.chat_messages?.[0] as
          | {
              body: string | null;
              created_at: string;
              sender_id: string;
              message_type: "text" | "image" | "file" | "meeting_request" | "system" | "meeting_scheduled";
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

        const joinedGrade =
          typeof menteeProfile?.grade === "string" ? menteeProfile.grade.trim() : "";
        const fetchedGrade = gradeByMenteeId.get(menteeProfile?.id ?? "") ?? "";
        const resolvedGrade = joinedGrade || fetchedGrade || null;

        return {
          id: pair.id,
          menteeId: menteeProfile?.id ?? "",
          name: menteeProfile?.name ?? "멘티",
          lastMsg: lastMsgText,
          time: formatPreviewTime(lastMessage?.created_at),
          unread: 0,
          subject: "math",
          grade: resolvedGrade,
          level: resolvedGrade ?? "미설정",
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
      shouldScrollToBottomRef.current = true;
      forceScrollToBottom();
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
    forceScrollToBottom();
    loadingPairsRef.current.delete(pairId);
  }, [selectedStudentId, fetchMessagesPage, persistCache, forceScrollToBottom]);

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

    setShowScrollToBottom(false);
    setIsLoadingMore(false);
    setMessages([]);
    setHasMore(true);
    shouldScrollToBottomRef.current = true;
    isPinnedToBottomRef.current = true;
    forceScrollToBottom(2200);
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
      stopForceBottom();
      supabase.removeChannel(channel);
    };
  }, [
    selectedStudentId,
    mentorId,
    loadMessages,
    fetchSignedUrl,
    markChatNotificationsRead,
    forceScrollToBottom,
    stopForceBottom,
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

    if (messages.length === 0) return;

    if (shouldScrollToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
      shouldScrollToBottomRef.current = false;
      isPinnedToBottomRef.current = true;
      setShowScrollToBottom(false);
    }
  }, [messages, selectedStudentId]);

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    const scrollToBottomIfPinned = () => {
      if (pendingScrollAdjustRef.current || isLoadingMore) return;
      if (!isPinnedToBottomRef.current && !shouldScrollToBottomRef.current) return;

      container.scrollTop = container.scrollHeight;
      shouldScrollToBottomRef.current = false;
      isPinnedToBottomRef.current = true;
      setShowScrollToBottom(false);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(scrollToBottomIfPinned);
    });
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(scrollToBottomIfPinned);
    });

    let observed = container.firstElementChild as HTMLElement | null;
    if (observed) {
      resizeObserver.observe(observed);
    }
    mutationObserver.observe(container, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [selectedStudentId, isLoadingMore]);

  const updateScrollState = useCallback(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;
    const forceActive = Date.now() < forceBottomUntilRef.current;
    if (forceActive && currentScrollTop + 2 < lastScrollTopRef.current) {
      stopForceBottom();
      shouldScrollToBottomRef.current = false;
      isPinnedToBottomRef.current = false;
    }
    lastScrollTopRef.current = currentScrollTop;

    if (shouldScrollToBottomRef.current) {
      isPinnedToBottomRef.current = true;
      setShowScrollToBottom(false);
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isNearBottom = distanceFromBottom <= 140;
    isPinnedToBottomRef.current = isNearBottom;
    setShowScrollToBottom(distanceFromBottom > 800);

    if (!isNearBottom && Date.now() >= forceBottomUntilRef.current) {
      stopForceBottom();
    }

    if (
      messages.length > 0 &&
      container.scrollTop <= 40 &&
      hasMore &&
      !isLoadingMore
    ) {
      loadOlderMessages();
    }
  }, [hasMore, isLoadingMore, loadOlderMessages, messages.length, stopForceBottom]);

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;

    const stopForceOnUserIntent = () => {
      if (Date.now() < forceBottomUntilRef.current) {
        stopForceBottom();
        shouldScrollToBottomRef.current = false;
      }
    };

    const handleScroll = () => updateScrollState();
    container.addEventListener("scroll", handleScroll);
    container.addEventListener("wheel", stopForceOnUserIntent, { passive: true });
    container.addEventListener("touchstart", stopForceOnUserIntent, {
      passive: true,
    });
    container.addEventListener("pointerdown", stopForceOnUserIntent);
    updateScrollState();
    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", stopForceOnUserIntent);
      container.removeEventListener("touchstart", stopForceOnUserIntent);
      container.removeEventListener("pointerdown", stopForceOnUserIntent);
    };
  }, [updateScrollState, stopForceBottom]);

  useEffect(
    () => () => {
      stopForceBottom();
    },
    [stopForceBottom],
  );

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
