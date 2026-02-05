import DailyPlannerCard from "./DailyPlannerCard";
import { generateTimeBlocksFromTasks } from "@/utils/timeUtils";
import { WEEKLY_SCHEDULE, DAILY_RECORDS, MENTOR_TASKS, USER_TASKS } from "@/constants/mentee";

interface PlannerCollectionViewProps {
    currentDate: Date;
    daysInMonth: number;
    isToday: (date: Date) => boolean;
    isSameDay: (d1: Date, d2: Date) => boolean;
    onDateClick: (date: Date) => void;
    customEvents?: { id: string; title: string; categoryId: string; taskType: string; date: string; startTime?: string; endTime?: string; isMentorTask?: boolean }[];
    getPlannerTasksForDate?: (date: Date) => any[] | null;
    mentorTasks?: any[];
    userTasks?: any[];
    weeklySchedule?: Array<{ date: Date; events: any[] }>;
    dailyRecords?: Array<{ date: Date; studyTime?: number; memo?: string; studyTimeBlocks?: { [key: string]: string } }>;
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
    customEvents = [],
    getPlannerTasksForDate,
    mentorTasks,
    userTasks,
    weeklySchedule,
    dailyRecords,
    gridClassName,
    cardClassName,
    fillCard = false,
    fillScale,
    showDateLabel = false,
    dateLabelClassName
}: PlannerCollectionViewProps) {

    const getDailyRecord = (date: Date) => {
         const source = dailyRecords ?? DAILY_RECORDS;
         return source.find(r => isSameDay(r.date, date));
    };

    const parseDateInput = (value: string) => {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
    };

    const getCustomEventsForDate = (date: Date) => {
        return customEvents
            .filter((event) => isSameDay(parseDateInput(event.date), date))
            .map((event) => ({
                id: event.id,
                title: event.title,
                categoryId: event.categoryId,
                taskType: event.taskType || "plan",
                startTime: event.startTime,
                endTime: event.endTime,
                isMentorTask: event.isMentorTask ?? false,
                isCustom: true,
            }));
    };

    return (
        <div className="pb-10">
            {/* Grid Layout: Responsive 3 Columns, Vertical Scrolling */}
            <div className={gridClassName ?? "grid grid-cols-3 gap-0.5 border-t border-gray-200"}>
                {/** Weekday labels are intentionally omitted for compact grid */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isTodayDate = isToday(date);
                    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
                    const plannerTasks = getPlannerTasksForDate ? getPlannerTasksForDate(date) : null;
                    const scheduleSource = weeklySchedule ?? WEEKLY_SCHEDULE;
                    const baseEvents = scheduleSource.find(s => isSameDay(s.date, date))?.events || [];
                    const schedulePlanTasks = baseEvents
                        .filter((event) => event.taskType === "plan")
                        .map((event) => ({
                            id: `plan-${event.id}`,
                            title: event.title,
                            categoryId: event.categoryId,
                            taskType: "plan",
                            startTime: event.startTime,
                            endTime: event.endTime,
                            isMentorTask: event.isMentorTask ?? false,
                            isCustomEvent: true,
                        }));
                    const customPlanTasks = getCustomEventsForDate(date).map((event) => ({
                        id: String(event.id),
                        title: event.title,
                        categoryId: event.categoryId,
                        taskType: "plan",
                        startTime: event.startTime,
                        endTime: event.endTime,
                        isMentorTask: event.isMentorTask ?? false,
                        isCustomEvent: true,
                    }));
                    const mentorSource = mentorTasks ?? MENTOR_TASKS;
                    const userSource = userTasks ?? USER_TASKS;
                    const mentorDeadlines = plannerTasks && plannerTasks.length > 0
                        ? plannerTasks.filter((task) => task.isMentorTask && task.taskType !== "plan")
                        : mentorSource.filter(t => t.deadline && isSameDay(t.deadline, date));
                    const planTasksForDate = plannerTasks && plannerTasks.length > 0
                        ? plannerTasks.filter((task) => task.taskType === "plan")
                        : [...schedulePlanTasks, ...customPlanTasks];
                    const userTasksForDate = plannerTasks && plannerTasks.length > 0
                        ? plannerTasks.filter((task) => !task.isMentorTask && task.taskType !== "plan")
                        : userSource.filter(t => t.deadline && isSameDay(t.deadline, date));
                    const record = getDailyRecord(date);
                    const studyTimeBlocks = plannerTasks && plannerTasks.length > 0
                        ? generateTimeBlocksFromTasks(plannerTasks)
                        : (record?.studyTimeBlocks as { [key: string]: string }) || {};

                    const card = (
                        <DailyPlannerCard
                            key={day}
                            date={date}
                            isToday={isTodayDate}
                            studyTime={record?.studyTime}
                            memo={record?.memo}
                            mentorDeadlines={mentorDeadlines}
                            userTasks={userTasksForDate}
                            dailyEvents={planTasksForDate}
                            studyTimeBlocks={studyTimeBlocks}
                            onClick={() => onDateClick(date)}
                            fill={fillCard}
                            fillScale={fillScale}
                            className={cardClassName}
                        />
                    );

                    if (!showDateLabel) return card;

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
