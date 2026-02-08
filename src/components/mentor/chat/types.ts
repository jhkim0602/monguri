import type { CSSProperties } from "react";

export const ATTACHMENT_BUCKET = "chat-attachments";

export const bodyFont = { className: "font-sans" };
export const headingFont = { className: "font-sans" };

export const SUBJECT_META = {
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
} as const;

export type SubjectKey = keyof typeof SUBJECT_META;

export type Student = {
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

export type ChatAttachment = {
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

export type ChatMessage = {
  id: string;
  mentor_mentee_id: string;
  sender_id: string;
  body: string | null;
  message_type: "text" | "image" | "file" | "meeting_request" | "system";
  created_at: string;
  chat_attachments?: ChatAttachment[];
};

export const formatPreviewTime = (value?: string | null) => {
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

export const getFallbackMessage = (message: ChatMessage) => {
  if (message.body) return message.body;
  if (message.message_type === "image") return "이미지를 전송했습니다.";
  if (message.message_type === "meeting_request") return "미팅 신청이 도착했습니다.";
  return "파일을 전송했습니다.";
};

export const themeStyle: CSSProperties = {
  "--chat-accent": "#0F766E",
  "--chat-accent-2": "#14B8A6",
  "--chat-warm": "#F97316",
  "--chat-ink": "#0F172A",
  "--chat-muted": "#64748B",
} as CSSProperties;
