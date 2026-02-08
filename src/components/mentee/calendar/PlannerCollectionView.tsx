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
    dateLabelClassName
}: PlannerCollectionViewProps) {

    const getDailyRecord = (date: Date) => {
        return dailyRecords.find(r => r.date && isSameDay(r.date, date));
    };

    return (
        <div className="pb-10">
            {/* Grid Layout: Responsive 3 Columns, Vertical Scrolling */}
            <div className={gridClassName ?? "grid grid-cols-3 gap-0.5 border-t border-gray-200"}>
                {/** Weekday labels are intentionally omitted for compact grid */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
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

                    // Generate time blocks from actual tasks for today
                    const allTasksForDay = [...mentorDeadlines, ...userTasksForDate, ...dailyEvents.filter(e => e.taskType === 'plan')];
                    const studyTimeBlocks = generateTimeBlocksFromTasks(allTasksForDay) || {};

                    const card = (
                        <DailyPlannerCard
                            key={day}
                            date={date}
                            isToday={isTodayDate}
                            studyTime={record?.studyTime}
                            memo={record?.memo}
                            mentorDeadlines={mentorDeadlines}
                            userTasks={userTasksForDate}
                            dailyEvents={dailyEvents}
                            studyTimeBlocks={studyTimeBlocks}
                            menteeComment={record?.menteeComment}
                            mentorReview={record?.mentorReply}
                            onClick={() => onDateClick(date)}
                            fill={fillCard}
                            fillScale={fillScale}
                            className={cardClassName}
                        />
                    );

                    if (!showDateLabel) return card;

                    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

                    return (
                        <div key={day} className="relative h-full">
                            <div
                                className={`pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-gray-700 shadow-sm ${dateLabelClassName ?? ""}`}
                            >
                                {date.getMonth() + 1}/{date.getDate()} ({dayNames[date.getDay()]})
                            </div>
                            {card}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
