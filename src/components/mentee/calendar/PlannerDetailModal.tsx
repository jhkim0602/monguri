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
    onTaskClick?: (task: any) => void;
    mentorReview?: string;
    onEditReview?: () => void;
}

export default function PlannerDetailModal({
    isOpen,
    onClose,
    date,
    dailyRecord,
    mentorDeadlines,
    dailyEvents,
    userTasks: userTasksProp,
    onTaskClick,
    mentorReview,
    onEditReview
}: PlannerDetailModalProps) {
    if (!isOpen || !date) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Content - Big Planner Page */}
            <div
                className="bg-white w-full max-w-[430px] aspect-[3/5] max-h-[95vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden rounded-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button (Absolute Top Right) */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-50"
                >
                    <X size={24} />
                </button>

                <PlannerDetailView
                    date={date}
                    dailyRecord={dailyRecord}
                    mentorDeadlines={mentorDeadlines}
                    dailyEvents={dailyEvents}
                    userTasks={userTasksProp}
                    mentorReview={mentorReview}
                    onEditReview={onEditReview}
                    onTaskClick={onTaskClick}
                    size="collection"
                />
            </div>
        </div>
    );
}
