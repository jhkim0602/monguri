"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { Send, Search, MoreVertical, Phone } from "lucide-react";

const STUDENTS = [
  {
    id: 1,
    name: "김민준",
    lastMsg: "아 넵! 해설지 봐도 이해가 안 가서요 ㅠㅠ",
    time: "10:32 AM",
    unread: 2,
  },
  {
    id: 2,
    name: "이서연",
    lastMsg: "선생님 오늘 수업 자료 올려주실 수 있나요?",
    time: "어제",
    unread: 0,
  },
  { id: 3, name: "박지훈", lastMsg: "넵 알겠습니다!", time: "어제", unread: 0 },
];

export default function MentorChatPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(1);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "me",
      text: "민준아, 어제 올린 수학 숙제 잘 봤어! 4번 문제 다시 풀어보는 게 좋겠더라.",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "student",
      text: "아 넵! 해설지 봐도 이해가 안 가서요 ㅠㅠ",
      time: "10:32 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: "me",
        text: inputText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInputText("");
  };

  const selectedStudent = STUDENTS.find((s) => s.id === selectedStudentId);

  return (
    <div className="h-[calc(100vh-6rem)] bg-white rounded-xl border border-gray-200 shadow-sm flex overflow-hidden">
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-gray-900 mb-3">채팅 목록</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="학생 이름 검색..."
              className="pl-9 bg-gray-50 border-none h-10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {STUDENTS.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition-colors border-b border-gray-50 ${
                selectedStudentId === student.id
                  ? "bg-white border-l-4 border-l-blue-600 shadow-sm"
                  : "border-l-4 border-l-transparent"
              }`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                  {student.name[0]}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-bold text-gray-900 text-sm">
                    {student.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {student.time}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {student.lastMsg}
                </p>
              </div>
              {student.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {student.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Room */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedStudent ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg">
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {selectedStudent.name}
                  </h3>
                  <span className="text-xs text-gray-400">
                    마지막 접속: 방금 전
                  </span>
                </div>
              </div>
              <div className="flex gap-2 text-gray-400">
                <button className="p-2 hover:bg-gray-50 rounded-full">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-50 rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[60%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.sender === "me"
                        ? "bg-gray-900 text-white rounded-tr-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 self-end ml-2 mr-2 mb-1">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="relative">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="메시지를 입력하세요..."
                  className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  onClick={handleSend}
                  className="absolute right-2 top-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            대화 상대를 선택해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
