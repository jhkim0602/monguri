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
    className = ""
}: DailyPlannerCardProps) {
    const sizeClass = fill ? "h-full" : "aspect-[3/5]";
    const scale = fill ? (fillScale ?? 0.34) : 0.28;
    const scaledSize = fill ? `${100 / scale}%` : undefined;

    const derivedReview = mentorReview || dailyEvents.find((e: any) => e.taskType === "daily_review")?.comment || dailyEvents.find((e: any) => e.kind === "daily_review")?.comment;

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
<<<<<<< HEAD

                {/* 2. Main Split View */}
                <div className="flex-1 flex gap-1.5 w-full min-h-0">
                    {/* Left: To-Do List (Detailed Miniature) */}
                    <div className="w-[65%] flex flex-col gap-1 overflow-hidden">
                        {/* Mentor Tasks */}
                        {mentorDeadlines.map(task => {
                            const cat = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId);
                            const colorHex = cat?.colorHex || '#A855F7';

                            return (
                                <div
                                    key={task.id}
                                    className="flex items-start gap-1"
                                >
                                    <div
                                        className={`w-2 h-2 rounded-[1px] flex items-center justify-center border-[0.5px] shrink-0 mt-[1px] ${task.completed ? 'shadow-sm' : 'border-gray-300 bg-white'}`}
                                        style={
                                            task.completed
                                                ? { backgroundColor: colorHex, borderColor: colorHex }
                                                : undefined
                                        }
                                    >
                                        {task.completed && <Check size={4} className="text-white" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-[2px] mb-[1px]">
                                            <span className="bg-primary/10 text-primary text-[4px] font-black px-[2px] py-[1px] rounded-[1px] leading-none uppercase tracking-tighter">
                                                Mentor
                                            </span>
                                            {task.studyRecord && (
                                                <span className="text-[4px] text-emerald-500 font-black bg-emerald-50 px-[2px] py-[1px] rounded-[1px] leading-none">제출</span>
                                            )}
                                        </div>
                                        <p className={`text-[5px] font-bold leading-tight truncate ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* User Tasks */}
                        {userTasks.map(task => {
                            const cat = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId);
                            const colorHex = cat?.colorHex || '#3B82F6';

                            return (
                                <div
                                    key={task.id}
                                    className="flex items-start gap-1"
                                >
                                    <div
                                        className={`w-2 h-2 rounded-[1px] flex items-center justify-center border-[0.5px] shrink-0 mt-[1px] ${task.completed ? 'shadow-sm' : 'border-gray-300 bg-white'}`}
                                        style={
                                            task.completed
                                                ? { backgroundColor: colorHex, borderColor: colorHex }
                                                : undefined
                                        }
                                    >
                                        {task.completed && <Check size={4} className="text-white" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-[2px] mb-[1px]">
                                            {task.studyRecord && (
                                                <span className="text-[4px] text-emerald-500 font-black bg-emerald-50 px-[2px] py-[1px] rounded-[1px] leading-none">제출</span>
                                            )}
                                        </div>
                                        <p className={`text-[5px] font-bold leading-tight truncate ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Self Studies from WEEKLY_SCHEDULE */}
                        {dailyEvents.filter(e => e.taskType === 'plan').map((event, idx) => {
                            const cat = DEFAULT_CATEGORIES.find(c => c.id === event.categoryId);
                            const borderColor = cat?.colorHex || '#E5E7EB';
                            return (
                                <div key={`evt-${idx}`} className="flex items-start gap-1">
                                    <div
                                        className="w-2 h-2 rounded-full border-[0.5px] bg-white shrink-0 mt-[1px]"
                                        style={{ borderColor }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[5px] font-bold text-gray-800 leading-tight truncate">{event.title}</p>
                                        <p className="text-[4px] text-gray-400 leading-none mt-[1px]">{cat?.name}</p>
                                    </div>
                                </div>
                            );
                        })}

                        {!hasActivity && (
                            <div className="flex-1 flex items-center justify-center border border-dashed border-gray-100 rounded">
                                <span className="text-gray-200 text-[6px]">Empty</span>
                            </div>
                        )}
                    </div>

                    {/* Right: Time Table (Visual Miniature) */}
                    <div className="w-[35%] border-l border-gray-100 pl-0.5 flex flex-col">
                        <div className="bg-white rounded-[2px] border border-gray-100 overflow-hidden flex-1">
                            {Array.from({ length: 19 }).map((_, idx) => {
                                const hour = 6 + idx;
                                const hourStr = String(hour).padStart(2, '0');

                                return (
                                    <div key={hour} className="flex h-1 border-b border-gray-50 last:border-none group">
                                        <div className="w-2 flex items-center justify-center bg-gray-50/50 border-r border-gray-100">
                                            <span className="text-[4px] font-bold text-gray-400 tabular-nums leading-none">{hourStr}</span>
                                        </div>

                                        <div className="flex-1 grid grid-cols-6">
                                            {[0, 1, 2, 3, 4, 5].map((slot) => {
                                                const minute = slot * 10;
                                                const timeKey = `${hourStr}:${minute < 10 ? '0' + minute : minute}`;
                                                const blockCategoryId = studyTimeBlocks[timeKey];
                                                const category = blockCategoryId ? DEFAULT_CATEGORIES.find(c => c.id === blockCategoryId) : null;

                                                return (
                                                    <div
                                                        key={slot}
                                                        className="border-r border-gray-50 last:border-none"
                                                        style={
                                                            category
                                                                ? { backgroundColor: category.colorHex }
                                                                : undefined
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
=======
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
>>>>>>> origin/sunbal
                </div>
            </div>
            )}
        </div>
    );
}
