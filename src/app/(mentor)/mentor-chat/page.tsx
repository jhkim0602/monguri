"use client";

import { useState } from "react";
import { Search, Send, MoreVertical, Phone, Video } from "lucide-react";
import { STUDENTS_MOCK } from "@/constants/mentor";

export default function ChatPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("s1");
  const [messageInput, setMessageInput] = useState("");

  const selectedStudent = STUDENTS_MOCK.find((s) => s.id === selectedStudentId);

  // Mock Messages
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "student",
      text: "선생님, 오늘 내주신 국 어 과제 질문이 있어요.",
      time: "오후 5:30",
    },
    {
      id: 2,
      sender: "mentor",
      text: "어떤 부분이 어려웠니? 3번 문제 말하는거야?",
      time: "오후 5:32",
    },
    {
      id: 3,
      sender: "student",
      text: "네 맞아요. 해설지 봐도 이해가 잘 안돼요 ㅠㅠ",
      time: "오후 5:33",
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: "mentor",
        text: messageInput,
        time: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setMessageInput("");
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex">
      {/* Conversation List (Left) */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-4">메시지</h2>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="학생 검색..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-0 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {STUDENTS_MOCK.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`p-4 flex gap-3 cursor-pointer transition-colors ${selectedStudentId === student.id ? "bg-blue-50/50 border-r-2 border-blue-500" : "hover:bg-gray-50"}`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {student.status === "active" && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span
                    className={`text-sm font-bold ${selectedStudentId === student.id ? "text-gray-900" : "text-gray-700"}`}
                  >
                    {student.name}
                  </span>
                  <span className="text-[10px] text-gray-400">오후 5:30</span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  네 알겠습니다! 내일까지 제출할게요.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area (Right) */}
      <div className="flex-1 flex flex-col">
        {selectedStudent ? (
          <>
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                  <img
                    src={selectedStudent.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {selectedStudent.name}
                  </h3>
                  <p className="text-xs text-green-500 font-medium">● 온라인</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  <Phone size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  <Video size={20} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 bg-gray-50/50 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender === "mentor";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm font-medium ${isMe
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-white text-gray-700 border border-gray-100 rounded-bl-none shadow-sm"
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-5 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            대화할 학생을 선택해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
