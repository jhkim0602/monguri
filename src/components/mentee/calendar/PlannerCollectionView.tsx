import DailyPlannerCard from "./DailyPlannerCard";
import type {
    DailyRecordLike,
    MentorTaskLike,
    PlannerTaskLike,
    ScheduleEventLike
} from "@/lib/menteeAdapters";

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
    plannerTasks
}: PlannerCollectionViewProps) {

    const getDailyRecord = (date: Date) => {
         return dailyRecords.find(r => r.date && isSameDay(r.date, date));
    };

    return (
        <div className="pb-10">
            {/* Grid Layout: Responsive 3 Columns, Vertical Scrolling */}
            <div className="grid grid-cols-3 gap-0.5 border-t border-gray-200">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isTodayDate = isToday(date);
                    const dailyEvents = scheduleEvents.filter(
                        (event) => event.date && isSameDay(event.date, date)
                    );
                    const mentorDeadlines = mentorTasks.filter(
                        (task) => task.deadline && isSameDay(task.deadline, date)
                    );
                    const userTasks = plannerTasks.filter(
                        (task) => task.deadline && isSameDay(task.deadline, date)
                    );
                    const record = getDailyRecord(date);

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
                            studyTimeBlocks={(record?.studyTimeBlocks as { [key: string]: string }) || {}}
                            onClick={() => onDateClick(date)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
