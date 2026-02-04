"use client";

import { useState } from "react";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

export default function SchedulePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Mock Date State
  const currentDate = new Date(2026, 1, 1); // Feb 2026
  const daysInMonth = new Date(2026, 2, 0).getDate(); // 28
  const startDay = new Date(2026, 1, 1).getDay(); // Sunday=0

  const events = [
    {
      date: 5,
      title: "김민지 상담",
      type: "consult",
      color: "bg-orange-100 text-orange-700",
    },
    {
      date: 10,
      title: "전체 라이브 특강",
      type: "live",
      color: "bg-blue-100 text-blue-700",
    },
    {
      date: 12,
      title: "이준호 과제 점검",
      type: "check",
      color: "bg-green-100 text-green-700",
    },
    {
      date: 24,
      title: "중간 점검 회의",
      type: "meeting",
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">일정 관리</h1>
          <p className="text-gray-500 text-sm mt-1">
            수업 및 상담 일정을 관리합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="flex items-center px-4 font-semibold text-gray-700 border border-gray-200 rounded-lg bg-white">
            2026년 2월
          </span>
          <Button variant="outline" size="icon">
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 ml-2 text-white flex flex-row items-center gap-1"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 shrink-0" /> 일정 추가
          </Button>
        </div>
      </div>

      {/* Add Schedule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">새 일정 추가</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  일정 제목
                </label>
                <Input placeholder="예: 김민준 학생 정기 수업" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    날짜
                  </label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
                    시간
                  </label>
                  <Input type="time" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  학생 선택
                </label>
                <select className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>학생을 선택하세요</option>
                  <option>김민준</option>
                  <option>이서연</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  수업 유형
                </label>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold">
                    정규 수업
                  </button>
                  <button className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                    보강
                  </button>
                  <button className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
                    상담
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="hover:bg-gray-100"
              >
                취소
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                일정 생성
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-4 mb-4 text-center">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div key={day} className="text-sm font-semibold text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {/* Empty Cells */}
            {Array(startDay)
              .fill(null)
              .map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="bg-white min-h-[120px] p-2"
                />
              ))}

            {/* Days */}
            {Array(daysInMonth)
              .fill(null)
              .map((_, i) => {
                const day = i + 1;
                const dayEvents = events.filter((e) => e.date === day);
                return (
                  <div
                    key={day}
                    className="bg-white min-h-[120px] p-2 hover:bg-gray-50 transition-colors group relative border-b border-r border-gray-50 last:border-r-0"
                  >
                    <div
                      className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${day === 2 ? "bg-blue-600 text-white" : "text-gray-700"}`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded text-[10px] font-medium truncate ${event.color}`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                    {/* Hover Add Button */}
                    <button className="absolute bottom-2 right-2 p-1.5 rounded-full bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-blue-100 hover:text-blue-600 transition-all">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
