"use client";

import { ChevronLeft, Download, Eye, FileText, Image as ImageIcon, MessageCircle, Upload, CheckCircle2 } from "lucide-react";
import Link from "next/link";
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
        badgeColor: string;
        categoryId: string;
        attachments?: Attachment[];
        submissions?: Attachment[];
        mentorComment?: string;
        feedbackFiles?: Attachment[];
    };
}

export default function TaskDetailView({ task }: TaskDetailViewProps) {
    const category = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId) || DEFAULT_CATEGORIES[0];

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Top Header */}
            <header className="bg-white px-6 py-5 flex items-center gap-4 sticky top-0 z-10 border-b border-gray-100/50 backdrop-blur-xl">
                <Link href="/planner" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-[17px] font-black text-gray-900 tracking-tight truncate">{task.title}</h1>
            </header>

            <div className="max-w-[430px] mx-auto px-6 py-8 space-y-6">
                {/* Section 1: 과제 정보 (Mentor's Library) */}
                <section className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-[15px] font-black text-gray-900">과제 정보</h3>
                            <span className="text-[10px] text-gray-400 font-bold">선생님 자료실 (Mentor's Library)</span>
                        </div>
                        <h2 className="text-[18px] font-black text-gray-900 leading-tight">{task.title}</h2>
                        <p className="text-[13px] text-gray-500 font-medium leading-relaxed mt-1">
                            {task.description}
                        </p>
                    </div>

                    <div className="pt-2">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">선생님 첨부 파일</p>
                        <div className="space-y-3">
                            {task.attachments?.map((file, idx) => (
                                <FileCard key={idx} file={file} />
                            ))}
                            {(!task.attachments || task.attachments.length === 0) && (
                                <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-100">
                                    <p className="text-[11px] text-gray-400 font-bold">첨부된 자료가 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Section 2: 제출 파일 (My Library) */}
                <section className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-5">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-black text-gray-900">제출 파일</h3>
                        <span className="text-[10px] text-gray-400 font-bold">내 자료실 (My Library)</span>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">학생 제출 파일</p>
                        <div className="space-y-3">
                            {task.submissions?.map((file, idx) => (
                                <FileCard key={idx} file={file} />
                            ))}
                            <button className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors group">
                                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                                    <Upload size={18} />
                                </div>
                                <span className="text-[11px] font-bold text-gray-400">파일 추가하기 (PDF, 이미지)</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <button className="w-full py-4 rounded-2xl bg-white border border-gray-900 text-gray-900 text-[13px] font-black flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all">
                            <FileText size={16} />
                            내 자료실에서 가져오기
                        </button>
                        <button className="w-full py-4 rounded-2xl bg-gray-900 text-white text-[13px] font-black flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all shadow-xl shadow-gray-200">
                            제출하기
                        </button>
                    </div>
                </section>

                {/* Section 3: 선생님 피드백 */}
                <section className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-black text-gray-900">선생님 피드백</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${task.status === 'feedback_completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                            }`}>
                            {task.status === 'feedback_completed' ? '피드백 완료' : '피드백 대기'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">선생님 코멘트</p>
                            <div className="min-h-[120px] bg-gray-50 rounded-[24px] p-5 border border-gray-100">
                                {task.mentorComment ? (
                                    <p className="text-[13px] text-gray-700 font-bold leading-relaxed italic">
                                        "{task.mentorComment}"
                                    </p>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 py-4">
                                        <MessageCircle size={24} />
                                        <p className="text-[12px] font-bold">멘토가 확인 중입니다.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {task.feedbackFiles && task.feedbackFiles.length > 0 && (
                            <div>
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">피드백 파일</p>
                                <div className="space-y-3">
                                    {task.feedbackFiles.map((file, idx) => (
                                        <FileCard key={idx} file={file} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
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
                        <p className="text-[12px] font-black text-gray-900 truncate">{file.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{file.type === 'pdf' ? 'PDF Document' : 'Image File'}</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                    <Download size={18} />
                </button>
            </div>
            <div className="px-4 py-3 bg-white/50 flex items-center justify-between">
                <div className="relative w-full aspect-[21/9] bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                    <img src={file.previewUrl} alt="preview" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                        <button className="bg-gray-900/80 backdrop-blur-md text-white px-4 py-2 rounded-xl text-[11px] font-black flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95">
                            <Eye size={14} />
                            미리보기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
