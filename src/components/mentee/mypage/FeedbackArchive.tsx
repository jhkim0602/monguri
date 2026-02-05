import { useState, useMemo, useEffect } from "react";
import FeedbackCard from "./FeedbackCard";
import { Search, Library, Calculator, Languages, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { MentorTaskLike, PlannerTaskLike } from "@/lib/menteeAdapters";

interface FeedbackArchiveProps {
    mentorTasks: MentorTaskLike[];
    userTasks?: PlannerTaskLike[];
    onOpenTask?: (task: any) => void;
}

export default function FeedbackArchive({ mentorTasks, userTasks = [], onOpenTask }: FeedbackArchiveProps) {
    const [activeSubject, setActiveSubject] = useState("korean");
    const [openFeedbackId, setOpenFeedbackId] = useState<string | number | null>(null);
    const [starredIds, setStarredIds] = useState<string[]>([]);
    const [showStarredOnly, setShowStarredOnly] = useState(false);

    // Sort & Filter State
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [periodFilter, setPeriodFilter] = useState<'all' | '1month' | '3months'>('all');

    // Persistence for stars
    useEffect(() => {
        const saved = localStorage.getItem("mentee-starred-feedback");
        if (saved) {
            try {
                setStarredIds(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse starred IDs", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("mentee-starred-feedback", JSON.stringify(starredIds));
    }, [starredIds]);

    const toggleStar = (id: string) => {
        setStarredIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const SUBJECTS = [
        { id: 'korean', name: '국어', color: 'emerald', icon: Library },
        { id: 'math', name: '수학', color: 'blue', icon: Calculator },
        { id: 'english', name: '영어', color: 'purple', icon: Languages },
    ];

    // ==========================================
    // 🧠 Data Integration: Map Planner Data to Feedback Format
    // ==========================================
    const FEEDBACK_DATA = useMemo(() => {
        // 1. Filter Mentor Tasks that have feedback
        const mentorFeedbacks = mentorTasks
            .filter(task =>
                task.mentorFeedback &&
                task.mentorFeedback.length > 5 &&
                !task.mentorFeedback.includes("작성 중") &&
                !task.mentorFeedback.includes("대기 중") &&
                !task.mentorFeedback.includes("아직 피드백이 등록되지 않았습니다")
            )
            .map(task => ({
                id: `m-${task.id}`,
                title: generateSimpleSummary(task.mentorFeedback || ""),
                taskTitle: task.title,
                subject: task.subject,
                subjectId: task.categoryId,
                subjectColor: mapSubjectColor(task.categoryId),
                date: task.deadline || new Date(),
                content: task.mentorFeedback,
                originalTask: task, // Store full task for modal
            }));

        // 2. Filter User Tasks that have mentor comments
        const userFeedbacks = userTasks
            .filter(task =>
                task.mentorComment &&
                task.mentorComment.length > 5 &&
                !task.mentorComment.includes("아직 피드백이 등록되지 않았습니다")
            )
            .map(task => ({
                id: `u-${task.id}`,
                title: generateSimpleSummary(task.mentorComment || ""),
                taskTitle: task.title,
                subject: getSubjectName(task.categoryId),
                subjectId: task.categoryId,
                subjectColor: mapSubjectColor(task.categoryId),
                date: task.deadline || new Date(),
                content: task.mentorComment,
                originalTask: task, // Store full task for modal
            }));

        return [...mentorFeedbacks, ...userFeedbacks];
    }, [mentorTasks, userTasks]);

    // 1. Filter by Subject
    let processedFeedbacks = FEEDBACK_DATA.filter(f => f.subjectId === activeSubject || showStarredOnly);

    // Filter by Starred if active
    if (showStarredOnly) {
        processedFeedbacks = FEEDBACK_DATA.filter(f => starredIds.includes(f.id));
    } else {
        processedFeedbacks = processedFeedbacks.filter(f => f.subjectId === activeSubject);
    }

    // 2. Filter by Period
    const now = new Date();
    if (periodFilter !== 'all') {
        const cutoffDate = new Date();
        if (periodFilter === '1month') cutoffDate.setMonth(now.getMonth() - 1);
        if (periodFilter === '3months') cutoffDate.setMonth(now.getMonth() - 3);
        processedFeedbacks = processedFeedbacks.filter(f => f.date >= cutoffDate);
    }

    // 3. Sort by Date
    processedFeedbacks.sort((a, b) => {
        return sortOrder === 'newest'
            ? b.date.getTime() - a.date.getTime()
            : a.date.getTime() - b.date.getTime();
    });

    // Calculate Pagination
    const totalPages = Math.ceil(processedFeedbacks.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const displayedFeedbacks = processedFeedbacks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Helpers
    function getSubjectName(id: string) {
        if (id === 'korean') return '국어';
        if (id === 'math') return '수학';
        if (id === 'english') return '영어';
        return '기타';
    }

    function mapSubjectColor(id: string) {
        if (id === 'korean') return "text-emerald-600 bg-emerald-50";
        if (id === 'math') return "text-blue-600 bg-blue-50";
        if (id === 'english') return "text-purple-600 bg-purple-50";
        return "text-gray-600 bg-gray-50";
    }

    // New Logic: Extract First Meaningful Sentence
    function generateSimpleSummary(text: string) {
        // Remove introductory exclamations
        let cleanText = text.replace(/^(좋은 질문이네!|훌륭합니다!|좋아요!)\s*/, "");

        // Take the first sentence ending with . ? !
        const firstSentence = cleanText.split(/[.?!](?=\s)/)[0];

        // If it's too long, truncate
        if (firstSentence.length > 25) {
            return firstSentence.substring(0, 25) + "...";
        }
        return firstSentence + (firstSentence.endsWith('!') || firstSentence.endsWith('?') ? '' : '.');
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            setOpenFeedbackId(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleToggle = (id: string | number) => {
        setOpenFeedbackId(prev => prev === id ? null : id);
    };

    const handleTabChange = (subjectId: string) => {
        setActiveSubject(subjectId);
        setCurrentPage(1);
        setOpenFeedbackId(null);
    };

    return (
        <section className="px-6 pb-20">

            {/* Subject Tabs */}
            <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-[12px] mb-6">
                {SUBJECTS.map(subject => {
                    const isSelected = activeSubject === subject.id;
                    const Icon = subject.icon;
                    const count = FEEDBACK_DATA.filter(f => f.subjectId === subject.id).length;

                    return (
                        <button
                            key={subject.id}
                            onClick={() => handleTabChange(subject.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] transition-all duration-300 ${isSelected
                                ? 'bg-white shadow-md'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon
                                size={15}
                                className={isSelected ? `text-${subject.color}-500` : 'text-gray-400'}
                            />
                            <span className={`text-[13px] font-bold ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                                {subject.name}
                            </span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isSelected
                                ? `bg-${subject.color}-50 text-${subject.color}-600`
                                : 'bg-gray-200 text-gray-400'
                                }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* 🔽 Sorting & Filtering Toolbar */}
            <div className="flex items-center justify-between mb-4 px-1">
                {/* Starred Filter */}
                <button
                    onClick={() => {
                        setShowStarredOnly(!showStarredOnly);
                        setCurrentPage(1);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${showStarredOnly
                        ? "bg-amber-50 border-amber-200 text-amber-600 shadow-sm"
                        : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                        }`}
                >
                    <Star size={12} fill={showStarredOnly ? "currentColor" : "none"} strokeWidth={showStarredOnly ? 0 : 2} />
                    중요함
                </button>

                <div className="flex items-center gap-4">
                    {/* Sort Order */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSortOrder('newest')}
                            className={`text-xs ${sortOrder === 'newest' ? 'font-black text-gray-900' : 'font-medium text-gray-400'}`}
                        >
                            최신순
                        </button>
                        <div className="w-px h-2.5 bg-gray-200"></div>
                        <button
                            onClick={() => setSortOrder('oldest')}
                            className={`text-xs ${sortOrder === 'oldest' ? 'font-black text-gray-900' : 'font-medium text-gray-400'}`}
                        >
                            오래된순
                        </button>
                    </div>

                    {/* Period Filter */}
                    <div className="flex items-center gap-1">
                        <select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value as any)}
                            className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary/50"
                        >
                            <option value="all">전체</option>
                            <option value="1month">1개월</option>
                            <option value="3months">3개월</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="space-y-3">
                {displayedFeedbacks.length > 0 ? (
                    displayedFeedbacks.map((item) => (
                        <FeedbackCard
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            subject={item.subject}
                            subjectColor={item.subjectColor}
                            date={item.date}
                            content={item.content}
                            isOpen={openFeedbackId === item.id}
                            onToggle={() => handleToggle(item.id)}
                            isStarred={starredIds.includes(item.id)}
                            onToggleStar={() => toggleStar(item.id)}
                            onOpenTask={() => onOpenTask?.(item.originalTask)}
                        />
                    ))
                ) : (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 opacity-50">
                            <Library size={20} className="text-gray-400" />
                        </div>
                        <p className="text-xs font-bold text-gray-300">
                            해당하는 피드백이 없어요.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-full border transition-all ${currentPage === 1
                            ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95'
                            }`}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <span className="text-sm font-bold text-gray-900">
                        {currentPage} <span className="text-gray-300 font-medium">/ {totalPages}</span>
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-full border transition-all ${currentPage === totalPages
                            ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50 active:scale-95'
                            }`}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </section>
    );
}
