import { X, Check } from "lucide-react";
import { formatTime } from "@/utils/timeUtils";
import { DEFAULT_CATEGORIES } from "@/constants/common";

interface PlannerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    dailyRecord: any;
    mentorDeadlines: any[];
    dailyEvents: any[];
}

export default function PlannerDetailModal({
    isOpen,
    onClose,
    date,
    dailyRecord,
    mentorDeadlines,
    dailyEvents
}: PlannerDetailModalProps) {
    if (!isOpen || !date) return null;

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const isToday = false;
    const studyTime = dailyRecord?.studyTime || 0;
    const hasActivity = dailyEvents.length > 0 || mentorDeadlines.length > 0;
    const tasksWithFeedback = mentorDeadlines.filter(t => t.mentorFeedback);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Content - Big Planner Page */}
            <div
                className="bg-white w-full max-w-lg aspect-[9/16] max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden rounded-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button (Absolute Top Right) */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 z-50"
                >
                    <X size={24} />
                </button>

                {/* Paper Texture / Header */}
                <div className="w-full h-14 border-b border-gray-100 bg-gray-50 px-6 flex items-center justify-between shrink-0">
                    <span className={`text-lg font-bold ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                        {date.getDate()} ({dayNames[date.getDay()]})
                    </span>
                    {studyTime > 0 && (
                        <span className="text-sm font-mono text-gray-500 font-bold">{formatTime(studyTime)}</span>
                    )}
                </div>

                {/* Body Content - Scaled Up Planner Layout */}
                <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">

                    {/* 1. Memo / Diary Area (Top) - Detailed View */}
                    <div className="w-full bg-yellow-50/50 rounded-lg p-4 border border-yellow-100/50 min-h-[80px]">
                        <span className="text-xs font-bold text-yellow-600 mb-1 block">Daily Memo</span>
                        <p className="text-sm text-gray-700 font-medium leading-relaxed italic">
                            "{dailyRecord?.memo || '오늘의 메모가 없습니다.'}"
                        </p>
                    </div>

                    {/* 2. Main Content: To-Do (Left) vs TimeTable (Right) */}
                    <div className="flex-1 flex gap-6 w-full overflow-hidden">
                        {/* Left: To-Do List (Detailed) */}
                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2">
                            {/* Mentor Tasks */}
                            {mentorDeadlines.map(task => (
                                <div key={task.id} className="flex items-start gap-3">
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${task.completed ? 'bg-purple-500 border-purple-500' : 'border-purple-300 bg-purple-50'}`}>
                                        {task.completed && <Check size={12} className="text-white" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-base font-bold ${task.completed ? 'text-gray-800' : 'text-gray-600'}`}>{task.title}</p>
                                        <p className="text-xs text-purple-500 font-medium">멘토 과제</p>
                                    </div>
                                </div>
                            ))}

                            {/* Self Studies */}
                            {dailyEvents.map((event, idx) => {
                                 const cat = DEFAULT_CATEGORIES.find(c => c.id === event.categoryId);
                                 const colorClass = cat?.color?.replace('bg-', 'border-') || 'border-gray-200';
                                 return (
                                    <div key={`evt-${idx}`} className="flex items-start gap-3">
                                         <div className={`w-5 h-5 rounded-full border-2 ${colorClass} bg-white shrink-0`} />
                                         <div className="flex-1">
                                             <p className="text-base font-bold text-gray-800">{event.title}</p>
                                             <p className="text-xs text-gray-400">{cat?.name}</p>
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

                        {/* Right: Time Table (Visual) - Detailed */}
                        <div className="w-[35%] border-l border-gray-100 pl-4 flex flex-col gap-1 pt-2 overflow-y-auto custom-scrollbar">
                           <span className="text-xs font-bold text-gray-400 mb-2 block text-right">Time Table</span>
                            {/* Real Time Blocks */}
                            {Array.from({ length: 14 }).map((_, idx) => { // 6am to 8pm roughly
                                const hour = 6 + idx;
                                return (
                                    <div key={idx} className="flex gap-2 items-center h-8">
                                        <div className="text-[10px] text-gray-400 w-4 text-right">{hour}</div>
                                        <div className="flex-1 h-full relative">
                                            <div className="absolute top-1/2 w-full h-[1px] bg-gray-100" />
                                            {/* Fake Activity Bar for Demo */}
                                            {hasActivity && idx % 3 !== 0 && (
                                                <div className={`absolute top-1 bottom-1 left-0 right-0 rounded-sm ${idx % 2 === 0 ? 'bg-blue-100' : 'bg-purple-100'}`} />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Feedback Section (Bottom Overlay or Section) */}
                    {/* 3. Feedback Section (Bottom Overlay or Section) */}
                    {tasksWithFeedback.length > 0 && (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 shrink-0">
                             <div className="flex items-center gap-2 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                <span className="text-sm font-bold text-gray-600">멘토 쌤의 피드백</span>
                             </div>
                             {tasksWithFeedback.map(task => (
                                 <div key={task.id} className="text-sm text-gray-500 leading-relaxed">
                                     <span className="font-bold text-gray-600 mr-1">To. {task.title}:</span>
                                     "{task.mentorFeedback}"
                                 </div>
                             ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
