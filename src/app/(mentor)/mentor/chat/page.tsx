"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  Clock,
  ShieldCheck,
  Calendar,
  Flame,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
} from "lucide-react";
import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";

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

const STATUS_META = {
  focus: {
    label: "집중 케어",
    badge: "bg-rose-50 text-rose-700 border-rose-100",
  },
  steady: {
    label: "루틴 진행",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
  },
  waiting: {
    label: "응답 대기",
    badge: "bg-orange-50 text-orange-700 border-orange-100",
  },
};

type StatusKey = keyof typeof STATUS_META;

type Student = {
  id: number;
  name: string;
  lastMsg: string;
  time: string;
  unread: number;
  subject: SubjectKey;
  level: string;
  status: StatusKey;
  focus: string;
  lastTask: string;
  nextSession: string;
  avgResponse: string;
  streak: number;
  online: boolean;
};

const STUDENTS: Student[] = [
  {
    id: 1,
    name: "김민준",
    lastMsg: "아 넵! 해설지 봐도 이해가 안 가서요 ㅠㅠ",
    time: "10:32 AM",
    unread: 2,
    subject: "math",
    level: "고2",
    status: "focus",
    focus: "기하 벡터 킬러 접근",
    lastTask: "4번 오답 재풀이",
    nextSession: "오늘 19:30",
    avgResponse: "1h 12m",
    streak: 5,
    online: true,
  },
  {
    id: 2,
    name: "이서연",
    lastMsg: "선생님 오늘 수업 자료 올려주실 수 있나요?",
    time: "어제",
    unread: 0,
    subject: "english",
    level: "고3",
    status: "waiting",
    focus: "빈칸 추론 정확도",
    lastTask: "수업 자료 요청",
    nextSession: "2/8 20:00",
    avgResponse: "2h 05m",
    streak: 3,
    online: false,
  },
  {
    id: 3,
    name: "박지훈",
    lastMsg: "넵 알겠습니다!",
    time: "어제",
    unread: 0,
    subject: "korean",
    level: "고1",
    status: "steady",
    focus: "현대시 상징 분석",
    lastTask: "시어 정리 노트",
    nextSession: "2/10 18:00",
    avgResponse: "45m",
    streak: 7,
    online: true,
  },
];

type Message = {
  id: number;
  sender: "me" | "student" | "system";
  text: string;
  time?: string;
  status?: "sent" | "read";
};

const QUICK_REPLIES = [
  "핵심 개념 3줄 요약 부탁해요.",
  "풀이 과정을 단계별로 적어줘.",
  "오답 원인을 한 문장으로 정리해봐.",
  "다음 목표를 같이 정해보자.",
];

export default function MentorChatPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const initialScrollRef = useRef(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "me",
      text: "민준아, 어제 올린 수학 숙제 잘 봤어! 4번 문제 다시 풀어보는 게 좋겠더라.",
      time: "10:30 AM",
      status: "read",
    },
    {
      id: 2,
      sender: "student",
      text: "아 넵! 해설지 봐도 이해가 안 가서요 ㅠㅠ",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "me",
      text: "좋아. 풀이 순서를 한 문장씩 써보자. 먼저 어떤 조건을 써야 할까?",
      time: "10:33 AM",
      status: "sent",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "me",
        text: trimmed,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      },
    ]);
    setInputText("");
  };

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const nextHeight = Math.min(el.scrollHeight, 180);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > 180 ? "auto" : "hidden";
  };

  const selectedStudent = STUDENTS.find((s) => s.id === selectedStudentId);
  const selectedSubject = selectedStudent
    ? SUBJECT_META[selectedStudent.subject]
    : SUBJECT_META.math;
  const selectedStatus = selectedStudent
    ? STATUS_META[selectedStudent.status]
    : STATUS_META.steady;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const container = chatScrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

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

    if (initialScrollRef.current) {
      scrollToBottom("auto");
      initialScrollRef.current = false;
      setShowScrollToBottom(false);
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 800) {
      scrollToBottom("auto");
      setShowScrollToBottom(false);
    } else {
      setShowScrollToBottom(true);
    }
  }, [messages, selectedStudentId]);

  useEffect(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    const handleScroll = () => updateScrollState();
    container.addEventListener("scroll", handleScroll);
    updateScrollState();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [inputText]);

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
                    <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">
                      Active 3
                    </div>
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

                <div className="mt-4 flex flex-wrap gap-2">
                  {["전체", "미응답", "과제", "수업"].map((filter) => (
                    <button
                      key={filter}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 hover:border-[color:var(--chat-accent)] hover:text-[color:var(--chat-accent)]"
                    >
                      {filter}
                    </button>
                  ))}
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
                    <span>미응답 3건</span>
                    <span>평균 1h 14m</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-5">
                {STUDENTS.map((student) => {
                  const subject = SUBJECT_META[student.subject];
                  const status = STATUS_META[student.status];
                  const isActive = selectedStudentId === student.id;

                  return (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`group w-full rounded-2xl border p-4 text-left transition-all ${
                        isActive
                          ? "border-[color:var(--chat-accent)] bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)]"
                          : "border-transparent bg-white/60 hover:border-slate-200 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div
                            className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${subject.avatar} flex items-center justify-center text-sm font-semibold text-white shadow-sm`}
                          >
                            {student.name[0]}
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
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                subject.badge
                              }`}
                            >
                              {subject.label}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {student.level}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                status.badge
                              }`}
                            >
                              {status.label}
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

                      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                        <span>최근 과제: {student.lastTask}</span>
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-400" />
                          {student.streak}일
                        </span>
                      </div>
                    </button>
                  );
                })}
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
                {STUDENTS.map((student) => {
                  const subject = SUBJECT_META[student.subject];
                  const isActive = selectedStudentId === student.id;

                  return (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`relative flex w-full items-center justify-center rounded-2xl border p-2 transition-all ${
                        isActive
                          ? "border-[color:var(--chat-accent)] bg-white shadow-[0_12px_30px_-22px_rgba(15,23,42,0.55)]"
                          : "border-transparent bg-white/60 hover:border-slate-200 hover:bg-white"
                      }`}
                    >
                      <div
                        className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${subject.avatar} flex items-center justify-center text-sm font-semibold text-white shadow-sm`}
                      >
                        {student.name[0]}
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
                        className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${selectedSubject.avatar} flex items-center justify-center text-lg font-semibold text-white shadow-md`}
                      >
                        {selectedStudent.name[0]}
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
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            selectedStatus.badge
                          }`}
                        >
                          {selectedStatus.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {selectedSubject.label} · {selectedStudent.level} · 최근 활동
                        : 방금 전
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

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
                    <p className={`${headingFont.className} text-[10px] uppercase tracking-[0.25em] text-slate-400`}>
                      Focus
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedStudent.focus}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      최근 과제: {selectedStudent.lastTask}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                    <p className={`${headingFont.className} text-[10px] uppercase tracking-[0.25em] text-slate-400`}>
                      Next
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedStudent.nextSession}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      자료 요청 1건
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
                    <p className={`${headingFont.className} text-[10px] uppercase tracking-[0.25em] text-slate-400`}>
                      Response
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {selectedStudent.avgResponse}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                      <Sparkles className="h-3.5 w-3.5 text-[color:var(--chat-accent)]" />
                      최근 7일 평균
                    </div>
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
                    {messages.map((msg) => {
                      if (msg.sender === "system") {
                        return (
                          <div key={msg.id} className="flex justify-center">
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-500 shadow-sm">
                              <Sparkles className="h-3 w-3 text-[color:var(--chat-accent)]" />
                              {msg.text}
                            </div>
                          </div>
                        );
                      }

                      const isMe = msg.sender === "me";
                      const senderLabel = isMe
                        ? "멘토 (나)"
                        : selectedStudent.name;

                      return (
                        <div
                          key={msg.id}
                          className="group flex items-start gap-3 rounded-2xl px-3 py-1.5 transition-colors hover:bg-white/70"
                        >
                        <div
                          className={`h-12 w-12 rounded-2xl flex items-center justify-center text-base font-semibold text-white shadow-sm ${
                            isMe
                              ? "bg-[linear-gradient(135deg,_var(--chat-accent),_var(--chat-accent-2))]"
                              : "bg-slate-300 text-slate-700"
                          }`}
                        >
                          {isMe ? "멘" : selectedStudent.name[0]}
                        </div>
                          <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-500">
                            <span className="font-semibold text-slate-900 text-[14px]">
                              {senderLabel}
                            </span>
                            {msg.time && (
                              <span className="text-[12px] text-slate-400">
                                {msg.time}
                              </span>
                            )}
                            {isMe && (
                              <span className="flex items-center gap-1 text-[12px] text-slate-400">
                                {msg.status === "read" ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                                {msg.status === "read" ? "읽음" : "보내는 중"}
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 text-[17px] leading-relaxed text-slate-800">
                            {msg.text}
                          </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => scrollToBottom()}
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
                    />
                    <span className="absolute bottom-3 right-4 text-[10px] text-slate-400">
                      {inputText.length}/500
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                        <Paperclip className="h-4 w-4" />
                      </button>
                      <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                        <Smile className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleSend}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,_var(--chat-accent),_var(--chat-accent-2))] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:opacity-90"
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
              대화 상대를 선택해주세요.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
