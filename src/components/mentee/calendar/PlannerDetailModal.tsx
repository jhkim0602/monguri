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
  skipDateFilter?: boolean;
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
  skipDateFilter = false,
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

  const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  const toDateKey = (value: Date | string | number | null | undefined) => {
    if (!value) return null;
    if (typeof value === "string" && DATE_ONLY_PATTERN.test(value)) return value;
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
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
  const selectedDateKey = toDateKey(normalizedDate);
  const userTasks = skipDateFilter
    ? plannerTasks
    : plannerTasks.filter((task: any) => {
        const taskDateKey = toDateKey(task?.deadline ?? task?.date ?? null);
        if (selectedDateKey && taskDateKey) {
          return taskDateKey === selectedDateKey;
        }
        const taskDate = getTaskDate(task);
        return taskDate ? isSameDay(taskDate, normalizedDate) : false;
      });

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
