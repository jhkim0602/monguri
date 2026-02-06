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
  mentorReview?: string;
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
  mentorReview,
  onClick,
  fill = false,
  fillScale,
  className = "",
}: DailyPlannerCardProps) {
  const sizeClass = fill ? "h-full" : "aspect-[3/5]";
  const scale = fill ? (fillScale ?? 0.34) : 0.28;
  const scaledSize = fill ? `${100 / scale}%` : undefined;

  const derivedReview =
    mentorReview ||
    dailyEvents.find((e: any) => e.taskType === "daily_review")?.comment ||
    dailyEvents.find((e: any) => e.kind === "daily_review")?.comment;

  return (
    <div
      onClick={onClick}
      className={`relative group bg-white border border-gray-100 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors shadow-sm rounded-sm flex flex-col ${sizeClass} ${className}`}
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
            dailyRecord={{ studyTime, memo }}
            mentorDeadlines={mentorDeadlines}
            userTasks={userTasks}
            dailyEvents={dailyEvents}
            mentorReview={derivedReview}
            size="mini"
            showHeader={false}
          />
        </div>
      ) : (
        <div className="absolute inset-0 origin-top-left scale-[0.24] pointer-events-none">
          <div className="w-[520px]">
            <PlannerDetailView
              date={date}
              dailyRecord={{ studyTime, memo }}
              mentorDeadlines={mentorDeadlines}
              userTasks={userTasks}
              dailyEvents={dailyEvents}
              mentorReview={derivedReview}
              size="page"
            />
          </div>
        </div>
      )}
    </div>
  );
}
