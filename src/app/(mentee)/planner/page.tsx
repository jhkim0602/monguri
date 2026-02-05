"use client";

import { useRef, useState, useEffect } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Plus,
    X,
    MessageCircle,
    ArrowRight,
    Camera
} from "lucide-react";
import { DEFAULT_CATEGORIES, USER_PROFILE } from "@/constants/common";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";
import { generateTimeBlocksFromTasks } from "@/utils/timeUtils";
import Header from "@/components/mentee/layout/Header";
import PlannerTasks from "@/components/mentee/planner/PlannerTasks";
import StudyTimeline from "@/components/mentee/planner/StudyTimeline";
import { supabase } from "@/lib/supabaseClient";
import {
    adaptMentorTasksToUi,
    adaptPlannerTasksToUi,
    type MentorTaskLike,
    type PlannerTaskLike
} from "@/lib/menteeAdapters";

export default function PlannerPage() {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 2)); // Feb 2, 2026
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [selectedCategoryId, setSelectedCategoryId] = useState(DEFAULT_CATEGORIES[0].id);

    const handleAddCategory = (name: string) => {
        const newId = name.toLowerCase().replace(/\s+/g, '-');
        // Simple color rotation or random color
        const colors = [
            { colorHex: "#E9D5FF", textColorHex: "#7E22CE" },
            { colorHex: "#FED7AA", textColorHex: "#C2410C" },
            { colorHex: "#FEF08A", textColorHex: "#A16207" },
            { colorHex: "#C7D2FE", textColorHex: "#4338CA" }
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newCategory = {
            id: newId,
            name,
            ...randomColor
        };

        setCategories([...categories, newCategory]);
        return newCategory;
    };


    // Submission Modal State
    const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
    const [submittingTask, setSubmittingTask] = useState<any>(null);
    const [studyPhoto, setStudyPhoto] = useState<string | null>(null);
    const [studyNote, setStudyNote] = useState("");
    const submissionFileInputRef = useRef<HTMLInputElement>(null);

    // Grid state
    // Grid state
    const [studyTimeBlocks, setStudyTimeBlocks] = useState<{ [key: string]: string }>({});

    // Unified Tasks State
    const [tasks, setTasks] = useState<Array<MentorTaskLike | PlannerTaskLike>>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [menteeId, setMenteeId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedRef = useRef(false);

    // Task Detail Modal State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    const toDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

 

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (!hasLoadedRef.current) {
                setIsLoading(true);
            }
            try {
                const { data } = await supabase.auth.getUser();
                const user = data?.user;
                if (!user) return;

                if (isMounted) {
                    setMenteeId(user.id);
                }

                const dateStr = toDateString(currentDate);
                const [mentorRes, plannerRes, subjectsRes] = await Promise.all([
                    fetch(`/api/mentee/tasks?menteeId=${user.id}`),
                    fetch(`/api/mentee/planner/tasks?menteeId=${user.id}&date=${dateStr}`),
                    fetch(`/api/subjects`)
                ]);

                if (subjectsRes.ok) {
                    const subjectsJson = await subjectsRes.json();
                    if (isMounted && Array.isArray(subjectsJson.subjects) && subjectsJson.subjects.length > 0) {
                        const nextCategories = subjectsJson.subjects.map((subject: any) => {
                            const fallback =
                                DEFAULT_CATEGORIES.find((cat) => cat.id === subject.slug) ??
                                DEFAULT_CATEGORIES[0];
                            return {
                                id: subject.slug ?? subject.id,
                                name: subject.name,
                                colorHex: subject.colorHex ?? fallback.colorHex,
                                textColorHex: subject.textColorHex ?? fallback.textColorHex,
                            };
                        });
                        setCategories(nextCategories);
                        if (!nextCategories.find((cat: any) => cat.id === selectedCategoryId)) {
                            setSelectedCategoryId(nextCategories[0]?.id ?? DEFAULT_CATEGORIES[0].id);
                        }
                    }
                }

                let mentorTasksForDate: MentorTaskLike[] = [];
                if (mentorRes.ok) {
                    const mentorJson = await mentorRes.json();
                    if (Array.isArray(mentorJson.tasks)) {
                        mentorTasksForDate = adaptMentorTasksToUi(mentorJson.tasks)
                            .filter((task) => task.deadline && isSameDay(task.deadline, currentDate))
                            .map((task) => ({
                                ...task,
                                id: String(task.id),
                                timeSpent: 0,
                                isRunning: false,
                                studyRecord: task.studyRecord ?? null,
                            }));
                    }
                }

                let plannerTasksForDate: PlannerTaskLike[] = [];
                if (plannerRes.ok) {
                    const plannerJson = await plannerRes.json();
                    if (Array.isArray(plannerJson.tasks)) {
                        plannerTasksForDate = adaptPlannerTasksToUi(plannerJson.tasks).map((task) => ({
                            ...task,
                            timeSpent: task.timeSpent ?? 0,
                            isRunning: false,
                        }));
                    }
                }

                if (isMounted) {
                    setTasks([...mentorTasksForDate, ...plannerTasksForDate]);
                }
            } finally {
                if (isMounted && !hasLoadedRef.current) {
                    setIsLoading(false);
                    hasLoadedRef.current = true;
                }
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [currentDate]);

    // Sync studyTimeBlocks with tasks
    useEffect(() => {
        setStudyTimeBlocks(generateTimeBlocksFromTasks(tasks));
    }, [tasks]);

    const handlePrevDay = () => {
        const prev = new Date(currentDate);
        prev.setDate(prev.getDate() - 1);
        setCurrentDate(prev);
    };

    const handleNextDay = () => {
        const next = new Date(currentDate);
        next.setDate(next.getDate() + 1);
        setCurrentDate(next);
    };



    const addTask = async () => {
        if (!newTaskTitle.trim()) return;

        if (!menteeId) {
            const newTask = {
                id: String(Date.now()),
                title: newTaskTitle,
                categoryId: selectedCategoryId,
                completed: false,
                timeSpent: 0,
                isRunning: false,
                isMentorTask: false,
                studyRecord: null,
                deadline: currentDate
            };
            setTasks(prev => [...prev, newTask]);
            setNewTaskTitle("");
            return;
        }

        const payload = {
            menteeId,
            title: newTaskTitle.trim(),
            date: toDateString(currentDate),
            subjectSlug: selectedCategoryId || null,
        };

        const response = await fetch("/api/mentee/planner/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const json = await response.json();
            const createdTask = json?.task ? adaptPlannerTasksToUi([json.task])[0] : null;
            if (createdTask) {
                setTasks(prev => [...prev, { ...createdTask, isRunning: false }]);
            }
            setNewTaskTitle("");
        }
    };

    const toggleTaskCompletion = async (taskId: number | string) => {
        const taskIdStr = String(taskId);
        const targetTask = tasks.find(task => String(task.id) === taskIdStr);
        if (!targetTask || targetTask.isMentorTask) return;

        const nextCompleted = !targetTask.completed;
        setTasks(prev => prev.map(task => {
            if (String(task.id) === taskIdStr) {
                return { ...task, completed: nextCompleted };
            }
            return task;
        }));

        if (!menteeId) return;

        await fetch(`/api/mentee/planner/tasks/${taskIdStr}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                menteeId,
                completed: nextCompleted
            })
        });
    };

    const updateTaskTimeRange = (taskId: number | string, startTime: string, endTime: string) => {
        const taskIdStr = String(taskId);

        setTasks(prev => prev.map(task => {
            if (String(task.id) === taskIdStr) {
                if (task.isMentorTask) return task;
                return { ...task, startTime, endTime };
            }
            return task;
        }));

        // Auto-fill time blocks is now handled by useEffect on tasks change
    };

    const deleteTask = async (taskId: number | string) => {
        const taskIdStr = String(taskId);
        const targetTask = tasks.find(task => String(task.id) === taskIdStr);
        if (!targetTask || targetTask.isMentorTask) return;

        setTasks(prev => prev.filter(task => String(task.id) !== taskIdStr));

        if (!menteeId) return;

        await fetch(`/api/mentee/planner/tasks/${taskIdStr}?menteeId=${menteeId}`, {
            method: "DELETE"
        });
    };

    const handleOpenSubmission = (task: any) => {
        setSubmittingTask(task);
        setStudyNote(task.studyRecord?.note || "");
        setStudyPhoto(task.studyRecord?.photo || null);
        setIsSubmissionOpen(true);
    };

    const handleSubmissionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setStudyPhoto(imageUrl);
        }
    };

    const saveSubmission = () => {
        const submittingTaskIdStr = String(submittingTask?.id);
        setTasks(prev => prev.map(task => {
            if (String(task.id) === submittingTaskIdStr) {
                return {
                    ...task,
                    studyRecord: { photo: studyPhoto, note: studyNote },
                    status: 'submitted'
                };
            }
            return task;
        }));
        setIsSubmissionOpen(false);
        setSubmittingTask(null);
    };

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50" />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <Header
                title="학습 플래너"
                variant="clean"
            />

            {/* Date Navigator */}
            <section className="bg-white border-b border-gray-100 px-4 py-3 mb-4">
                <div className="flex items-center justify-between">
                    <button onClick={handlePrevDay} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800">
                            {currentDate.getMonth() + 1}월 {currentDate.getDate()}일 ({['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()]})
                        </h2>
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            D-{USER_PROFILE.dDay}
                        </span>
                    </div>
                    <button onClick={handleNextDay} className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </section>

            <div className="px-4 space-y-4 pb-8">
                {/* Mentee Comment Card */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Flag size={18} className="text-orange-500 fill-orange-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-gray-400 mb-1">멘티 코멘트</p>
                        <input
                            type="text"
                            placeholder="오늘 하루 요약이나 코멘트를 남겨주세요"
                            className="w-full text-sm placeholder-gray-300 border-none p-0 focus:ring-0 font-medium"
                        />
                    </div>
                </div>


                <PlannerTasks
                    tasks={tasks}
                    categories={categories}
                    onToggleCompletion={toggleTaskCompletion}
                    onUpdateTaskTimeRange={updateTaskTimeRange}
                    onDelete={deleteTask}
                    onOpenSubmission={handleOpenSubmission}
                    newTaskTitle={newTaskTitle}
                    setNewTaskTitle={setNewTaskTitle}
                    selectedCategoryId={selectedCategoryId}
                    setSelectedCategoryId={setSelectedCategoryId}
                    onAddTask={addTask}
                    onAddCategory={handleAddCategory}
                />

                <StudyTimeline
                    studyTimeBlocks={studyTimeBlocks}
                    categories={categories}
                />
            </div>

            <TaskDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
            />

            {/* Study Record Submission Modal */}
            {isSubmissionOpen && submittingTask && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSubmissionOpen(false)} />
                    <div className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-white border-b border-gray-50">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">공부 기록 제출</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">Mentor Feed Loop</p>
                            </div>
                            <button onClick={() => setIsSubmissionOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex flex-col items-center">
                                <div className="relative w-full aspect-video bg-gray-50 rounded-[24px] border border-gray-100 overflow-hidden group cursor-pointer" onClick={() => submissionFileInputRef.current?.click()}>
                                    {studyPhoto ? (
                                        <img src={studyPhoto} alt="study-proof" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-gray-300 group-hover:text-primary transition-colors">
                                                <Camera size={24} />
                                            </div>
                                            <p className="text-[11px] font-bold text-gray-400">공부 사진 올리기</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={submissionFileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleSubmissionImageUpload}
                                    />
                                </div>
                                {studyPhoto && (
                                    <button
                                        onClick={() => setStudyPhoto(null)}
                                        className="text-[10px] text-red-500 font-bold mt-2 hover:underline"
                                    >
                                        사진 삭제하기
                                    </button>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">오늘의 배움/느낀점</label>
                                <textarea
                                    rows={3}
                                    value={studyNote}
                                    onChange={(e) => setStudyNote(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none placeholder-gray-300"
                                    placeholder="오늘 공부하며 어려웠던 점이나 새로 알게 된 사실을 적어주세요."
                                />
                            </div>

                            {submittingTask.mentorFeedback && (
                                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <MessageCircle size={10} fill="currentColor" />
                                        Mentor's Feedback
                                    </p>
                                    <p className="text-[11px] font-bold text-gray-700 leading-relaxed italic">
                                        "{submittingTask.mentorFeedback}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="px-6 pb-8 pt-2">
                            <button
                                onClick={saveSubmission}
                                className="w-full bg-gray-900 text-white h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-black shadow-xl shadow-gray-200"
                            >
                                <ArrowRight size={18} />
                                기록 제출하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
