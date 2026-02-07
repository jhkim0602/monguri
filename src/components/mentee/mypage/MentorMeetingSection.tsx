"use client";

import { useState } from "react";
import {
    ChevronUp,
    ChevronDown,
    Plus,
    Calendar,
    Clock,
    Video,
    MessageSquare,
    ClipboardList
} from "lucide-react";

export default function MentorMeetingSection() {
    const [isSectionOpen, setIsSectionOpen] = useState(true);
    const [openSubSection, setOpenSubSection] = useState<string | null>("request");

    // Form States
    const [subject, setSubject] = useState("");
    const [schedule, setSchedule] = useState("");
    const [memo, setMemo] = useState("");

    const toggleSection = () => setIsSectionOpen(!isSectionOpen);

    const toggleSubSection = (id: string) => {
        setOpenSubSection(openSubSection === id ? null : id);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left">
            {/* Accordion Header (The 'Card') */}
                <button
                    onClick={toggleSection}
                    className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                            <Video size={20} />
                        </div>
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-sm font-bold text-gray-900 leading-none">멘토 미팅</span>
                            {isSectionOpen ? (
                                <span className="text-[11px] text-gray-400 font-medium tracking-tight">
                                    미팅 신청 후 멘토가 줌 링크를 보내면 확정돼요.
                                </span>
                            ) : (
                                <span className="text-[11px] text-gray-400 font-medium tracking-tight">요청 0건 · 확정 0건</span>
                            )}
                        </div>
                    </div>
                    <div className={`transition-transform duration-300 ${isSectionOpen ? 'rotate-180' : ''}`}>
                         <ChevronDown size={20} className="text-gray-400"/>
                    </div>
                </button>

                {/* Content Area */}
                {isSectionOpen && (
                    <div className="border-t border-gray-50">
                    {/* 1. Meeting Request */}
                    <div className="border-b border-gray-50 last:border-0">
                        <button
                            onClick={() => toggleSubSection("request")}
                            className="w-full px-6 py-5 flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary group-active:scale-95 transition-all">
                                    <Plus size={24} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-[15px] font-black text-gray-900 mb-0.5">미팅 신청</h4>
                                    <p className="text-[12px] text-gray-400 font-medium tracking-tight">관련 태스크를 언급하며 요청할 수 있어요.</p>
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 transition-transform ${openSubSection === 'request' ? 'rotate-180' : ''}`}>
                                <ChevronDown size={20} />
                            </div>
                        </button>

                        {openSubSection === "request" && (
                            <div className="px-6 pb-8 space-y-5 animate-in slide-in-from-top-2 duration-300">
                                {/* Form Item: Subject */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 ml-1">미팅 주제</label>
                                    <input
                                        type="text"
                                        placeholder="예: 미적분 킬러문항 풀이 방향 설명 부탁해요"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100/50 rounded-2xl px-5 py-4 text-[14px] font-bold placeholder:text-gray-300 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>


                                {/* Form Item: Schedule */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 ml-1">희망 일정 (선택)</label>
                                    <input
                                        type="text"
                                        placeholder="예: 이번 주 수요일 8시 이후"
                                        value={schedule}
                                        onChange={(e) => setSchedule(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100/50 rounded-2xl px-5 py-4 text-[14px] font-bold placeholder:text-gray-300 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                                    />
                                </div>

                                {/* Form Item: Memo */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-400 ml-1">메모 (선택)</label>
                                    <textarea
                                        placeholder="추가로 공유할 내용이 있다면 적어주세요"
                                        value={memo}
                                        onChange={(e) => setMemo(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100/50 rounded-2xl px-5 py-4 text-[14px] font-bold placeholder:text-gray-300 focus:ring-1 focus:ring-primary/20 outline-none transition-all min-h-[100px] resize-none"
                                    />
                                </div>

                                {/* Zoom Info Box */}
                                <div className="bg-blue-50/30 rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-blue-50/50">
                                    <div className="shrink-0 text-primary/70">
                                        <Video size={18} />
                                    </div>
                                    <p className="text-[10.5px] text-gray-400 font-bold leading-none tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                        멘토가 외부 줌 링크를 보내면 미팅이 확정되고 기록에 표시돼요.
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button className="w-full py-3.5 bg-gray-100/80 rounded-full text-[14px] font-bold text-gray-500 hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 border border-gray-200/20">
                                    미팅 신청하기 <Plus size={16} className="opacity-40" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 2. Request History */}
                    <div className="border-b border-gray-50 last:border-0">
                        <button
                            onClick={() => toggleSubSection("pending")}
                            className="w-full px-6 py-6 flex items-center justify-between group"
                        >
                            <div className="flex-1 text-left">
                                <h4 className="text-[15px] font-black text-gray-900 mb-0.5">미팅 신청 기록</h4>
                                <p className="text-[12px] text-gray-400 font-medium tracking-tight">멘토가 확정하기 전 요청 목록이에요.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-gray-400">0건</span>
                                <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 transition-transform ${openSubSection === 'pending' ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                        </button>
                        {openSubSection === "pending" && (
                            <div className="px-6 pb-8 animate-in slide-in-from-top-2 duration-300">
                                <div className="w-full aspect-[2/1] rounded-[24px] border border-dashed border-gray-100 flex items-center justify-center bg-gray-50/20">
                                    <p className="text-[13px] font-bold text-gray-300">대기 중인 신청이 없어요.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3. Confirmed History */}
                    <div className="border-b border-gray-50 last:border-0">
                        <button
                            onClick={() => toggleSubSection("history")}
                            className="w-full px-6 py-6 flex items-center justify-between group"
                        >
                            <div className="flex-1 text-left">
                                <h4 className="text-[15px] font-black text-gray-900 mb-0.5">미팅 기록</h4>
                                <p className="text-[12px] text-gray-400 font-medium tracking-tight">확정/완료 내역을 모아봐요.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-gray-400">0건</span>
                                <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 transition-transform ${openSubSection === 'history' ? 'rotate-180' : ''}`}>
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                        </button>
                        {openSubSection === "history" && (
                            <div className="px-6 pb-8 animate-in slide-in-from-top-2 duration-300">
                                <div className="w-full aspect-[2/1] rounded-[24px] border border-dashed border-gray-100 flex items-center justify-center bg-gray-50/20">
                                    <p className="text-[13px] font-bold text-gray-300">아직 미팅 기록이 없어요.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            </div>
    );
}
