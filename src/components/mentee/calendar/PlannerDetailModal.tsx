import { X } from "lucide-react";
import PlannerDetailView from "./PlannerDetailView";

interface PlannerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    dailyRecord: any;
    mentorDeadlines: any[];
    dailyEvents: any[];
    userTasks?: any[];
}

export default function PlannerDetailModal({
    isOpen,
    onClose,
    date,
    dailyRecord,
    mentorDeadlines,
    dailyEvents,
    userTasks: userTasksProp
}: PlannerDetailModalProps) {
    if (!isOpen || !date) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
                <PlannerDetailView
                    date={date}
                    dailyRecord={dailyRecord}
                    mentorDeadlines={mentorDeadlines}
                    dailyEvents={dailyEvents}
                    userTasks={userTasksProp}
                    size="collection"
                />
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-50"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
}
