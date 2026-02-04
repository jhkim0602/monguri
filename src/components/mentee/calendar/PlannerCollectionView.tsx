import DailyPlannerCard from "./DailyPlannerCard";
import { generateTimeBlocksFromTasks } from "@/utils/timeUtils";
import { WEEKLY_SCHEDULE, DAILY_RECORDS, MENTOR_TASKS, USER_TASKS } from "@/constants/mentee";

interface PlannerCollectionViewProps {
    currentDate: Date;
    daysInMonth: number;
    isToday: (date: Date) => boolean;
    isSameDay: (d1: Date, d2: Date) => boolean;
    onDateClick: (date: Date) => void;
    customEvents?: { id: string; title: string; categoryId: string; taskType: string; date: string }[];
    getPlannerTasksForDate?: (date: Date) => any[] | null;
}

export default function PlannerCollectionView({
    currentDate,
    daysInMonth,
    isToday,
    isSameDay,
    onDateClick,
    customEvents = [],
    getPlannerTasksForDate
}: PlannerCollectionViewProps) {

    const getDailyRecord = (date: Date) => {
         return DAILY_RECORDS.find(r => isSameDay(r.date, date));
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
                isCustom: true,
            }));
    };

    return (
        <div className="pb-10">
            {/* Grid Layout: Responsive 3 Columns, Vertical Scrolling */}
            <div className="grid grid-cols-3 gap-0.5 border-t border-gray-200">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isTodayDate = isToday(date);
                    const plannerTasks = getPlannerTasksForDate ? getPlannerTasksForDate(date) : null;
                    const baseEvents = WEEKLY_SCHEDULE.find(s => isSameDay(s.date, date))?.events || [];
                    const dailyEvents = plannerTasks && plannerTasks.length > 0
                        ? plannerTasks.map((task) => ({
                            id: task.id,
                            title: task.title,
                            categoryId: task.categoryId,
                            taskType: task.isMentorTask ? "mentor" : "user",
                        }))
                        : [...baseEvents, ...getCustomEventsForDate(date)];
                    const mentorDeadlines = plannerTasks && plannerTasks.length > 0
                        ? plannerTasks.filter((task) => task.isMentorTask)
                        : MENTOR_TASKS.filter(t => t.deadline && isSameDay(t.deadline, date));
                    const userTasks = plannerTasks && plannerTasks.length > 0
                        ? plannerTasks.filter((task) => !task.isMentorTask)
                        : USER_TASKS.filter(t => t.deadline && isSameDay(t.deadline, date));
                    const record = getDailyRecord(date);
                    const studyTimeBlocks = plannerTasks && plannerTasks.length > 0
                        ? generateTimeBlocksFromTasks(plannerTasks)
                        : (record?.studyTimeBlocks as { [key: string]: string }) || {};

                    return (
                        <DailyPlannerCard
                            key={day}
                            date={date}
                            isToday={isTodayDate}
                            studyTime={record?.studyTime}
                            memo={record?.memo}
                            mentorDeadlines={mentorDeadlines}
                            userTasks={userTasks}
                            dailyEvents={dailyEvents}
                            studyTimeBlocks={studyTimeBlocks}
                            onClick={() => onDateClick(date)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
