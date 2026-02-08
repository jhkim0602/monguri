import PlannerDetailView from "./PlannerDetailView";

interface DailyPlannerCardProps {
  date: Date;
  isToday: boolean;
  studyTime?: number;
  memo?: string;
  mentorDeadlines: any[];
  userTasks: any[];
  dailyEvents: any[];
  studyTimeBlocks: { [key: string]: string };
  menteeComment?: string | null;
  mentorReview?: string | null;
  onClick?: () => void;
  fill?: boolean;
  fillScale?: number;
  className?: string;
}

export default function DailyPlannerCard({
  date,
  studyTime = 0,
  memo = "",
  mentorDeadlines = [],
  userTasks = [],
  dailyEvents = [],
  menteeComment,
  mentorReview,
  onClick,
  fill = false,
  fillScale,
  className = "",
}: DailyPlannerCardProps) {
  const sizeClass = fill ? "h-full" : "aspect-[3.5/5]";
  const scale = fill ? (fillScale ?? 0.34) : 0.28;
  const scaledSize = fill ? `${100 / scale}%` : undefined;

  const derivedReview =
    mentorReview ||
    dailyEvents.find((e: any) => e.taskType === "daily_review")?.comment ||
    dailyEvents.find((e: any) => e.kind === "daily_review")?.comment;

  return (
    <div
      onClick={onClick}
      className={`relative group bg-white border border-gray-100 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors shadow-sm rounded-2xl flex flex-col ${sizeClass} ${className}`}
    >
      {fill ? (
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{
            transform: `scale(${scale})`,
            width: scaledSize,
            height: scaledSize,
          }}
        >
          <PlannerDetailView
            date={date}
            dailyRecord={{ studyTime, memo, menteeComment, mentorReply: derivedReview }}
            mentorDeadlines={mentorDeadlines}
            userTasks={userTasks}
            dailyEvents={dailyEvents}
            mentorReview={derivedReview}
            size="mini"
            showHeader={false}
          />
        </div>
      ) : (
        <>
          {/* Custom Header - Unscaled */}
          <div className="h-9 px-3 flex items-center justify-between border-b border-gray-50 bg-white z-10">
            <span className="text-xs font-bold text-gray-900">
              {date.getMonth() + 1}월 {date.getDate()}일
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
              {((studyTime || 0) / 3600).toFixed(0).padStart(2, '0')}:{(((studyTime || 0) % 3600) / 60).toFixed(0).padStart(2, '0')}
            </span>
          </div>

          {/* Scaled Body Content */}
          <div className="flex-1 relative bg-white w-full overflow-hidden">
            <div className="absolute top-0 left-0 origin-top-left scale-[0.23] w-[550px] pointer-events-none translate-y-[-10px]">
              <PlannerDetailView
                date={date}
                dailyRecord={{ studyTime, memo, menteeComment, mentorReply: derivedReview }}
                mentorDeadlines={mentorDeadlines}
                userTasks={userTasks}
                dailyEvents={dailyEvents}
                mentorReview={derivedReview}
                size="page"
                showHeader={false}
                magnified={true}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
