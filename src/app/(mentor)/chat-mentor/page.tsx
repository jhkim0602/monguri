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
import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";

const ATTACHMENT_BUCKET = "chat-attachments";

const bodyFont = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

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
  message_type: "text" | "image" | "file";
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
  return message.message_type === "image"
    ? "이미지를 전송했습니다."
    : "파일을 전송했습니다.";
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
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        const lastMessage = pair.chat_messages?.[0] as
          | {
              body: string | null;
              created_at: string;
              sender_id: string;
              message_type: "text" | "image" | "file";
            }
          | undefined;

        const lastMsgText = lastMessage
          ? lastMessage.body ??
            (lastMessage.message_type === "image"
              ? "이미지를 전송했습니다."
              : "파일을 전송했습니다.")
          : "대화 없음";

        return {
          id: pair.id,
          name: pair.mentee?.name ?? "멘티",
          lastMsg: lastMsgText,
          time: formatPreviewTime(lastMessage?.created_at),
          unread: 0,
          subject: "math",
          level: "멘티",
          online: false,
          avatarUrl: pair.mentee?.avatar_url ?? null,
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
    if (!selectedStudentId) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select(
        "id, mentor_mentee_id, sender_id, body, message_type, created_at, chat_attachments(id, message_id, bucket, path, mime_type, size_bytes, width, height)"
      )
      .eq("mentor_mentee_id", selectedStudentId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error || !data) return;

    const normalized = await Promise.all(data.map(normalizeMessage));
    setMessages(normalized);
  }, [selectedStudentId, normalizeMessage]);

  const fetchMessageById = useCallback(
    async (messageId: string) => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(
          "id, mentor_mentee_id, sender_id, body, message_type, created_at, chat_attachments(id, message_id, bucket, path, mime_type, size_bytes, width, height)"
        )
        .eq("id", messageId)
        .single();

      if (error || !data) return null;

      return normalizeMessage(data);
    },
    [normalizeMessage]
  );

  useEffect(() => {
    if (!selectedStudentId) return;

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
          const messageId = payload.new.id as string;
          const fullMessage = await fetchMessageById(messageId);

          if (!fullMessage) return;

          setMessages((prev) => {
            if (prev.some((item) => item.id === fullMessage.id)) {
              return prev;
            }
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
          const { data, error } = await supabase.storage
            .from(ATTACHMENT_BUCKET)
            .createSignedUrl(rawAttachment.path, 60 * 5);

          const hydrated: ChatAttachment = {
            ...rawAttachment,
            signed_url: error ? null : data?.signedUrl ?? null,
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
  }, [selectedStudentId, loadMessages, fetchMessageById]);

  useEffect(() => {
    if (!chatScrollRef.current) return;
    const scrollToBottom = () => {
      const container = chatScrollRef.current;
      if (!container) return;
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    };
    const timer = setTimeout(scrollToBottom, 120);
    return () => clearTimeout(timer);
  }, [messages, selectedStudentId]);

  const updateScrollState = () => {
    const container = chatScrollRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollToBottom(distanceFromBottom > 800);
  };

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    const handleScroll = () => updateScrollState();
    container.addEventListener("scroll", handleScroll);
    updateScrollState();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

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
    const { error } = await supabase.from("chat_messages").insert({
      mentor_mentee_id: selectedStudentId,
      sender_id: mentorId,
      body: trimmed,
      message_type: "text",
    });

    if (!error) {
      setInputText("");
    }

    setIsSending(false);
  };

  const handleSendFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !mentorId || !selectedStudentId || isSending) {
      return;
    }

    setIsSending(true);

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

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedSubject = selectedStudent
    ? SUBJECT_META[selectedStudent.subject]
    : SUBJECT_META.math;

  const themeStyle: CSSProperties = {
    "--chat-accent": "#0F766E",
    "--chat-accent-2": "#14B8A6",
    "--chat-warm": "#F97316",
    "--chat-ink": "#0F172A",
    "--chat-muted": "#64748B",
  };

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
                  <div className="min-h-full flex flex-col justify-end gap-2">
                    {isLoading && (
                      <div className="text-center text-xs text-slate-400">
                        메시지를 불러오는 중...
                      </div>
                    )}
                    {messages.map((msg) => {
                      const isMe = msg.sender_id === mentorId;
                      const senderLabel = isMe
                        ? "멘토 (나)"
                        : selectedStudent.name;
                      const timeLabel = new Date(msg.created_at).toLocaleTimeString(
                        "ko-KR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );

                      return (
                        <div
                          key={msg.id}
                          className="group flex items-start gap-3 rounded-2xl px-3 py-1.5 transition-colors hover:bg-white/70"
                        >
                          <div
                            className={`h-12 w-12 rounded-2xl flex items-center justify-center text-base font-semibold text-white shadow-sm overflow-hidden ${
                              isMe
                                ? "bg-[linear-gradient(135deg,_var(--chat-accent),_var(--chat-accent-2))]"
                                : "bg-slate-300 text-slate-700"
                            }`}
                          >
                            {isMe
                              ? "멘"
                              : selectedStudent.avatarUrl
                                ? (
                                    <img
                                      src={selectedStudent.avatarUrl}
                                      alt={selectedStudent.name}
                                      className="h-full w-full object-cover"
                                    />
                                  )
                                : selectedStudent.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500">
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
                            {msg.body ? (
                              <div className="mt-1.5 text-[17px] leading-relaxed text-slate-800">
                                {msg.body}
                              </div>
                            ) : null}
                            {msg.chat_attachments?.length ? (
                              <div className="mt-2 flex flex-col gap-2">
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
                                        className="max-w-[280px] rounded-2xl border border-white/60"
                                      />
                                    );
                                  }

                                  return (
                                    <a
                                      key={attachment.id}
                                      href={attachment.signed_url ?? "#"}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs underline text-slate-600"
                                    >
                                      파일 다운로드
                                    </a>
                                  );
                                })}
                              </div>
                            ) : null}
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
                <div className="mt-0 flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => setInputText(reply)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 hover:border-[color:var(--chat-accent)] hover:text-[color:var(--chat-accent)]"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

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
