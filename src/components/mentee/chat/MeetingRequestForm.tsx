"use client";

import { useState } from "react";
import { X, Plus, Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  mentorMenteeId: string;
  senderId: string;
};

export default function MeetingRequestForm({ isOpen, onClose, mentorMenteeId, senderId }: Props) {
  const [topic, setTopic] = useState("");
  const [times, setTimes] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddTime = () => {
    setTimes([...times, ""]);
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const handleRemoveTime = (index: number) => {
    const newTimes = times.filter((_, i) => i !== index);
    setTimes(newTimes);
  };

  const handleSubmit = async () => {
    if (!topic.trim() || times.some((t) => !t.trim()) || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. Create meeting request
      const { data: request, error: reqError } = await supabase
        .from("meeting_requests")
        .insert({
          mentor_mentee_id: mentorMenteeId,
          requestor_id: senderId,
          topic: topic.trim(),
          preferred_times: times,
          status: "PENDING",
        })
        .select()
        .single();

      if (reqError) throw reqError;

      // 2. Insert chat message (system message type)
      // We store the request ID in the body for now, or just a simple text
      // Ideally we should use a metadata column, but for MVP we can use a special format or just text
      // The design doc said "message_type included 'meeting_request'".
      // We will put the request ID in the body so the ChatPage can render the card.
      const { error: msgError } = await supabase.from("chat_messages").insert({
        mentor_mentee_id: mentorMenteeId,
        sender_id: senderId,
        body: `MEETING_REQUEST:${request.id}`, // Simple protocol for MVP
        message_type: "meeting_request",
      });

      if (msgError) throw msgError;

      onClose();
      setTopic("");
      setTimes([""]);
    } catch (error) {
      console.error("Failed to submit meeting request:", error);
      alert("미팅 신청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:w-[400px] bg-white rounded-t-[30px] sm:rounded-[30px] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <CalendarIcon className="text-primary" size={24} />
            미팅 신청
          </h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Topic */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1">상담 주제</label>
            <input
              type="text"
              placeholder="예: 이번 주 수학 오답노트 점검"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
            />
          </div>

          {/* Times */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-gray-500">희망 일시 (최대 3개)</label>
              {times.length < 3 && (
                <button
                  onClick={handleAddTime}
                  className="text-[11px] font-bold text-primary flex items-center gap-1 hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
                >
                  <Plus size={12} />추가
                </button>
              )}
            </div>

            <div className="space-y-2">
              {times.map((time, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                        type="datetime-local"
                        value={time}
                        onChange={(e) => handleTimeChange(idx, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-[14px] font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all text-gray-600"
                    />
                  </div>
                  {times.length > 1 && (
                    <button
                      onClick={() => handleRemoveTime(idx)}
                      className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !topic || times.some(t => !t)}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-[16px] shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
                <>전송하기</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
