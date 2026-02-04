import DailyPlannerCard from "./DailyPlannerCard";
import { formatTime } from "@/utils/timeUtils";
import { WEEKLY_SCHEDULE, DAILY_RECORDS, MENTOR_TASKS, USER_TASKS } from "@/constants/mentee";

interface PlannerCollectionViewProps {
    currentDate: Date;
    daysInMonth: number;
    isToday: (date: Date) => boolean;
    isSameDay: (d1: Date, d2: Date) => boolean;
    onDateClick: (date: Date) => void;
}

export default function PlannerCollectionView({
    currentDate,
    daysInMonth,
    isToday,
    isSameDay,
    onDateClick
}: PlannerCollectionViewProps) {

    const getDailyRecord = (date: Date) => {
         return DAILY_RECORDS.find(r => isSameDay(r.date, date));
    };

    return (
        <div className="pb-10">
            {/* Grid Layout: Responsive 3 Columns, Vertical Scrolling */}
            <div className="grid grid-cols-3 gap-0.5 border-t border-gray-200">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const isTodayDate = isToday(date);
                    const dailyEvents = WEEKLY_SCHEDULE.find(s => isSameDay(s.date, date))?.events || [];
                    const mentorDeadlines = MENTOR_TASKS.filter(t => t.deadline && isSameDay(t.deadline, date));
                    const userTasks = USER_TASKS.filter(t => t.deadline && isSameDay(t.deadline, date));
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
