import DailyPlannerCard from "./DailyPlannerCard";
import type {
    DailyRecordLike,
    MentorTaskLike,
    PlannerTaskLike,
    ScheduleEventLike
} from "@/lib/menteeAdapters";
import { generateTimeBlocksFromTasks } from "@/utils/timeUtils";

interface PlannerCollectionViewProps {
    currentDate: Date;
    daysInMonth: number;
    isToday: (date: Date) => boolean;
    isSameDay: (d1: Date, d2: Date) => boolean;
    onDateClick: (date: Date) => void;
    scheduleEvents: ScheduleEventLike[];
    dailyRecords: DailyRecordLike[];
    mentorTasks: MentorTaskLike[];
    plannerTasks: PlannerTaskLike[];
    // Sunbal UI Props
    gridClassName?: string;
    cardClassName?: string;
    fillCard?: boolean;
    fillScale?: number;
    showDateLabel?: boolean;
    dateLabelClassName?: string;
    layoutMode?: "grid" | "feed";
    feedPreviewScale?: number;
    cardAspect?: "planner" | "square";
    previewScale?: number;
}

export default function PlannerCollectionView({
    currentDate,
    daysInMonth,
    isToday,
    isSameDay,
    onDateClick,
    scheduleEvents,
    dailyRecords,
    mentorTasks,
    plannerTasks,
    gridClassName,
    cardClassName,
    fillCard = false,
    fillScale,
    showDateLabel = false,
    dateLabelClassName,
    layoutMode = "grid",
    feedPreviewScale = 0.34,
    cardAspect = "planner",
    previewScale
}: PlannerCollectionViewProps) {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

    const getDailyRecord = (date: Date) => {
        return dailyRecords.find(r => r.date && isSameDay(r.date, date));
    };

    const dayEntries = Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const isTodayDate = isToday(date);
        const dailyEvents = scheduleEvents.filter(
            (event) => event.date && isSameDay(event.date, date)
        );
        const mentorDeadlines = mentorTasks.filter(
            (task) => task.deadline && isSameDay(task.deadline, date)
        );
        const userTasksForDate = plannerTasks.filter(
            (task) => task.deadline && isSameDay(task.deadline, date)
        );
        const record = getDailyRecord(date);

        const allTasksForDay = [...mentorDeadlines, ...userTasksForDate, ...dailyEvents.filter(e => e.taskType === "plan")];
        const studyTimeBlocks = generateTimeBlocksFromTasks(allTasksForDay) || {};
        const hasActivity = allTasksForDay.length > 0 || Boolean(record?.memo) || Boolean(record?.studyTime);

        return {
            day,
            date,
            isTodayDate,
            dailyEvents,
            mentorDeadlines,
            userTasksForDate,
            record,
            studyTimeBlocks,
            hasActivity,
        };
    });

    const renderCard = (
        entry: (typeof dayEntries)[number],
        options?: { key?: string | number; className?: string; previewScale?: number }
    ) => (
        <DailyPlannerCard
            key={options?.key}
            date={entry.date}
            isToday={entry.isTodayDate}
            studyTime={entry.record?.studyTime}
            memo={entry.record?.memo}
            mentorDeadlines={entry.mentorDeadlines}
            userTasks={entry.userTasksForDate}
            dailyEvents={entry.dailyEvents}
            studyTimeBlocks={entry.studyTimeBlocks}
            onClick={() => onDateClick(entry.date)}
            fill={fillCard}
            fillScale={fillScale}
            previewScale={options?.previewScale ?? previewScale}
            cardAspect={cardAspect}
            className={options?.className ?? cardClassName}
        />
    );

    if (layoutMode === "feed") {
        const activeEntries = dayEntries.filter((entry) => entry.hasActivity);
        const displayEntries = activeEntries.length > 0 ? activeEntries : dayEntries;

        return (
            <div className="pb-10">
                <div className={gridClassName ?? "space-y-4"}>
                    {displayEntries.map((entry) => {
                        const totalItems =
                            entry.mentorDeadlines.length +
                            entry.userTasksForDate.length +
                            entry.dailyEvents.length;

                        return (
                            <div
                                key={entry.day}
                                className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm"
                            >
                                <button
                                    onClick={() => onDateClick(entry.date)}
                                    className="w-full px-4 py-3 border-b border-gray-100 flex items-center justify-between text-left"
                                >
                                    <span className="text-[13px] font-black text-gray-800">
                                        {entry.date.getMonth() + 1}/{entry.date.getDate()} ({dayNames[entry.date.getDay()]})
                                    </span>
                                    <span className={`text-[10px] font-bold ${entry.isTodayDate ? "text-primary" : "text-gray-400"}`}>
                                        {entry.isTodayDate ? "TODAY" : `${totalItems}개 일정`}
                                    </span>
                                </button>
                                {renderCard(entry, {
                                    className: "border-0 rounded-none shadow-none",
                                    previewScale: feedPreviewScale,
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="pb-10">
            {/* Grid Layout: Responsive 3 Columns, Vertical Scrolling */}
            <div className={gridClassName ?? "grid grid-cols-3 gap-0.5 border-t border-gray-200"}>
                {/** Weekday labels are intentionally omitted for compact grid */}
                {dayEntries.map((entry) => {
                    const card = renderCard(entry, { key: entry.day });

                    if (!showDateLabel) return card;

                    return (
                        <div key={entry.day} className="relative h-full">
                            <div
                                className={`pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-gray-700 shadow-sm ${dateLabelClassName ?? ""}`}
                            >
                                {entry.date.getMonth() + 1}/{entry.date.getDate()} ({dayNames[entry.date.getDay()]})
                            </div>
                            {card}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
