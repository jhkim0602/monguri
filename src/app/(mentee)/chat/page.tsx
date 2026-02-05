"use client";

import { useState, useEffect, useRef } from "react";
import {
    ChevronLeft,
    Plus,
    Image as ImageIcon,
    Send,
    Paperclip
} from "lucide-react";
import { useRouter } from "next/navigation";
import { USER_PROFILE } from "@/constants/common";

interface Message {
    id: string;
    text: string;
    sender: 'mentee' | 'mentor';
    timestamp: Date;
}

export default function ChatPage() {
    const router = useRouter();
    const [inputValue, setInputValue] = useState("");

    // Mock Mentor Data
    const mentor = {
        name: "박준혁 멘토",
        status: "온라인",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80",
    };

    // Initial Mock Messages
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "안녕하세요 준혁님! 오늘 올린 수학 과제 피드백 확인했습니다. 킬러 문항 풀이법이 정말 인상적이었어요.",
            sender: 'mentee',
            timestamp: new Date(2026, 1, 5, 14, 20)
        },
        {
            id: '2',
            text: "반가워요! 이해가 잘 되었다니 다행이네요. 특히 22번 문항은 발상의 전환이 필요한 문제라 꼭 다시 한번 복습해보는 걸 추천해요.",
            sender: 'mentor',
            timestamp: new Date(2026, 1, 5, 14, 35)
        },
        {
            id: '3',
            text: "네! 알려주신 대로 좌표평면으로 그려보니 훨씬 명확해졌어요. 혹시 확률과 통계 쪽도 질문 드려도 될까요?",
            sender: 'mentee',
            timestamp: new Date(2026, 1, 5, 14, 40)
        },
        {
            id: '4',
            text: "물론이죠! 어떤 부분이 어려운가요? 내일 1:1 세션 전까지 미리 채팅으로 정리해주면 더 자세히 답변해줄 수 있어요.",
            sender: 'mentor',
            timestamp: new Date(2026, 1, 5, 14, 45)
        }
    ]);

    // Scroll to bottom on entry and new message
    useEffect(() => {
        const scrollToBottom = () => {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        };
        // Delay for rendering
        const timer = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'mentee',
            timestamp: new Date()
        };

        setMessages([...messages, newMessage]);
        setInputValue("");
    };

    return (
        <div className="bg-[#F2F2F7] min-h-screen flex flex-col">
            {/* iOS Dynamic Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-4 pt-10 pb-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-primary hover:bg-gray-100 rounded-full transition-colors active:scale-90"
                    >
                        <ChevronLeft size={28} strokeWidth={2.5} />
                    </button>

                    <div className="flex flex-col items-center">
                        <h2 className="text-[17px] font-black text-gray-900 tracking-tight">{mentor.name}</h2>
                    </div>

                    <div className="w-10" /> {/* Spacer to keep title centered */}
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 px-4 pt-4 pb-8 space-y-4">
                <div className="text-center pb-3">
                    <span className="bg-gray-200/50 text-gray-500 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-white">
                        2026년 2월 5일
                    </span>
                </div>

                {messages.map((msg) => {
                    const isMentee = msg.sender === 'mentee';
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMentee ? 'justify-end' : 'justify-start'} items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                            {!isMentee && (
                                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm border border-white mb-1">
                                    <img src={mentor.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className={`max-w-[75%] px-4 py-3 rounded-[20px] shadow-sm text-[14px] font-bold leading-relaxed tracking-tight
                                ${isMentee
                                    ? 'bg-primary text-white rounded-br-none shadow-blue-100'
                                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                }`}
                            >
                                {msg.text}
                            </div>

                            <span className="text-[10px] text-gray-400 font-bold mb-1 shrink-0">
                                {msg.timestamp.getHours()}:{msg.timestamp.getMinutes().toString().padStart(2, '0')}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* iOS Floating Input Bar */}
            <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-all active:scale-90">
                        <Plus size={24} />
                    </button>

                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="메시지 입력..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="w-full bg-gray-50/50 border border-gray-100 rounded-[22px] px-5 py-3.5 text-[15px] font-bold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 active:scale-90
                            ${inputValue.trim()
                                ? 'bg-primary text-white shadow-lg shadow-blue-200'
                                : 'bg-gray-100 text-gray-300'
                            }`}
                    >
                        <Send size={20} fill={inputValue.trim() ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>
        </div>
    );
}
