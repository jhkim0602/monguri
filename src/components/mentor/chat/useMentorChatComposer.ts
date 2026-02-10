"use client";

import { useCallback, useEffect, type RefObject } from "react";
import { supabase } from "@/lib/supabaseClient";
import { upsertGroupedChatNotification } from "@/lib/chatNotificationAggregator";
import { ATTACHMENT_BUCKET, Student } from "./types";

type UseMentorChatComposerParams = {
  mentorId: string | null;
  selectedStudentId: string | null;
  students: Student[];
  inputText: string;
  setInputText: (value: string) => void;
  isSending: boolean;
  setIsSending: (value: boolean) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  shouldScrollToBottomRef: RefObject<boolean>;
};

export function useMentorChatComposer({
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
}: UseMentorChatComposerParams) {
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const nextHeight = Math.min(el.scrollHeight, 180);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > 180 ? "auto" : "hidden";
  }, [inputText, textareaRef]);

  const handleSend = useCallback(async () => {
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
        await upsertGroupedChatNotification({
          client: supabase,
          recipientId: menteeId,
          recipientRole: "mentee",
          mentorMenteeId: selectedStudentId,
          senderName: "멘토",
          messagePreview: trimmed,
          actionUrl: "/chat",
          actorId: mentorId,
          avatarUrl: null,
          refId: message?.id ?? null,
          messageType: "text",
        });
      }
    }

    setIsSending(false);
  }, [
    inputText,
    mentorId,
    selectedStudentId,
    isSending,
    setIsSending,
    setInputText,
    students,
    shouldScrollToBottomRef,
  ]);

  const handleSendFiles = useCallback(
    async (files: FileList | null) => {
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
        await upsertGroupedChatNotification({
          client: supabase,
          recipientId: menteeId,
          recipientRole: "mentee",
          mentorMenteeId: selectedStudentId,
          senderName: "멘토",
          messagePreview: preview,
          actionUrl: "/chat",
          actorId: mentorId,
          avatarUrl: null,
          refId: message.id,
          messageType,
        });
      }

      for (const file of fileArray) {
        const extension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
        const fileName = `${crypto.randomUUID()}.${extension}`;
        const path = `mentor_mentee/${selectedStudentId}/${message.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(ATTACHMENT_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });

        if (uploadError) continue;

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
    },
    [
      mentorId,
      selectedStudentId,
      isSending,
      students,
      setIsSending,
      fileInputRef,
      shouldScrollToBottomRef,
    ],
  );

  return {
    handleSend,
    handleSendFiles,
  };
}
