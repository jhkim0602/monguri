import DailyPlannerCard from "./DailyPlannerCard";
import { formatTime } from "@/utils/timeUtils";
// Note: In real app, we should pass filtered data, but for now we import constants or receive via props.
// Ideally, the page should fetch/filter and pass just what's needed.
// For now, let's keep the isSameDay logic or utility here?
// Better to pass utility or import it.
import { WEEKLY_SCHEDULE, DAILY_RECORDS } from "@/constants/mentee";
import { MENTOR_TASKS } from "@/constants/common";

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
                    const record = getDailyRecord(date);

                    return (
                        <DailyPlannerCard
                            key={day}
                            date={date}
                            isToday={isTodayDate}
                            studyTime={record?.studyTime}
                            mentorDeadlines={mentorDeadlines}
                            dailyEvents={dailyEvents}
                            onClick={() => onDateClick(date)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
