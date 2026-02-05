"use client";

import { ChevronLeft, ChevronDown, ChevronUp, Download, Eye, FileText, Image as ImageIcon, MessageCircle, Upload, CheckCircle2, Book, PenTool, FolderOpen, BookOpen, Edit3, HelpCircle, Folder } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DEFAULT_CATEGORIES } from "@/constants/common";

interface Attachment {
    name: string;
    type: "pdf" | "image";
    url: string;
    previewUrl: string;
}

interface TaskDetailViewProps {
    task: {
        id: string | number;
        title: string;
        description: string;
        status: string;
        badgeColor: {
            bg: string;
            text: string;
        };
        categoryId: string;
        attachments?: Attachment[];
        submissions?: Attachment[];
        mentorComment?: string;
        feedbackFiles?: Attachment[];
        isMentorTask?: boolean;  // 멘토가 설정한 과제인지 여부
        completed?: boolean;
        studyRecord?: {
            photo?: string;
            photos?: string[];
            note?: string
        };
        userQuestion?: string;  // 멘티가 한 질문 (이제 메모와 통합됨)
        hasMentorResponse?: boolean;  // 멘토 응답 여부
    };
}

export default function TaskDetailView({ task }: TaskDetailViewProps) {
    const category = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId) || DEFAULT_CATEGORIES[0];
    const isMentorTask = task.isMentorTask ?? true;  // 기본값: 멘토 과제
    const isCompleted = task.completed || !!task.studyRecord;
    const [memo, setMemo] = useState("");

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Top Header */}
            <header className="bg-white px-4 pt-12 pb-5 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100/50 backdrop-blur-xl">
                <Link href="/planner" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ChevronLeft size={24} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-[17px] font-black text-gray-900 tracking-tight truncate">{task.title}</h1>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5 flex items-center gap-1">
                        {isMentorTask ? '멘토 과제' : '나의 과제'}
                        {isCompleted && ' • 완수됨'}
                    </p>
                </div>
            </header>

            <div className="max-w-[430px] mx-auto px-6 pt-4 pb-8 space-y-6">
                {/* Section 1: Task Information (Unified) - Only for Mentor Tasks */}
                {isMentorTask && (
                    <section className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4 relative overflow-hidden">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${isMentorTask ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {isMentorTask ? '과제 정보' : '학습 목표'}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold ml-auto">
                                    {isMentorTask ? "Mentor's Library" : "Self Planning"}
                                </span>
                            </div>
                            <h2 className="text-[18px] font-black text-gray-900 leading-tight">{task.title}</h2>
                            <p className="text-[13px] text-gray-500 font-medium leading-relaxed mt-1">
                                {task.description || (isMentorTask ? "멘토가 배정한 과제입니다." : "직접 세운 학습 계획입니다.")}
                            </p>
                        </div>

                        {/* Mentor Attachments (Only if they exist) */}
                        {task.attachments && task.attachments.length > 0 && (
                            <div className="pt-2">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">멘토 첨부 파일</p>
                                <div className="space-y-3">
                                    {task.attachments.map((file, idx) => (
                                        <FileCard key={idx} file={file} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${isMentorTask ? 'bg-primary' : 'bg-gray-200'}`} />
                    </section>
                )}

                {/* Section 2: Study Record / Submission (Unified) */}
                <section className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 mb-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${task.studyRecord ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {isMentorTask ? '과제 제출' : '학습 기록'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold ml-auto">
                            {task.studyRecord ? '기록 완료' : '기록 대기'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {task.studyRecord ? (
                            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                                {/* Photos Preview */}
                                <div className="p-3">
                                    {task.studyRecord.photos && task.studyRecord.photos.length > 0 ? (
                                        <div className="flex flex-col gap-4">
                                            {task.studyRecord.photos.map((photo, index) => (
                                                <div key={index} className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative group">
                                                    <img
                                                        src={photo}
                                                        alt={`study record ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold text-gray-900 shadow-lg">상세보기</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : task.studyRecord.photo ? (
                                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative group">
                                            <img
                                                src={task.studyRecord.photo}
                                                alt="study record"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold text-gray-900 shadow-lg">상세보기</button>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>

                                {/* Message/Note Content */}
                                <div className="p-4 bg-white border-t border-gray-100">
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 flex items-center gap-1.5">
                                        <MessageCircle size={12} className="text-gray-400" />
                                        나의 메모
                                    </p>
                                    <p className="text-[13px] text-gray-700 font-medium leading-relaxed italic">
                                        "{task.studyRecord.note || task.userQuestion || "기록된 메모가 없습니다."}"
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Upload UI (When no record exists) */
                            <div className="space-y-5">
                                <button className="w-full py-8 rounded-[24px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 hover:border-primary/20 transition-all group">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:bg-primary/5 group-hover:scale-110 transition-all">
                                        <Upload size={24} />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[13px] font-black text-gray-900 block">오늘 공부 인증하기</span>
                                        <span className="text-[11px] font-bold text-gray-400 mt-0.5 block">사진이나 PDF를 업로드하세요</span>
                                    </div>
                                </button>

                                {/* Shared Memo Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[12px] font-black text-gray-900">멘토에게 남기는 메모</label>
                                        <span className="text-[10px] text-primary font-bold">멘토와 공유됨</span>
                                    </div>
                                    <textarea
                                        value={memo}
                                        onChange={(e) => setMemo(e.target.value)}
                                        placeholder="멘토님께 전달할 메시지나 궁금한 점을 자유롭게 적어주세요."
                                        className="w-full min-h-[100px] p-4 rounded-2xl bg-gray-50 border border-gray-100 text-[13px] font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all resize-none"
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold px-1 italic">
                                        * 과제 제출 시 멘토에게 함께 전달되는 메시지입니다.
                                    </p>
                                </div>

                                {!isMentorTask && (
                                    <p className="text-[11px] text-center text-gray-400 font-medium">
                                        * 자율 학습은 기록 제출이 선택 사항입니다.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Action buttons (only when not completed) */}
                    {!task.studyRecord && (
                        <div className="space-y-3 pt-2">
                            <button className="w-full py-4 rounded-2xl bg-gray-900 text-white text-[13px] font-black flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-xl shadow-gray-200">
                                {isMentorTask ? '과제 제출 완료하기' : '학습 기록 저장하기'}
                            </button>
                        </div>
                    )}
                </section>

                {/* Section 3: Mentor Feedback (Always visible if a record exists or is mentor task) */}
                {(isMentorTask || task.studyRecord) && (
                    <section className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-1 rounded-lg bg-gray-900 text-white text-[10px] font-bold uppercase tracking-tight">
                                    멘토 피드백
                                </span>
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${task.hasMentorResponse ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                }`}>
                                {task.hasMentorResponse ? '답변 완료' : '답변 대기'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Mentor's Response</p>
                                <div className={`min-h-[100px] rounded-[24px] p-5 border transition-colors ${task.hasMentorResponse ? 'bg-primary/5 border-primary/10' : 'bg-gray-50 border-gray-100'}`}>
                                    {task.hasMentorResponse ? (
                                        <p className="text-[14px] text-gray-800 font-bold leading-relaxed">
                                            {task.mentorComment}
                                        </p>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 py-4">
                                            <MessageCircle size={24} className="animate-pulse" />
                                            <p className="text-[12px] font-bold">멘토가 학습 내용을 확인 중입니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div >
    );
}

function FileCard({ file }: { file: Attachment }) {
    return (
        <div className="bg-gray-50 rounded-[24px] border border-gray-100 overflow-hidden group">
            <div className="p-4 flex items-center justify-between border-b border-gray-100/50">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${file.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                        }`}>
                        {file.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[13px] font-bold text-gray-900 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">{file.type}</p>
                    </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                    <Download size={18} />
                </button>
            </div>
            <div className="aspect-video bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {file.type === 'image' ? (
                    <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <FileText size={40} className="text-gray-300" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PDF Preview</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold text-gray-900 shadow-lg flex items-center gap-2">
                        <Eye size={14} /> 미리보기
                    </button>
                </div>
            </div>
        </div>
    );
}
