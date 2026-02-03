"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import {
  MessageCircle,
  CheckCircle2,
  Clock,
  ThumbsUp,
  XCircle,
  Search,
  Filter,
  Image as ImageIcon,
} from "lucide-react";

// Mock Data: Uploads from Mentees
const UPLOADS = [
  {
    id: 1,
    student: "김민준",
    type: "homework", // homework, planner, question
    title: "수학 I 쎈 B단계 풀이 인증",
    content:
      "30페이지부터 35페이지까지 풀었습니다. 14번 문제는 해설봐도 잘 모르겠어요 ㅠㅠ",
    images: [
      "https://images.unsplash.com/photo-1632571401005-458e9d244591?w=800&q=80",
    ],
    timestamp: "10분 전",
    status: "pending", // pending, reviewed
  },
  {
    id: 2,
    student: "이서연",
    type: "planner",
    title: "오늘 공부 플래너 인증",
    content:
      "오늘 목표했던 영어 단어 50개 다 외웠습니다! 내일은 수학에 좀 더 집중할게요.",
    images: [
      "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=800&q=80",
    ],
    timestamp: "1시간 전",
    status: "pending",
  },
  {
    id: 3,
    student: "박지훈",
    type: "question",
    title: "미적분 급수 질문있습니다",
    content:
      "이 문제에서 수렴 조건이 이해가 안 가요. 왜 r이 1이어도 되는 건가요?",
    images: [
      "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&q=80",
    ],
    timestamp: "2시간 전",
    status: "reviewed",
    feedback:
      "r이 1일 때는 공비가 1인 등비수열이니까 첫째항이 그대로 계속 더해져서 발산하지 않을까? 다시 확인해봐!",
  },
];

export default function FeedbackPage() {
  const [uploads, setUploads] = useState(UPLOADS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const selectedItem = uploads.find((u) => u.id === selectedId);

  const handleReview = (id: number, type: "approve" | "revise") => {
    // In real app, submit review to DB
    const newStatus = "reviewed";
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)),
    );
    setComment("");
    alert(
      type === "approve"
        ? "피드백이 전송되었습니다! (참 잘했어요)"
        : "피드백이 전송되었습니다! (보완 요청)",
    );
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      {/* Left List */}
      <div className="w-full md:w-1/3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900">도착한 인증 & 질문</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {uploads.filter((u) => u.status === "pending").length}건 대기중
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {uploads.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedId === item.id
                  ? "bg-blue-50 border-l-4 border-l-blue-600"
                  : "border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    item.type === "homework"
                      ? "bg-indigo-100 text-indigo-600"
                      : item.type === "planner"
                        ? "bg-green-100 text-green-600"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {item.type}
                </span>
                <span className="text-xs text-gray-400">{item.timestamp}</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                {item.content}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                  {item.student[0]}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {item.student}
                </span>
                {item.status === "reviewed" && (
                  <CheckCircle2 className="w-3 h-3 text-green-500 ml-auto" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Detail */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {selectedItem ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md ${
                      selectedItem.type === "homework"
                        ? "bg-indigo-100 text-indigo-600"
                        : selectedItem.type === "planner"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedItem.type.toUpperCase()}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedItem.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-900">
                    {selectedItem.student}
                  </span>
                  <span>•</span>
                  <span>{selectedItem.timestamp}</span>
                </div>
              </div>
              {selectedItem.status === "pending" ? (
                <div className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-bold rounded-full animate-pulse">
                  답변 대기중
                </div>
              ) : (
                <div className="px-3 py-1 bg-gray-100 text-gray-500 text-sm font-bold rounded-full">
                  완료됨
                </div>
              )}
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedItem.content}
              </p>

              {selectedItem.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedItem.images.map((img, i) => (
                    <div
                      key={i}
                      className="rounded-xl overflow-hidden border border-gray-200 shadow-sm group relative"
                    >
                      <img
                        src={img}
                        alt="Proof"
                        className="w-full h-auto object-cover"
                      />
                      <div className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg cursor-pointer hover:bg-black/70">
                        <Search className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedItem.feedback && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> 보낸 피드백
                  </div>
                  <p className="text-blue-900 text-sm">
                    {selectedItem.feedback}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Action */}
            {selectedItem.status === "pending" && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="mb-3">
                  <label className="text-sm font-bold text-gray-700 mb-1 block">
                    피드백 작성
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none h-24"
                    placeholder="학생에게 해줄 조언이나 칭찬을 적어주세요..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleReview(selectedItem.id, "revise")}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    다시 하기 (반려)
                  </Button>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => handleReview(selectedItem.id, "approve")}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />참 잘했어요 (전송)
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100">
              <MessageCircle className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              선택된 항목이 없습니다
            </h3>
            <p className="text-sm">
              왼쪽 리스트에서 피드백할 내용을 선택해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
