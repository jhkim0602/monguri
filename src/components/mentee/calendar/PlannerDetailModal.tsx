import { X } from "lucide-react";
import PlannerDetailView from "./PlannerDetailView";
import type { PlannerTaskLike } from "@/lib/menteeAdapters";

interface PlannerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | string | number | null;
  dailyRecord: any;
  mentorDeadlines: any[];
  dailyEvents: any[];
  plannerTasks: PlannerTaskLike[];
  mentorReview?: string;
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
  mentorReview,
  onTaskClick,
}: PlannerDetailModalProps) {
  if (!isOpen || !date) return null;

  const normalizedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(normalizedDate.getTime())) return null;

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getTaskDate = (task: any): Date | null => {
    const source = task?.deadline ?? task?.date ?? null;
    if (!source) return null;

    if (source instanceof Date) {
      return Number.isNaN(source.getTime()) ? null : source;
    }

    const parsed = new Date(source);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  // Filter user tasks for the specific date from the raw plannerTasks array
  const userTasks = plannerTasks.filter(
    (task: any) => {
      const taskDate = getTaskDate(task);
      return taskDate ? isSameDay(taskDate, normalizedDate) : false;
    },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Content - Mobile Simulation */}
      <div
        className="bg-white w-full sm:w-[430px] h-full sm:h-[90vh] sm:max-h-[850px] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden sm:rounded-[40px]"
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
          date={normalizedDate}
          dailyRecord={dailyRecord}
          mentorDeadlines={mentorDeadlines}
          dailyEvents={dailyEvents}
          userTasks={userTasks}
          mentorReview={mentorReview}
          onTaskClick={onTaskClick}
          size="collection"
        />
      </div>
    </div>
  );
}
