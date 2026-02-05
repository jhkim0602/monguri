import { X } from "lucide-react";
import PlannerDetailView from "./PlannerDetailView";
import type { PlannerTaskLike } from "@/lib/menteeAdapters";

interface PlannerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    dailyRecord: any;
    mentorDeadlines: any[];
    dailyEvents: any[];
    plannerTasks: PlannerTaskLike[];
    onTaskClick?: (task: any) => void;
}

export default function PlannerDetailModal({
    isOpen,
    onClose,
    date,
    dailyRecord,
    mentorDeadlines,
    dailyEvents,
    plannerTasks,
    onTaskClick
}: PlannerDetailModalProps) {
    if (!isOpen || !date) return null;

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    // Filter user tasks for the specific date from the raw plannerTasks array
    const userTasks = plannerTasks.filter(
        (task) => task.deadline && isSameDay(task.deadline, date)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Content - Big Planner Page */}
            <div
                className="bg-white w-full max-w-[720px] max-h-[95vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden rounded-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button (Absolute Top Right) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-50"
                >
                    <X size={24} />
                </button>

                <PlannerDetailView
                    date={date}
                    dailyRecord={dailyRecord}
                    mentorDeadlines={mentorDeadlines}
                    dailyEvents={dailyEvents}
                    userTasks={userTasks}
                    onTaskClick={onTaskClick}
                    size="collection"
                />
            </div>
        </div>
    );
}
