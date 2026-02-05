import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatTime, generateTimeBlocksFromTasks } from "@/utils/timeUtils";
import { DEFAULT_CATEGORIES } from "@/constants/common";
import { USER_TASKS } from "@/constants/mentee";

interface PlannerDetailViewProps {
    date: Date | null;
    dailyRecord: any;
    mentorDeadlines: any[];
    dailyEvents: any[];
    userTasks?: any[];
    size?: "modal" | "page" | "collection" | "mini";
    showHeader?: boolean;
}

export default function PlannerDetailView({
    date,
    dailyRecord,
    mentorDeadlines,
    dailyEvents,
    userTasks: userTasksProp,
    size = "modal",
    showHeader = true
}: PlannerDetailViewProps) {
    if (!date) return null;

    const router = useRouter();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const isToday = false;
    const memo = dailyRecord?.memo || "";

    const pad2 = (value: number) => String(value).padStart(2, "0");
    const formatDateInput = (target: Date) =>
        `${target.getFullYear()}-${pad2(target.getMonth() + 1)}-${pad2(target.getDate())}`;
    const PLANNER_TASKS_KEY = "planner-day-tasks";

    const [plannerTasks, setPlannerTasks] = useState<any[] | null>(null);
    const [mentorNotice, setMentorNotice] = useState<{ id: string; title: string } | null>(null);

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem(PLANNER_TASKS_KEY);
        if (!raw) {
            setPlannerTasks(null);
            return;
        }
        try {
            const data = JSON.parse(raw) as Record<string, any[]>;
            const key = formatDateInput(date);
            const tasks = data[key];
            setPlannerTasks(Array.isArray(tasks) ? tasks : null);
        } catch {
            setPlannerTasks(null);
        }
    }, [date]);

    const persistPlannerTasks = (nextTasks: any[]) => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem(PLANNER_TASKS_KEY);
        let data: Record<string, any[]> = {};
        if (raw) {
            try {
                data = JSON.parse(raw);
            } catch {
                data = {};
            }
        }
        const key = formatDateInput(date);
        data[key] = nextTasks;
        localStorage.setItem(PLANNER_TASKS_KEY, JSON.stringify(data));
    };

    const rawUserTasks = userTasksProp ?? USER_TASKS.filter(t => t.deadline && isSameDay(t.deadline, date));
    const planTasksFromUser = rawUserTasks.filter((task) => task.taskType === "plan");
    const userTasksFallback = rawUserTasks.filter((task) => task.taskType !== "plan");
    const planEvents = dailyEvents.filter(e => e.taskType === "plan");
    const planTaskMap = new Map<string, any>();
    planTasksFromUser.forEach((task) => {
        planTaskMap.set(String(task.id), task);
    });
    planEvents.forEach((event) => {
        const key = String(event.id);
        if (!planTaskMap.has(key)) {
            planTaskMap.set(key, event);
        }
    });
    const planTasksFallback = Array.from(planTaskMap.values());

    const mentorTasksResolved = plannerTasks
        ? plannerTasks.filter((task) => task.isMentorTask && task.taskType !== "plan")
        : mentorDeadlines;
    const userTasksResolved = plannerTasks
        ? plannerTasks.filter((task) => !task.isMentorTask && task.taskType !== "plan")
        : userTasksFallback;
    const planTasksResolved = plannerTasks
        ? plannerTasks.filter((task) => task.taskType === "plan")
        : planTasksFallback;

    const allTasks = [...mentorTasksResolved, ...userTasksResolved, ...planTasksResolved];

    const isTaskCompleted = (task: any) => {
        const isMentorTask = task.isMentorTask ?? task.taskType === "mentor";
        const isSubmitted = task.status === "submitted" || task.status === "feedback_completed" || !!task.studyRecord;
        if (isMentorTask) return isSubmitted;
        return !!task.completed || !!task.studyRecord;
    };

    const studyTimeBlocks = generateTimeBlocksFromTasks(allTasks);
    const parseTimeValue = (value?: string) => {
        if (!value) return null;
        const [h, m] = value.split(":").map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return null;
        return h * 60 + m;
    };
    const computeStudySeconds = () => {
        let totalMinutes = 0;
        let hasTimeRange = false;

        allTasks.forEach((task) => {
            const start = parseTimeValue(task.startTime);
            const end = parseTimeValue(task.endTime);
            if (start === null || end === null) return;
            if (end <= start) return;
            hasTimeRange = true;
            totalMinutes += end - start;
        });

        if (hasTimeRange) return totalMinutes * 60;
        if (dailyRecord?.studyTime) return dailyRecord.studyTime * 60;
        return 0;
    };
    const studyTimeSeconds = computeStudySeconds();

    const combinedItems = [
        ...mentorTasksResolved.map((task, idx) => ({ ...task, itemType: "mentor", orderIndex: idx })),
        ...userTasksResolved.map((task, idx) => ({ ...task, itemType: "user", orderIndex: mentorTasksResolved.length + idx })),
        ...planTasksResolved.map((event, idx) => ({ ...event, itemType: "plan", orderIndex: mentorTasksResolved.length + userTasksResolved.length + idx }))
    ];

    const getSortedItems = (items: any[]) => {
        return [...items].sort((a, b) => {
            const aTime = parseTimeValue(a.startTime);
            const bTime = parseTimeValue(b.startTime);
            if (aTime !== null && bTime !== null) return aTime - bTime;
            if (aTime !== null) return -1;
            if (bTime !== null) return 1;
            return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        });
    };

    const sessionGroups = DEFAULT_CATEGORIES.map(category => ({
        category,
        items: getSortedItems(combinedItems.filter(item => item.categoryId === category.id))
    }));
    const hasActivity = sessionGroups.some(group => group.items.length > 0);

    const buildTaskSnapshot = () => {
        const normalize = (item: any, itemType: "mentor" | "user" | "plan") => {
            const isMentorTask = item.isMentorTask ?? itemType === "mentor";
            const completed = !!item.completed;
            const nextStatus = isMentorTask ? (item.status ?? "pending") : completed ? "submitted" : "pending";
            return {
                ...item,
                id: String(item.id),
                taskType: itemType === "plan" ? "plan" : itemType,
                isMentorTask,
                completed,
                status: nextStatus,
                startTime: item.startTime,
                endTime: item.endTime,
            };
        };

        return [
            ...mentorTasksResolved.map((task) => normalize(task, "mentor")),
            ...userTasksResolved.map((task) => normalize(task, "user")),
            ...planTasksResolved.map((task) => normalize(task, "plan")),
        ];
    };

    const handleToggleCompletion = (item: any, itemType: "mentor" | "user" | "plan") => {
        const isMentorTask = item.isMentorTask ?? itemType === "mentor";
        if (isMentorTask) {
            setMentorNotice({ id: String(item.id), title: item.title });
            return;
        }

        const targetId = String(item.id);
        const source = plannerTasks ?? buildTaskSnapshot();
        let found = false;
        const nextTasks = source.map((task) => {
            if (String(task.id) !== targetId) return task;
            found = true;
            const nextCompleted = !task.completed;
            return {
                ...task,
                completed: nextCompleted,
                status: nextCompleted ? "submitted" : "pending"
            };
        });

        if (!found) {
            nextTasks.push({
                ...item,
                id: targetId,
                taskType: itemType === "plan" ? "plan" : itemType,
                isMentorTask: false,
                completed: true,
                status: "submitted"
            });
        }

        setPlannerTasks(nextTasks);
        persistPlannerTasks(nextTasks);
    };

    const sizeClass = size === "collection"
        ? "w-[92vw] max-w-[720px] h-[90vh] max-h-[90vh]"
        : size === "page"
            ? "max-w-[520px] md:max-w-[560px]"
            : size === "mini"
                ? "w-full h-full"
                : "max-w-[430px]";
    const aspectClass = size === "collection" || size === "mini" ? "" : "aspect-[3/5]";
    const maxHeightClass = size === "collection" || size === "mini" ? "" : "max-h-[95vh]";

    const containerClass = size === "mini"
        ? "bg-white w-full h-full flex flex-col relative overflow-hidden"
        : `bg-white w-full ${sizeClass} ${aspectClass} ${maxHeightClass} flex flex-col shadow-2xl relative overflow-hidden rounded-md`;

    return (
        <div className={containerClass}>
            {showHeader ? (
                <div className="w-full h-14 border-b border-gray-100 bg-gray-50 px-6 flex items-center justify-between shrink-0">
                    <span className={`text-lg font-bold ${isToday ? "text-primary" : "text-gray-900"}`}>
                        {date.getMonth() + 1}월 {date.getDate()}일 ({dayNames[date.getDay()]})
                    </span>
                    <div className="flex items-baseline gap-1.5 font-black">
                        <span className="text-[9px] uppercase tracking-[0.16em] text-blue-400">Study Time</span>
                        <span className="text-[16px] tabular-nums text-blue-600">{formatTime(studyTimeSeconds)}</span>
                    </div>
                </div>
            ) : null}

            <div className="flex-1 p-2 flex flex-col gap-2 overflow-hidden">
                <div className="w-full bg-sky-50/50 rounded-lg p-3 border border-sky-100/50">
                    <span className="text-xs font-bold text-sky-600 mb-1 block">Daily Memo</span>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed italic">
                        {memo ? `"${memo}"` : "오늘의 메모가 없습니다."}
                    </p>
                </div>

                <div className="flex-1 flex gap-2 w-full overflow-hidden min-h-0">
                    <div className="w-[60%] flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1 min-h-0">
                        {sessionGroups.map((group, index) => {
                            if (group.items.length === 0) return null;
                            return (
                                <div
                                    key={group.category.id}
                                    className={`pt-1 ${index > 0 ? "border-t border-dashed border-gray-200" : ""}`}
                                >
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className={`text-[9px] font-black ${group.category.textColor}`}>
                                            {group.category.name}영역
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const colorClass = group.category.color;
                                            const borderClass = colorClass.replace("bg-", "border-");
                                            const completed = isTaskCompleted(item);
                                            const isMentorTask = item.isMentorTask ?? item.itemType === "mentor";

                                            const checkboxButton = (
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                        handleToggleCompletion(item, item.itemType);
                                                    }}
                                                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${completed ? `${colorClass} ${borderClass}` : "border-gray-300 bg-white"} shrink-0 mt-0.5`}
                                                    aria-label={isMentorTask ? "멘토 과제 완료 규칙 안내" : "완료 체크"}
                                                >
                                                    {completed && <Check size={9} className="text-white" />}
                                                </button>
                                            );

                                            if (item.itemType === "plan") {
                                                return (
                                                    <div key={`plan-${item.id}`} className="relative flex items-start gap-2 px-1.5 py-0.5 -m-0.5 pl-4">
                                                        <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${colorClass}`} />
                                                        {checkboxButton}
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-[11px] font-bold text-gray-800 truncate ${completed ? "text-gray-400 line-through" : ""}`}>{item.title}</p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <Link
                                                    key={`${item.itemType}-${item.id}`}
                                                    href={`/planner/${item.id}`}
                                                    className="relative flex items-start gap-2 hover:bg-gray-50/70 rounded-lg px-1.5 py-0.5 -m-0.5 transition-colors pl-4"
                                                >
                                                    <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${colorClass}`} />
                                                    {checkboxButton}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1 mb-0.5">
                                                            {item.itemType === "mentor" && (
                                                                <span className="bg-primary/10 text-primary text-[7px] font-black px-1 py-0.5 rounded leading-none uppercase tracking-tighter">
                                                                    Mentor
                                                                </span>
                                                            )}
                                                            {/** 제출 상태 라벨 제거 */}
                                                        </div>
                                                        <p className={`text-[11px] font-bold truncate ${completed ? "text-gray-400 line-through" : "text-gray-900"}`}>{item.title}</p>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {!hasActivity && (
                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
                                <span className="text-gray-300 text-sm">등록된 계획 없음</span>
                            </div>
                        )}
                    </div>

                    <div className="w-[40%] border-l border-gray-100 pl-1.5 flex flex-col overflow-y-auto custom-scrollbar min-h-0">
                        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                            {Array.from({ length: 19 }).map((_, idx) => {
                                const hour = 6 + idx;
                                const hourStr = String(hour).padStart(2, "0");

                                return (
                                    <div key={hour} className="flex h-6 border-b border-gray-50 last:border-none group">
                                        <div className="w-8 flex items-center justify-center bg-gray-50/50 border-r border-gray-100 transition-colors group-hover:bg-gray-100">
                                            <span className="text-[8px] font-bold text-gray-400 tabular-nums">{hourStr}</span>
                                        </div>

                                        <div className="flex-1 grid grid-cols-6 relative">
                                            {[0, 1, 2, 3, 4, 5].map((slot) => {
                                                const minute = slot * 10;
                                                const timeKey = `${hourStr}:${minute < 10 ? "0" + minute : minute}`;
                                                const blockCategoryId = studyTimeBlocks[timeKey];
                                                const category = blockCategoryId ? DEFAULT_CATEGORIES.find(c => c.id === blockCategoryId) : null;

                                                return (
                                                    <div
                                                        key={slot}
                                                        className={`border-r border-gray-50 last:border-none relative ${category?.color || "bg-white"} ${category ? "shadow-inner" : ""}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {mentorNotice && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center px-6">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMentorNotice(null)}
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-[28px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="px-6 pt-6 pb-4 border-b border-gray-50">
                            <h3 className="text-lg font-black text-gray-900">멘토 과제는 제출이 필요해요</h3>
                            <p className="text-[11px] text-gray-400 font-bold mt-1">
                                제출을 완료해야 체크됩니다.
                            </p>
                        </div>
                        <div className="px-6 py-5">
                            <div className="rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3 text-[12px] font-bold text-orange-700">
                                "{mentorNotice.title}" 과제는 제출 후 완료 처리됩니다.
                            </div>
                        </div>
                        <div className="px-6 pb-6 pt-1 space-y-2">
                            <button
                                onClick={() => {
                                    router.push(`/planner/${mentorNotice.id}?focus=submit`);
                                    setMentorNotice(null);
                                }}
                                className="w-full h-11 rounded-2xl bg-gray-900 text-white text-sm font-black hover:bg-black"
                            >
                                제출하러 가기
                            </button>
                            <button
                                onClick={() => setMentorNotice(null)}
                                className="w-full h-10 text-[12px] font-bold text-gray-400 hover:text-gray-600"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
