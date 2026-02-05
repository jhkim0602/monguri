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
import { SCHEDULE_HOURS, MENTOR_TASKS, USER_TASKS } from "@/constants/mentee";
import TaskDetailModal from "@/components/mentee/planner/TaskDetailModal";
import { formatTime, generateTimeBlocksFromTasks } from "@/utils/timeUtils";
import Header from "@/components/mentee/layout/Header";
import PlannerTasks from "@/components/mentee/planner/PlannerTasks";
import StudyTimeline from "@/components/mentee/planner/StudyTimeline";

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
    const [tasks, setTasks] = useState<any[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState("");

    // Task Detail Modal State
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    };

    useEffect(() => {
        const initialMentorTasks = MENTOR_TASKS
            .filter(t => t.deadline && isSameDay(t.deadline, currentDate))
            .map(t => ({
                ...t,
                id: String(t.id), // 🔧 ID를 string으로 표준화
                isMentorTask: true,
                completed: t.status === 'feedback_completed',
                timeSpent: 0,
                isRunning: false,
                studyRecord: null
            }));

        // ✏️ USER_TASKS를 constants에서 가져와서 사용
        const initialUserTasks = USER_TASKS.map(t => ({
            ...t,
            timeSpent: 0,
            isRunning: false
        }));

        setTasks([...initialMentorTasks, ...initialUserTasks]);
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



    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        const newTask = {
            id: String(Date.now()), // 🔧 ID를 string으로 생성
            title: newTaskTitle,
            categoryId: selectedCategoryId,
            completed: false,
            timeSpent: 0,
            isRunning: false,
            isMentorTask: false,
            studyRecord: null
        };
        setTasks([...tasks, newTask]);
        setNewTaskTitle("");
    };

    const toggleTaskCompletion = (taskId: number | string) => {
        const taskIdStr = String(taskId);
        setTasks(prev => prev.map(task => {
            if (String(task.id) === taskIdStr) {
                return { ...task, completed: !task.completed };
            }
            return task;
        }));
    };

    const updateTaskTimeRange = (taskId: number | string, startTime: string, endTime: string) => {
        const taskIdStr = String(taskId);
        let targetTask: any = null;

        setTasks(prev => prev.map(task => {
            if (String(task.id) === taskIdStr) {
                targetTask = { ...task, startTime, endTime };
                return targetTask;
            }
            return task;
        }));

        // Auto-fill time blocks is now handled by useEffect on tasks change
    };

    const deleteTask = (taskId: number | string) => {
        const taskIdStr = String(taskId);
        setTasks(prev => prev.filter(task => String(task.id) !== taskIdStr));
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
