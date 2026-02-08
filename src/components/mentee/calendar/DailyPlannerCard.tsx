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
  previewScale?: number;
  showScaleControls?: boolean;
  onDecreaseScale?: () => void;
  onIncreaseScale?: () => void;
  scaleLabel?: string;
  aspectClass?: string;
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
  previewScale,
  showScaleControls = false,
  onDecreaseScale,
  onIncreaseScale,
  scaleLabel,
  aspectClass = "aspect-[4/5]",
  className = "",
}: DailyPlannerCardProps) {
  const sizeClass = fill ? "h-full" : aspectClass;
  const scale = fill ? (fillScale ?? previewScale ?? 0.34) : (previewScale ?? 0.24);
  const scaledSize = `${100 / scale}%`;

  const derivedReview =
    mentorReview ||
    dailyEvents.find((e: any) => e.taskType === "daily_review")?.comment ||
    dailyEvents.find((e: any) => e.kind === "daily_review")?.comment;

  return (
    <div
      onClick={onClick}
      className={`relative group bg-white border border-gray-100 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors shadow-sm rounded-sm flex flex-col ${sizeClass} ${className}`}
    >
      {showScaleControls && (
        <div className="absolute right-1 top-1 z-20 flex items-center gap-1 rounded-md border border-gray-200 bg-white/95 px-1 py-1 shadow-sm">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDecreaseScale?.();
            }}
            className="h-5 w-5 rounded bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200"
            aria-label="카드 미리보기 축소"
          >
            -
          </button>
          {scaleLabel ? (
            <span className="min-w-10 text-center text-[10px] font-semibold text-gray-600">
              {scaleLabel}
            </span>
          ) : null}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onIncreaseScale?.();
            }}
            className="h-5 w-5 rounded bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200"
            aria-label="카드 미리보기 확대"
          >
            +
          </button>
        </div>
      )}
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
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{
            transform: `scale(${scale})`,
            width: scaledSize,
            height: scaledSize,
          }}
        >
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
