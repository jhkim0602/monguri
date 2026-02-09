"use client";

import { ArrowDown, CheckCheck, Paperclip, Send, Smile } from "lucide-react";
import MentorMeetingRequestCard from "@/components/mentor/chat/MentorMeetingRequestCard";
import MeetingConfirmedMessage from "@/components/common/chat/MeetingConfirmedMessage";
import MentorChatSidebar from "@/components/mentor/chat/MentorChatSidebar";
import { useMentorProfile } from "@/contexts/MentorProfileContext";
import {
  bodyFont,
  headingFont,
  themeStyle,
} from "@/components/mentor/chat/types";
import { useMentorChatController } from "@/components/mentor/chat/useMentorChatController";

export default function MentorChatPage() {
  const { profile: mentorProfile } = useMentorProfile();
  const {
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
  } = useMentorChatController();
  const mentorAvatarUrl = mentorProfile?.avatar_url ?? null;

  return (
    <div
      className={`${bodyFont.className} relative h-[calc(100vh-7rem)] overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_30px_80px_-55px_rgba(15,23,42,0.65)] animate-[softIn_0.6s_ease-out]`}
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

      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 animate-[drift_14s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,_rgba(20,184,166,0.22),_transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 animate-[drift_16s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,_rgba(249,115,22,0.18),_transparent_70%)] blur-3xl" />

      <div className="relative z-10 flex h-full">
        <MentorChatSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          students={students}
          selectedStudentId={selectedStudentId}
          isLoading={isLoading}
          onSelectStudent={handleSelectStudent}
          headingFontClassName={headingFont.className}
        />

        <section className="flex flex-1 flex-col">
          {selectedStudent ? (
            <>
              <div className="border-b border-slate-200/70 bg-white/80 px-6 pb-4 pt-5 backdrop-blur">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className={`h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-br ${selectedSubject.avatar} flex items-center justify-center text-lg font-semibold text-white shadow-md`}
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
                        멘티{" "}
                        {selectedStudent.grade?.trim()
                          ? ": " + selectedStudent.grade?.trim()
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative flex-1 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.08),_transparent_65%),_linear-gradient(180deg,_rgba(248,250,252,0.85),_rgba(255,255,255,0.92))]" />
                <div
                  ref={chatScrollRef}
                  className="chat-scroll relative h-full overflow-y-auto px-6 py-6"
                >
                  <div className="flex min-h-full flex-col justify-end px-2 py-4">
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

                      const isSequence =
                        prevMsg &&
                        prevMsg.sender_id === msg.sender_id &&
                        prevMsg.message_type !== "system" &&
                        msg.message_type !== "system" &&
                        new Date(msg.created_at).getTime() -
                          new Date(prevMsg.created_at).getTime() <
                          60000;

                      const senderLabel = isMe
                        ? "멘토 (나)"
                        : selectedStudent.name;
                      const timeLabel = new Date(
                        msg.created_at,
                      ).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      if (msg.message_type === "system") {
                        return (
                          <div
                            key={msg.id}
                            className="my-4 flex w-full justify-start pl-12"
                          >
                            {msg.body?.startsWith("MEETING_CONFIRMED:") ? (
                              <MeetingConfirmedMessage
                                requestId={msg.body.split(":")[1]}
                                isSender={isMe}
                              />
                            ) : (
                              <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-[11px] text-gray-500">
                                {msg.body}
                              </span>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={`group relative flex gap-3 ${
                            isSequence ? "mt-[2px]" : "mt-5"
                          }`}
                        >
                          <div className="flex w-10 flex-shrink-0 flex-col items-center">
                            {!isSequence ? (
                              <div
                                className={`h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white shadow-sm ${
                                  isMe
                                    ? "flex items-center justify-center bg-[linear-gradient(135deg,_var(--chat-accent),_var(--chat-accent-2))] text-sm font-bold text-white"
                                    : "bg-slate-200"
                                }`}
                              >
                                {isMe ? (
                                  mentorAvatarUrl ? (
                                    <img
                                      src={mentorAvatarUrl}
                                      alt="mentor profile"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    "멘"
                                  )
                                ) : selectedStudent?.avatarUrl ? (
                                  <img
                                    src={selectedStudent.avatarUrl}
                                    alt="profile"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  (selectedStudent?.name?.[0] ?? "멘")
                                )}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex max-w-[75%] flex-col items-start">
                            {!isSequence && (
                              <div className="mb-1 flex flex-wrap items-end gap-2">
                                <span className="text-[14px] font-semibold text-slate-900">
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

                            <div className="flex w-full flex-col items-start gap-1">
                              {msg.body &&
                              msg.message_type !== "meeting_request" ? (
                                <div className="break-words whitespace-pre-wrap text-left text-[15px] leading-relaxed text-slate-800">
                                  {msg.body}
                                </div>
                              ) : null}

                              {msg.message_type === "meeting_request" &&
                              msg.body?.startsWith("MEETING_REQUEST:") ? (
                                <div className="mt-1">
                                  <MentorMeetingRequestCard
                                    requestId={msg.body.split(":")[1]}
                                  />
                                </div>
                              ) : null}

                              {msg.chat_attachments?.length ? (
                                <div className="mt-1 flex flex-col items-start gap-2">
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
                                          className="max-w-[280px] rounded-xl border border-slate-100 bg-white shadow-sm"
                                        />
                                      );
                                    }

                                    return (
                                      <a
                                        key={attachment.id}
                                        href={attachment.signed_url ?? "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                                      >
                                        <Paperclip
                                          size={14}
                                          className="text-slate-400"
                                        />
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
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-2 opacity-0"
                  }`}
                  aria-label="최신 메시지로 이동"
                >
                  <ArrowDown className="h-5 w-5" />
                </button>
              </div>

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
                        onChange={(event) =>
                          handleSendFiles(event.target.files)
                        }
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
                      disabled={
                        !inputText.trim() || !selectedStudentId || isSending
                      }
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
              {isLoading
                ? "채팅을 불러오는 중..."
                : "대화 상대를 선택해주세요."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
