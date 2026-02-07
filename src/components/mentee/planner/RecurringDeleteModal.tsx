
"use client";

import { X } from "lucide-react";

interface RecurringDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleteSingle: () => void;
    onDeleteAll: () => void;
}

export default function RecurringDeleteModal({
    isOpen,
    onClose,
    onDeleteSingle,
    onDeleteAll
}: RecurringDeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-[320px] bg-white rounded-[24px] shadow-2xl p-6 relative animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="text-center mb-6">
                    <h3 className="text-lg font-black text-gray-900 mb-2">반복 일정 삭제</h3>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        이 일정은 반복되는 일정입니다.<br />
                        어떻게 삭제하시겠습니까?
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={onDeleteAll}
                        className="w-full py-3.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                    >
                        모든 반복 일정 삭제
                    </button>
                    <button
                        onClick={onDeleteSingle}
                        className="w-full py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                        이 일정만 삭제
                    </button>
                    <button
                        onClick={onClose}
                        className="mt-2 text-xs text-gray-400 font-bold hover:text-gray-600 underline decoration-gray-300 underline-offset-4"
                    >
                        취소하기
                    </button>
                </div>
            </div>
        </div>
    );
}
