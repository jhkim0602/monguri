"use client";

import { useState } from "react";
import { X, Upload, MessageSquare, Info, FileText, Download } from "lucide-react";

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: {
        title: string;
        subject: string;
        description?: string;
        mentorFeedback?: string;
        weakness?: string;
        worksheet?: {
            title: string;
            url: string;
            type: string;
        };
    } | null;
}

export default function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'worksheet' | 'submit'>('worksheet');

    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-[430px] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                <div className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-primary text-[10px] font-bold rounded mb-2 uppercase tracking-tight">
                                Mentor Task
                            </span>
                            <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('worksheet')}
                            className={`flex-1 pb-3 text-sm font-bold transition-colors relative ${activeTab === 'worksheet' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            학습 자료
                            {activeTab === 'worksheet' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('submit')}
                            className={`flex-1 pb-3 text-sm font-bold transition-colors relative ${activeTab === 'submit' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            과제 제출
                            {activeTab === 'submit' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900" />}
                        </button>
                    </div>
                </div>

                <div className="p-6 pt-4">
                    {activeTab === 'worksheet' ? (
                        <div className="space-y-6">
                            {/* Weakness & Goal */}
                            {task.weakness && (
                                <div className="bg-red-50 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                                            <Info size={14} className="text-red-500" />
                                        </div>
                                        <span className="text-xs font-bold text-red-500">약점 맞춤 솔루션</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-sm mb-1">
                                        {task.weakness}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        이 약점을 보완하기 위해 선정된 학습지입니다.
                                    </p>
                                </div>
                            )}

                            {/* Worksheet Card */}
                            {task.worksheet ? (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">연계 학습지</h4>
                                    <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                            <FileText size={20} className="text-gray-500 group-hover:text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[10px] font-bold bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                                    {task.worksheet.type}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors">
                                                {task.worksheet.title}
                                            </p>
                                        </div>
                                        <button className="p-2 text-gray-400 group-hover:text-primary transition-colors">
                                            <Download size={20} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    등록된 학습지가 없습니다.
                                </div>
                            )}

                            {/* Task Description */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2">상세 설명</h4>
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {task.description || "등록된 상세 설명이 없습니다."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* File Upload Zone */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 mb-3 ml-1">
                                    <Upload size={14} /> 과제 제출 (이미지/PDF)
                                </label>
                                <div className="border-2 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 bg-white hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer group">
                                    <div className="w-12 h-12 bg-blue-50 text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm text-gray-400 font-medium">클릭하여 파일을 업로드하세요</p>
                                </div>
                            </div>

                            {/* Mentee Comment */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-blue-500 mb-3 ml-1">
                                    <MessageSquare size={14} /> 멘티 과제 코멘트
                                </label>
                                <textarea
                                    placeholder="과제를 진행하며 느낀 점이나 질문을 남겨주세요!"
                                    className="w-full h-32 p-4 rounded-2xl bg-blue-50/30 border border-blue-50 text-sm placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            {/* Mentor Feedback Section */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-bold text-purple-500 mb-3 ml-1">
                                    <Info size={14} /> 멘토 피드백
                                </label>
                                <div className="p-4 rounded-2xl bg-gray-50 flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                                    <p className="text-sm text-gray-400 font-medium italic">
                                        {task.mentorFeedback || "아직 피드백이 등록되지 않았습니다."}
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all active:scale-[0.98]"
                            >
                                과제 제출 완료하기
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
