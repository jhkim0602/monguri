"use client";

import { X } from "lucide-react";
import TaskDetailView from "./TaskDetailView";

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: any;
}

export default function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
    if (!isOpen || !task) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div
                className="w-full max-w-[430px] bg-white rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header with Close Button */}
                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between shrink-0">
                    <div className="flex-1">
                        <h2 className="text-[17px] font-black text-gray-900 tracking-tight truncate">{task.title}</h2>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                            {task.isMentorTask ? '멘토 과제' : '나의 과제'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all active:scale-90"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Content Area - Uses the unified TaskDetailView */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <TaskDetailView
                        task={task}
                        mode="modal"
                        onClose={onClose}
                    />
                </div>
            </div>
        </div>
    );
}
