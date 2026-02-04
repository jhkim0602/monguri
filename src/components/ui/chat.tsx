"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "./components/button";
import { Input } from "./components/input";
import { Avatar, AvatarFallback } from "./components/avatar";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

interface ChatProps {
  roomId: string;
  username: string;
  className?: string;
}

export function Chat({ roomId, username, className }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      sender: username,
      text: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Auto-scroll
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-slate-900 font-semibold flex items-center gap-2">
          실시간 채팅
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </h2>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200"
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-10">
            대화가 없습니다.
            <br />첫 메시지를 보내보세요!
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender === username;
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback
                  className={
                    isMe
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }
                >
                  {msg.sender[0]}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-700">
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-lg text-sm max-w-[240px] break-words shadow-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-none shadow-blue-100"
                      : "bg-white text-slate-800 rounded-tl-none border border-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="relative flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지 입력..."
            className="flex-1 bg-white border-gray-200 text-slate-900 placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          />
          <Button
            onClick={sendMessage}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-md shadow-blue-100"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
