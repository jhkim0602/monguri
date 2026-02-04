"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Settings,
    ChevronRight,
    ChevronRight as ArrowRight,
    CheckCircle2,
    MessageCircle,
    HelpCircle,
    LogOut,
    Camera,
    X,
    Check,
    Library,
    Calculator,
    Languages,
    ChevronDown,
    ChevronUp,
    Calendar,
    Video,
    Clock,
    Plus
} from "lucide-react";
import { DEFAULT_CATEGORIES, USER_PROFILE } from "@/constants/common";
import { MENTOR_TASKS } from "@/constants/mentee";
import Header from "@/components/mentee/layout/Header";

type MeetingStatus = "requested" | "scheduled" | "completed";

type MeetingRecord = {
    id: string;
    topic: string;
    taskId?: string | number;
    taskTitle?: string;
    requestedAt: Date;
    scheduledAt?: Date;
    status: MeetingStatus;
    zoomLink?: string;
    preferredTime?: string;
    note?: string;
};

export default function MyPage() {
    const router = useRouter();

    // Profile Edit States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profileName, setProfileName] = useState(USER_PROFILE.name);
    const [profileIntro, setProfileIntro] = useState("서울대학교 입학을 목표로 열공 중 ✨");
    const [profileAvatar, setProfileAvatar] = useState(USER_PROFILE.avatar);

    // Achievement Detail State
    const [selectedStatSubject, setSelectedStatSubject] = useState<string>('korean');
    const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Feedback Aggregation State (Merged into subject detail)
    const [openMonthKeys, setOpenMonthKeys] = useState<string[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
    const [readFeedbackIds, setReadFeedbackIds] = useState<string[]>([]);
    const [detailTab, setDetailTab] = useState<'tasks' | 'feedback'>('tasks');

    // Mentor Meeting States
    const [meetingTopic, setMeetingTopic] = useState("");
    const [meetingTaskId, setMeetingTaskId] = useState("");
    const [meetingPreferredTime, setMeetingPreferredTime] = useState("");
    const [meetingNote, setMeetingNote] = useState("");
    const [isMeetingRequestOpen, setIsMeetingRequestOpen] = useState(false);
    const [isMeetingRequestHistoryOpen, setIsMeetingRequestHistoryOpen] = useState(false);
    const [isMeetingHistoryOpen, setIsMeetingHistoryOpen] = useState(false);
    const [isTaskPickerOpen, setIsTaskPickerOpen] = useState(false);
    const [taskSearch, setTaskSearch] = useState("");
    const [taskTypeFilter, setTaskTypeFilter] = useState<"all" | "mentor" | "user">("all");
    const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>("all");
    const [meetingRecords, setMeetingRecords] = useState<MeetingRecord[]>([
        {
            id: "m-1",
            topic: "미적분 킬러문항 풀이 방향",
            taskId: 5,
            taskTitle: "미적분 킬러문항 3개년 기출 분석",
            requestedAt: new Date(2026, 1, 2, 18, 0),
            scheduledAt: new Date(2026, 1, 4, 19, 0),
            status: "scheduled",
        },
        {
            id: "m-2",
            topic: "언어와 매체 개념 점검",
            taskId: 7,
            taskTitle: "언어와 매체 개념 정리",
            requestedAt: new Date(2026, 1, 4, 10, 30),
            status: "requested",
            preferredTime: "이번 주 목요일 8시 이후",
        },
        {
            id: "m-3",
            topic: "등차수열 합 공식 질문",
            taskId: "u1",
            taskTitle: "수학 수1 등차수열 복습",
            requestedAt: new Date(2026, 0, 30, 19, 0),
            scheduledAt: new Date(2026, 0, 30, 20, 0),
            status: "completed",
            note: "가우스 방법으로 정리하고 예제 추가",
        },
        {
            id: "m-4",
            topic: "언어와 매체 개념 점검",
            taskId: 7,
            taskTitle: "언어와 매체 개념 정리",
            requestedAt: new Date(2026, 1, 3, 12, 0),
            scheduledAt: new Date(2026, 1, 6, 20, 0),
            status: "scheduled",
        },
    ]);
    const MEETING_STORAGE_KEY = "mentor-meeting-records";

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter Tasks based on period
    const getFilteredTasks = (categoryId: string, period: 'daily' | 'weekly' | 'monthly') => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        return MENTOR_TASKS.filter(t => {
            if (t.categoryId !== categoryId) return false;
            if (!t.deadline) return false;

            const taskDate = new Date(t.deadline);
            if (period === 'daily') {
                return taskDate.getDate() === today.getDate() &&
                    taskDate.getMonth() === today.getMonth() &&
                    taskDate.getFullYear() === today.getFullYear();
            } else if (period === 'weekly') {
                return taskDate >= startOfWeek && taskDate <= today;
            } else {
                return taskDate >= startOfMonth && taskDate <= today;
            }
        });
    };

    // Calculate subject-wise achievement
    const getSubjectStats = (categoryId: string, period: 'daily' | 'weekly' | 'monthly') => {
        const subjectTasks = getFilteredTasks(categoryId, period);
        if (subjectTasks.length === 0) return 0;
        const completed = subjectTasks.filter(t => t.status !== 'pending').length;
        return Math.round((completed / subjectTasks.length) * 100);
    };

    // Temp states for modal
    const [tempName, setTempName] = useState(profileName);
    const [tempIntro, setTempIntro] = useState(profileIntro);
    const [tempAvatar, setTempAvatar] = useState(profileAvatar);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setTempAvatar(imageUrl);
        }
    };

    const subjects = [
        { id: 'korean', name: '국어', color: 'emerald', icon: Library },
        { id: 'math', name: '수학', color: 'blue', icon: Calculator },
        { id: 'english', name: '영어', color: 'purple', icon: Languages },
    ];

    const allTasks = MENTOR_TASKS;
    const getTaskSubjectLabel = (task: any) => {
        const category = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId);
        return task.subject || category?.name || "과목";
    };
    const getTaskLabel = (task: any) => {
        const typeLabel = task.isMentorTask ? "멘토 과제" : "나의 과제";
        return `${typeLabel} · ${getTaskSubjectLabel(task)} · ${task.title}`;
    };

    const meetingStatusConfig: Record<MeetingStatus, { label: string; className: string }> = {
        requested: { label: "요청됨", className: "bg-amber-50 text-amber-600" },
        scheduled: { label: "확정됨", className: "bg-emerald-50 text-emerald-600" },
        completed: { label: "완료", className: "bg-gray-100 text-gray-500" },
    };
    const selectedMeetingTask = meetingTaskId
        ? allTasks.find(task => String(task.id) === meetingTaskId)
        : undefined;
    const mentorTasksForPicker = allTasks.filter(task => task.isMentorTask);
    const userTasksForPicker = allTasks.filter(task => !task.isMentorTask);
    const requestedMeetings = meetingRecords.filter(record => record.status === "requested");
    const confirmedMeetings = meetingRecords.filter(record => record.status !== "requested");
    const normalizedSearch = taskSearch.trim().toLowerCase();
    const matchesSearch = (task: any) => {
        if (!normalizedSearch) return true;
        const subjectLabel = getTaskSubjectLabel(task).toLowerCase();
        return task.title.toLowerCase().includes(normalizedSearch) || subjectLabel.includes(normalizedSearch);
    };
    const matchesCategory = (task: any) =>
        taskCategoryFilter === "all" || task.categoryId === taskCategoryFilter;
    const sortByDeadline = (a: any, b: any) => {
        const aTime = a.deadline instanceof Date ? a.deadline.getTime() : 0;
        const bTime = b.deadline instanceof Date ? b.deadline.getTime() : 0;
        if (aTime && bTime) return aTime - bTime;
        if (aTime) return -1;
        if (bTime) return 1;
        return String(a.title).localeCompare(String(b.title));
    };
    const filteredMentorTasks = mentorTasksForPicker
        .filter(task => matchesSearch(task) && matchesCategory(task))
        .sort(sortByDeadline);
    const filteredUserTasks = userTasksForPicker
        .filter(task => matchesSearch(task) && matchesCategory(task))
        .sort(sortByDeadline);
    const totalFilteredCount = filteredMentorTasks.length + filteredUserTasks.length;
    const openTaskPicker = () => {
        setTaskSearch("");
        setTaskTypeFilter("all");
        setTaskCategoryFilter("all");
        setIsTaskPickerOpen(true);
    };

    const parseMeetingRecord = (record: any): MeetingRecord => ({
        ...record,
        requestedAt: record.requestedAt ? new Date(record.requestedAt) : new Date(),
        scheduledAt: record.scheduledAt ? new Date(record.scheduledAt) : undefined,
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem(MEETING_STORAGE_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setMeetingRecords(parsed.map(parseMeetingRecord));
            }
        } catch {
            // ignore invalid storage data
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const serialized = meetingRecords.map((record) => ({
            ...record,
            requestedAt: record.requestedAt instanceof Date ? record.requestedAt.toISOString() : record.requestedAt,
            scheduledAt: record.scheduledAt
                ? record.scheduledAt instanceof Date
                    ? record.scheduledAt.toISOString()
                    : record.scheduledAt
                : undefined,
        }));
        localStorage.setItem(MEETING_STORAGE_KEY, JSON.stringify(serialized));
    }, [meetingRecords]);

    const formatMeetingDate = (date: Date) =>
        date.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric", weekday: "short" });
    const formatMeetingDateTime = (date: Date) =>
        date.toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" });

    const isRealFeedback = (text?: string) => {
        if (!text) return false;
        const trimmed = text.trim();
        if (!trimmed) return false;
        return !trimmed.includes("아직 피드백이 등록되지 않았습니다.");
    };

    const getFeedbackItems = () => {
        const items: any[] = [];

        MENTOR_TASKS.forEach((task) => {
            const hasComment = isRealFeedback(task.mentorComment);
            const hasFeedback = isRealFeedback(task.mentorFeedback);
            if (!hasComment && !hasFeedback) return;

            const category = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId);
            const statusLabel = task.status === 'feedback_completed'
                ? '피드백 완료'
                : task.status === 'submitted'
                    ? '제출 확인'
                    : '진행중';
            const statusClass = task.status === 'feedback_completed'
                ? 'bg-emerald-50 text-emerald-600'
                : task.status === 'submitted'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-100 text-gray-500';

            const primary = hasComment ? task.mentorComment : task.mentorFeedback;
            const secondary = hasComment && hasFeedback && task.mentorComment !== task.mentorFeedback
                ? task.mentorFeedback
                : undefined;

            items.push({
                id: `m-${task.id}`,
                type: 'mentor',
                taskId: task.id,
                title: task.title,
                categoryId: task.categoryId,
                subjectLabel: category?.name || '과목',
                subjectClass: category ? `${category.color} ${category.textColor}` : 'bg-gray-100 text-gray-600',
                feedback: primary,
                feedbackAlt: secondary,
                deadline: task.deadline,
                statusLabel,
                statusClass,
            });
        });

        return items.sort((a, b) => {
            const aTime = a.deadline ? new Date(a.deadline).getTime() : 0;
            const bTime = b.deadline ? new Date(b.deadline).getTime() : 0;
            return bTime - aTime;
        });
    };

    const feedbackItems = getFeedbackItems();
    const filterItemsByPeriod = (items: any[], period: 'daily' | 'weekly' | 'monthly') => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        return items.filter(item => {
            if (!item.deadline) return false;
            const itemDate = new Date(item.deadline);
            if (period === 'daily') {
                return itemDate.getDate() === today.getDate() &&
                    itemDate.getMonth() === today.getMonth() &&
                    itemDate.getFullYear() === today.getFullYear();
            } else if (period === 'weekly') {
                return itemDate >= startOfWeek && itemDate <= today;
            } else {
                return itemDate >= startOfMonth && itemDate <= today;
            }
        });
    };
    const getSubjectFeedbackItems = (categoryId: string, period: 'daily' | 'weekly' | 'monthly') => {
        const bySubject = feedbackItems.filter(item => item.categoryId === categoryId);
        return filterItemsByPeriod(bySubject, period);
    };
    const formatFeedbackDate = (date?: Date) => {
        if (!date) return '날짜 미정';
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const getWeekStart = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        return d;
    };

    const formatWeekRange = (date: Date) => {
        const start = getWeekStart(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return `${start.getMonth() + 1}/${start.getDate()} ~ ${end.getMonth() + 1}/${end.getDate()}`;
    };

    const groupFeedbackItems = (items: any[], period: 'daily' | 'weekly' | 'monthly') => {
        const groups = new Map<string, { label: string; date: Date; items: any[] }>();

        items.forEach((item) => {
            const date = item.deadline ? new Date(item.deadline) : new Date();
            if (period === 'daily') {
                const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                const label = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                if (!groups.has(key)) {
                    const groupDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    groups.set(key, { label, date: groupDate, items: [] });
                }
                groups.get(key)?.items.push(item);
            } else if (period === 'weekly') {
                const start = getWeekStart(date);
                const key = `${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}`;
                const label = formatWeekRange(date);
                if (!groups.has(key)) {
                    groups.set(key, { label, date: start, items: [] });
                }
                groups.get(key)?.items.push(item);
            } else {
                const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                const label = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
                if (!groups.has(key)) {
                    const groupDate = new Date(date.getFullYear(), date.getMonth(), 1);
                    groups.set(key, { label, date: groupDate, items: [] });
                }
                groups.get(key)?.items.push(item);
            }
        });

        return Array.from(groups.values())
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .map((group) => ({ key: group.label, label: group.label, items: group.items }));
    };

    const subjectFeedbackItems = getSubjectFeedbackItems(selectedStatSubject, selectedPeriod);
    const subjectUnreadCount = subjectFeedbackItems.filter(i => !readFeedbackIds.includes(i.id)).length;
    const latestSubjectFeedback = subjectFeedbackItems[0];
    const groupedSubjectFeedbackItems = groupFeedbackItems(subjectFeedbackItems, selectedPeriod);
    const allMonthKeys = groupedSubjectFeedbackItems.map(group => group.key);
    const normalizedOpenMonthKeys = openMonthKeys.filter(key => allMonthKeys.includes(key));
    const isMonthOpen = (key: string) => normalizedOpenMonthKeys.includes(key);
    const toggleMonthGroup = (key: string) => {
        if (normalizedOpenMonthKeys.includes(key)) {
            setOpenMonthKeys(normalizedOpenMonthKeys.filter(k => k !== key));
        } else {
            setOpenMonthKeys([...normalizedOpenMonthKeys, key]);
        }
    };
    const allMonthsOpen = allMonthKeys.length > 0 && normalizedOpenMonthKeys.length === allMonthKeys.length;
    const toggleAllMonths = () => {
        if (allMonthsOpen) {
            setOpenMonthKeys([]);
        } else {
            setOpenMonthKeys(allMonthKeys);
        }
    };

    useEffect(() => {
        setOpenMonthKeys([]);
    }, [selectedStatSubject, selectedPeriod]);

    const openFeedback = (item: any) => {
        setSelectedFeedback(item);
        setReadFeedbackIds(prev => prev.includes(item.id) ? prev : [...prev, item.id]);
    };

    const handleMeetingRequest = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const trimmedTopic = meetingTopic.trim();
        if (!trimmedTopic) return;

        const selectedTask = allTasks.find(task => String(task.id) === meetingTaskId);
        const now = new Date();
        const record: MeetingRecord = {
            id: `m-${now.getTime()}`,
            topic: trimmedTopic,
            taskId: selectedTask?.id,
            taskTitle: selectedTask?.title,
            requestedAt: now,
            status: "requested",
            preferredTime: meetingPreferredTime.trim() || undefined,
            note: meetingNote.trim() || undefined,
        };

        setMeetingRecords(prev => [record, ...prev]);
        setMeetingTopic("");
        setMeetingTaskId("");
        setMeetingPreferredTime("");
        setMeetingNote("");
    };

    const menuItems = [
        { icon: HelpCircle, label: "고객센터", color: "text-orange-500", bg: "bg-orange-50" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <Header
                title="마이페이지"
                variant="clean"
                rightElement={
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <Settings size={22} />
                    </button>
                }
            />

            {/* Profile Section */}
            <section className="px-6 py-8 bg-white mb-4">
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-blue-100 overflow-hidden ring-4 ring-blue-50 transition-all group-hover:ring-blue-200">
                            <img src={profileAvatar} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full ring-2 ring-white">
                            <CheckCircle2 size={12} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-900">{profileName}님</h2>
                                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Mentee</span>
                            </div>
                            <button
                                onClick={() => {
                                    setTempName(profileName);
                                    setTempIntro(profileIntro);
                                    setTempAvatar(profileAvatar);
                                    setIsEditModalOpen(true);
                                }}
                                className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                프로필 수정
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{profileIntro}</p>
                    </div>
                </div>
            </section>

            {/* Achievement Summary - Tabbed View */}
            <section className="px-6 mb-8">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[17px] font-black text-gray-900 tracking-tight">과목별 성취도</h3>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 py-1 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all ${selectedPeriod === period ? 'bg-white text-primary shadow-sm' : 'text-gray-400'
                                    }`}
                            >
                                {period === 'daily' ? '오늘' : period === 'weekly' ? '주간' : '월간'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subject Tab Bar */}
                <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-[20px] mb-6">
                    {subjects.map(subject => {
                        const isSelected = selectedStatSubject === subject.id;
                        const Icon = subject.icon;
                        const stat = getSubjectStats(subject.id, selectedPeriod);
                        return (
                            <button
                                key={subject.id}
                                onClick={() => setSelectedStatSubject(subject.id)}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-[16px] transition-all duration-300 relative ${isSelected
                                    ? 'bg-white shadow-md text-gray-900'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <div className="flex items-center gap-1.5">
                                    <Icon size={14} className={isSelected ? `text-${subject.color}-500` : ''} />
                                    <span className="text-[13px] font-bold">{subject.name}</span>
                                </div>
                                <span className={`text-[10px] font-black ${isSelected ? `text-${subject.color}-500` : 'text-gray-300'}`}>{stat}%</span>
                            </button>
                        );
                    })}
                </div>

                {/* Compact Achievement Card */}
                <div
                    onClick={() => {
                        setDetailTab('tasks');
                        setIsDetailModalOpen(true);
                    }}
                    className="cursor-pointer group animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden active:scale-[0.98] transition-all">
                        {/* Background Decor */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${subjects.find(s => s.id === selectedStatSubject)?.color}-50 rounded-full blur-3xl opacity-60`} />

                        <div className="relative z-10 flex items-center justify-between mb-6">
                            <div>
                                <h4 className="text-[18px] font-black text-gray-900 mb-1">
                                    {subjects.find(s => s.id === selectedStatSubject)?.name} 성취 리포트
                                </h4>
                                <p className="text-xs text-gray-400 font-medium">터치하여 상세 리스트 확인</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-[28px] font-black text-${subjects.find(s => s.id === selectedStatSubject)?.color}-500 leading-none`}>
                                    {getSubjectStats(selectedStatSubject, selectedPeriod)}%
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 w-full bg-gray-50 rounded-full mb-6 overflow-hidden p-0.5 border border-gray-100">
                            <div
                                className={`h-full bg-${subjects.find(s => s.id === selectedStatSubject)?.color}-500 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                style={{ width: `${getSubjectStats(selectedStatSubject, selectedPeriod)}%` }}
                            />
                        </div>

                        {/* Feedback Summary (Inline) */}
                        <div className="mb-5 bg-gray-50/70 border border-gray-100 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                    <MessageCircle size={14} className="text-purple-500" />
                                    피드백 {subjectFeedbackItems.length}개
                                    {subjectUnreadCount > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-500 text-[9px] font-black">NEW {subjectUnreadCount}</span>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold">탭하면 상세 확인</span>
                            </div>
                            {latestSubjectFeedback ? (
                                <p className="text-[12px] text-gray-600 font-medium line-clamp-2">
                                    "{latestSubjectFeedback.feedback}"
                                </p>
                            ) : (
                                <p className="text-[12px] text-gray-400 font-medium">아직 도착한 피드백이 없습니다.</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Todo</span>
                                    <span className="text-lg font-black text-gray-700">
                                        {getFilteredTasks(selectedStatSubject, selectedPeriod).filter(t => t.status === 'pending').length}
                                    </span>
                                </div>
                                <div className="w-[1px] h-8 bg-gray-100" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Done</span>
                                    <span className="text-lg font-black text-blue-500">
                                        {getFilteredTasks(selectedStatSubject, selectedPeriod).filter(t => t.status !== 'pending').length}
                                    </span>
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-2xl bg-${subjects.find(s => s.id === selectedStatSubject)?.color}-50 flex items-center justify-center text-${subjects.find(s => s.id === selectedStatSubject)?.color}-500 group-hover:bg-${subjects.find(s => s.id === selectedStatSubject)?.color}-500 group-hover:text-white transition-all`}>
                                <ArrowRight size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievement Detail Overlay Modal (Centered Popup) */}
            {isDetailModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    {/* Dark Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsDetailModalOpen(false)}
                    />

                    {/* Centered Modal Content */}
                    <div className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh]">
                        <header className="px-6 pt-8 pb-4 border-b border-gray-50 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-black text-gray-900">
                                        {subjects.find(s => s.id === selectedStatSubject)?.name} 상세 내역
                                    </h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">
                                        {selectedPeriod === 'daily' ? 'Today' : selectedPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Breakdown
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mt-4 flex bg-gray-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setDetailTab('tasks')}
                                    className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                                        detailTab === 'tasks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
                                    }`}
                                >
                                    과제
                                </button>
                                <button
                                    onClick={() => setDetailTab('feedback')}
                                    className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                                        detailTab === 'feedback' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
                                    }`}
                                >
                                    피드백 {subjectFeedbackItems.length}
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                            {/* Summary Card in Modal */}
                            <div className={`bg-${subjects.find(s => s.id === selectedStatSubject)?.color}-50/50 rounded-[28px] p-6 border border-${subjects.find(s => s.id === selectedStatSubject)?.color}-100 flex flex-col items-center text-center`}>
                                <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm border border-${subjects.find(s => s.id === selectedStatSubject)?.color}-100`}>
                                    <span className={`text-xl font-black text-${subjects.find(s => s.id === selectedStatSubject)?.color}-500`}>
                                        {getSubjectStats(selectedStatSubject, selectedPeriod)}%
                                    </span>
                                </div>
                                <h3 className="font-black text-gray-900 mb-1">성취도 리포트</h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    총 {getFilteredTasks(selectedStatSubject, selectedPeriod).length}개 중 {getFilteredTasks(selectedStatSubject, selectedPeriod).filter(t => t.status !== 'pending').length}개 완료
                                </p>
                            </div>

                            {detailTab === 'tasks' ? (
                                <>
                                    {/* Todo List */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <h4 className="text-[13px] font-black text-gray-900 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                                미완료 과제
                                            </h4>
                                            <span className="text-[10px] font-black text-gray-400">
                                                {getFilteredTasks(selectedStatSubject, selectedPeriod).filter(t => t.status === 'pending').length}개
                                            </span>
                                        </div>
                                        <div className="space-y-2.5">
                                            {getFilteredTasks(selectedStatSubject, selectedPeriod).filter(t => t.status === 'pending').map(task => (
                                                <div key={task.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                    <p className="text-[13px] font-bold text-gray-800 leading-snug">{task.title}</p>
                                                </div>
                                            ))}
                                            {getFilteredTasks(selectedStatSubject, selectedPeriod).filter(t => t.status === 'pending').length === 0 && (
                                                <div className="py-6 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                                    <p className="text-xs font-bold text-gray-300">
                                                        {getFilteredTasks(selectedStatSubject, selectedPeriod).length === 0
                                                            ? "아직 등록된 과제가 없습니다."
                                                            : "모두 완료했습니다! ✨"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Done List */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <h4 className="text-[13px] font-black text-gray-900 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                완료된 과제
                                            </h4>
                                            <span className="text-[10px] font-black text-gray-400">
                                                {getFilteredTasks(selectedStatSubject, selectedPeriod).filter(t => t.status !== 'pending').length}개
                                            </span>
                                        </div>
                                        <div className="space-y-2.5">
                                            {getFilteredTasks(selectedStatSubject, selectedPeriod).filter(t => t.status !== 'pending').map(task => (
                                                <div key={task.id} className="bg-white border border-gray-50 rounded-2xl p-4 flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-500">
                                                        <Check size={12} />
                                                    </div>
                                                    <p className="text-[13px] font-medium text-gray-400 line-through line-clamp-1">{task.title}</p>
                                                </div>
                                            ))}
                                            {getFilteredTasks(selectedStatSubject, selectedPeriod).filter(t => t.status !== 'pending').length === 0 && (
                                                <div className="py-6 text-center text-xs font-bold text-gray-300">
                                                    {getFilteredTasks(selectedStatSubject, selectedPeriod).length === 0
                                                        ? ""
                                                        : "아직 완료된 과제가 없습니다."}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    {subjectFeedbackItems.length === 0 ? (
                                        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-8 text-center">
                                            <p className="text-sm font-bold text-gray-300">아직 모아볼 피드백이 없어요.</p>
                                            <p className="text-[11px] text-gray-400 mt-2">과제를 제출하면 멘토 피드백이 여기 모여요.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-end">
                                                <button
                                                    onClick={toggleAllMonths}
                                                    className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[9px] font-black hover:text-gray-700 transition-colors"
                                                >
                                                    {allMonthsOpen ? "모두 접기" : "모두 펼치기"}
                                                </button>
                                            </div>
                                            {groupedSubjectFeedbackItems.map((group) => (
                                                <div key={group.key} className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[11px] font-black text-gray-500">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                            {group.label}
                                                            <span className="text-[10px] font-black text-gray-300">({group.items.length})</span>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleMonthGroup(group.key)}
                                                            className="p-2 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                                        >
                                                            {isMonthOpen(group.key) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        </button>
                                                    </div>
                                                    {isMonthOpen(group.key) && (
                                                        <div className="space-y-3">
                                                            {group.items.map((item: any) => {
                                                                const isUnread = !readFeedbackIds.includes(item.id);
                                                                return (
                                                                    <button
                                                                        key={item.id}
                                                                        onClick={() => openFeedback(item)}
                                                                        className="w-full text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-purple-100 transition-all"
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${item.subjectClass}`}>
                                                                                {item.subjectLabel}
                                                                            </span>
                                                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${item.statusClass}`}>
                                                                                {item.statusLabel}
                                                                            </span>
                                                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                                                                {item.type === 'mentor' ? '멘토 과제' : '나의 과제'}
                                                                            </span>
                                                                            {isUnread && (
                                                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-100 text-red-500">NEW</span>
                                                                            )}
                                                                            <span className="ml-auto text-[10px] text-gray-400 font-bold">
                                                                                {formatFeedbackDate(item.deadline)}
                                                                            </span>
                                                                        </div>
                                                                        <h4 className="text-sm font-bold text-gray-900 mt-2 truncate">{item.title}</h4>
                                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">"{item.feedback}"</p>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="px-6 pb-8 pt-4 border-t border-gray-50 flex-shrink-0">
                            <button
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    router.push('/planner');
                                }}
                                className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-gray-200"
                            >
                                플래너에서 수정하기
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mentor Meeting Section */}
            <section className="px-6 mb-8">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h3 className="text-[17px] font-black text-gray-900 tracking-tight">멘토 미팅</h3>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">
                            미팅 신청 후 멘토가 줌 링크를 보내면 확정돼요.
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-400 font-black">
                        <Calendar size={14} className="text-gray-300" />
                        요청 {requestedMeetings.length}건 · 확정 {confirmedMeetings.length}건
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <Plus size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900">미팅 신청</h4>
                                    <p className="text-[11px] text-gray-400 font-medium">관련 태스크를 언급하며 요청할 수 있어요.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMeetingRequestOpen(prev => !prev)}
                                className="p-2 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                aria-label="미팅 신청 토글"
                            >
                                {isMeetingRequestOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>

                        {isMeetingRequestOpen && (
                            <form onSubmit={handleMeetingRequest} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">미팅 주제</label>
                                    <input
                                        type="text"
                                        value={meetingTopic}
                                        onChange={(event) => setMeetingTopic(event.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="예: 미적분 킬러문항 풀이 방향 설명 부탁해요"
                                    />
                                </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">관련 태스크 (선택)</label>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={openTaskPicker}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 flex items-center justify-between hover:bg-gray-100 transition-all"
                                    >
                                        <span className={selectedMeetingTask ? "text-gray-800" : "text-gray-400"}>
                                            {selectedMeetingTask ? getTaskLabel(selectedMeetingTask) : "태스크 선택하기"}
                                        </span>
                                        <ChevronRight size={16} className="text-gray-300" />
                                    </button>
                                    {selectedMeetingTask && (
                                        <button
                                            type="button"
                                            onClick={() => setMeetingTaskId("")}
                                            className="px-3 py-2 rounded-xl text-[10px] font-black text-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors"
                                        >
                                            해제
                                        </button>
                                    )}
                                </div>
                            </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">희망 일정 (선택)</label>
                                        <input
                                            type="text"
                                            value={meetingPreferredTime}
                                            onChange={(event) => setMeetingPreferredTime(event.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            placeholder="예: 이번 주 수요일 8시 이후"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">메모 (선택)</label>
                                        <textarea
                                            rows={2}
                                            value={meetingNote}
                                            onChange={(event) => setMeetingNote(event.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                                            placeholder="추가로 공유할 내용이 있다면 적어주세요"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 bg-gray-50/70 border border-gray-100 rounded-2xl p-4 text-[11px] text-gray-500 font-medium">
                                    <Video size={14} className="text-blue-500 mt-0.5" />
                                    멘토가 외부 줌 링크를 보내면 미팅이 확정되고 기록에 표시돼요.
                                </div>

                                <button
                                    type="submit"
                                    disabled={!meetingTopic.trim()}
                                    className={`w-full h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                                        meetingTopic.trim()
                                            ? 'bg-gray-900 text-white hover:bg-black active:scale-[0.98]'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    미팅 신청하기
                                    <Plus size={16} />
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-sm font-black text-gray-900">미팅 신청 기록</h4>
                                <p className="text-[11px] text-gray-400 font-medium">멘토가 확정하기 전 요청 목록이에요.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-black">{requestedMeetings.length}건</span>
                                <button
                                    type="button"
                                    onClick={() => setIsMeetingRequestHistoryOpen(prev => !prev)}
                                    className="p-2 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                    aria-label="미팅 신청 기록 토글"
                                >
                                    {isMeetingRequestHistoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>
                        </div>

                        {isMeetingRequestHistoryOpen && (
                            <>
                                {requestedMeetings.length === 0 ? (
                                    <div className="py-8 text-center text-sm font-bold text-gray-300 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                        대기 중인 신청이 없어요.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {requestedMeetings.map((record) => {
                                            const relatedTask = record.taskId
                                                ? allTasks.find(task => String(task.id) === String(record.taskId))
                                                : undefined;
                                            const taskLabel = relatedTask ? getTaskLabel(relatedTask) : record.taskTitle;
                                            return (
                                                <div key={record.id} className="bg-gray-50/60 border border-gray-100 rounded-2xl p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${meetingStatusConfig.requested.className}`}>
                                                            {meetingStatusConfig.requested.label}
                                                        </span>
                                                        {taskLabel && (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-gray-100 text-gray-500">
                                                                관련 태스크
                                                            </span>
                                                        )}
                                                        <span className="ml-auto text-[10px] text-gray-400 font-bold">
                                                            {formatMeetingDate(record.requestedAt)}
                                                        </span>
                                                    </div>
                                                    <h5 className="text-sm font-bold text-gray-900 mt-2">{record.topic}</h5>
                                                    {taskLabel && (
                                                        <p className="text-[11px] text-gray-500 mt-1">태스크: {taskLabel}</p>
                                                    )}
                                                    {record.preferredTime && (
                                                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                                            <Clock size={12} className="text-gray-300" />
                                                            희망 일정: {record.preferredTime}
                                                        </div>
                                                    )}
                                                    {record.note && (
                                                        <p className="text-[11px] text-gray-500 mt-2">메모: {record.note}</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="text-sm font-black text-gray-900">미팅 기록</h4>
                                <p className="text-[11px] text-gray-400 font-medium">확정/완료 내역을 모아봐요.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-black">{confirmedMeetings.length}건</span>
                                <button
                                    type="button"
                                    onClick={() => setIsMeetingHistoryOpen(prev => !prev)}
                                    className="p-2 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                                    aria-label="미팅 기록 토글"
                                >
                                    {isMeetingHistoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>
                        </div>

                        {isMeetingHistoryOpen && (
                            <>
                                {confirmedMeetings.length === 0 ? (
                                    <div className="py-8 text-center text-sm font-bold text-gray-300 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                        아직 미팅 기록이 없어요.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {confirmedMeetings.map((record) => {
                                            const statusInfo = meetingStatusConfig[record.status];
                                            const relatedTask = record.taskId
                                                ? allTasks.find(task => String(task.id) === String(record.taskId))
                                                : undefined;
                                            const taskLabel = relatedTask ? getTaskLabel(relatedTask) : record.taskTitle;
                                            const displayDate = record.scheduledAt ?? record.requestedAt;
                                            return (
                                                <div key={record.id} className="bg-gray-50/60 border border-gray-100 rounded-2xl p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${statusInfo.className}`}>
                                                            {statusInfo.label}
                                                        </span>
                                                        {taskLabel && (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-gray-100 text-gray-500">
                                                                관련 태스크
                                                            </span>
                                                        )}
                                                        <span className="ml-auto text-[10px] text-gray-400 font-bold">
                                                            {record.scheduledAt ? formatMeetingDateTime(displayDate) : formatMeetingDate(displayDate)}
                                                        </span>
                                                    </div>
                                                    <h5 className="text-sm font-bold text-gray-900 mt-2">{record.topic}</h5>
                                                    {taskLabel && (
                                                        <p className="text-[11px] text-gray-500 mt-1">태스크: {taskLabel}</p>
                                                    )}
                                                    {record.preferredTime && (
                                                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                                            <Clock size={12} className="text-gray-300" />
                                                            희망 일정: {record.preferredTime}
                                                        </div>
                                                    )}
                                                    {record.note && (
                                                        <p className="text-[11px] text-gray-500 mt-2">메모: {record.note}</p>
                                                    )}
                                                    {record.zoomLink ? (
                                                        <a
                                                            href={record.zoomLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="mt-3 inline-flex items-center gap-2 rounded-full bg-gray-900 text-white text-[11px] font-black px-3 py-1.5 hover:bg-black transition-colors"
                                                        >
                                                            <Video size={14} />
                                                            줌 링크 열기
                                                        </a>
                                                    ) : (
                                                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-600 text-[11px] font-black px-3 py-1.5">
                                                            <Calendar size={13} />
                                                            링크 대기중
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Menu List */}
            <section className="px-6 mb-8">
                <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none"
                            >
                                <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center`}>
                                    <Icon size={20} />
                                </div>
                                <span className="flex-1 text-left text-sm font-bold text-gray-800">{item.label}</span>
                                <ChevronRight size={18} className="text-gray-300" />
                            </button>
                        );
                    })}
                    <button className="w-full flex items-center gap-4 p-5 hover:bg-red-50 transition-colors group">
                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                            <LogOut size={20} />
                        </div>
                        <span className="flex-1 text-left text-sm font-bold text-red-500">로그아웃</span>
                        <ChevronRight size={18} className="text-red-200 group-hover:text-red-300" />
                    </button>
                </div>
            </section>

            {/* Task Picker Modal */}
            {isTaskPickerOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsTaskPickerOpen(false)}
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col h-[70vh] max-h-[70vh]">
                        <div className="px-6 pt-7 pb-4 flex justify-between items-center border-b border-gray-50">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">관련 태스크 선택</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">Pick a Task</p>
                            </div>
                            <button
                                onClick={() => setIsTaskPickerOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-6 space-y-5 overflow-y-auto overscroll-contain flex-1">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">검색</label>
                                    <input
                                        value={taskSearch}
                                        onChange={(event) => setTaskSearch(event.target.value)}
                                        placeholder="태스크명/과목 검색"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {([
                                        { key: "all", label: `전체 (${totalFilteredCount})` },
                                        { key: "mentor", label: `멘토 과제 (${filteredMentorTasks.length})` },
                                        { key: "user", label: `나의 과제 (${filteredUserTasks.length})` },
                                    ] as const).map((option) => (
                                        <button
                                            key={option.key}
                                            type="button"
                                            onClick={() => setTaskTypeFilter(option.key)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
                                                taskTypeFilter === option.key
                                                    ? "bg-gray-900 text-white border-gray-900"
                                                    : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTaskCategoryFilter("all")}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
                                            taskCategoryFilter === "all"
                                                ? "bg-primary text-white border-primary"
                                                : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"
                                        }`}
                                    >
                                        전체 과목
                                    </button>
                                    {DEFAULT_CATEGORIES.map((category) => (
                                        <button
                                            key={`category-filter-${category.id}`}
                                            type="button"
                                            onClick={() => setTaskCategoryFilter(category.id)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
                                                taskCategoryFilter === category.id
                                                    ? `${category.color} ${category.textColor} border-transparent`
                                                    : "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-200"
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setMeetingTaskId("");
                                    setIsTaskPickerOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm font-bold hover:bg-gray-50 transition-colors"
                            >
                                선택 안 함
                                {meetingTaskId === "" && <Check size={16} className="text-gray-300" />}
                            </button>

                            {(taskTypeFilter === "all" || taskTypeFilter === "mentor") && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        멘토 과제 ({filteredMentorTasks.length})
                                    </p>
                                    {filteredMentorTasks.length === 0 ? (
                                        <div className="py-4 text-center text-[10px] font-bold text-gray-300 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                            멘토 과제가 없습니다.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredMentorTasks.map(task => {
                                                const category = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId);
                                                const isSelected = meetingTaskId === String(task.id);
                                                return (
                                                    <button
                                                        key={`meeting-task-mentor-${task.id}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setMeetingTaskId(String(task.id));
                                                            setIsTaskPickerOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                                                            isSelected
                                                                ? "border-primary bg-blue-50/40"
                                                                : "border-gray-100 hover:border-primary/30 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded leading-none uppercase tracking-tighter">
                                                                Mentor
                                                            </span>
                                                            {category && (
                                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${category.color} ${category.textColor}`}>
                                                                    {category.name}
                                                                </span>
                                                            )}
                                                            {isSelected && <Check size={14} className="text-primary ml-auto" />}
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-800">{task.title}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {(taskTypeFilter === "all" || taskTypeFilter === "user") && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        나의 과제 ({filteredUserTasks.length})
                                    </p>
                                    {filteredUserTasks.length === 0 ? (
                                        <div className="py-4 text-center text-[10px] font-bold text-gray-300 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                            나의 과제가 없습니다.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredUserTasks.map(task => {
                                                const category = DEFAULT_CATEGORIES.find(c => c.id === task.categoryId);
                                                const isSelected = meetingTaskId === String(task.id);
                                                return (
                                                    <button
                                                        key={`meeting-task-user-${task.id}`}
                                                        type="button"
                                                        onClick={() => {
                                                            setMeetingTaskId(String(task.id));
                                                            setIsTaskPickerOpen(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                                                            isSelected
                                                                ? "border-primary bg-blue-50/40"
                                                                : "border-gray-100 hover:border-primary/30 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                                                Self
                                                            </span>
                                                            {category && (
                                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${category.color} ${category.textColor}`}>
                                                                    {category.name}
                                                                </span>
                                                            )}
                                                            {isSelected && <Check size={14} className="text-primary ml-auto" />}
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-800">{task.title}</p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* Profile Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
                    <div className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-white border-b border-gray-50">
                            <h3 className="text-lg font-bold text-gray-900">프로필 편집</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Avatar Upload Selection */}
                            <div className="flex flex-col items-center">
                                <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-full bg-blue-100 overflow-hidden ring-4 ring-blue-50 transition-all group-hover:ring-blue-100">
                                        <img src={tempAvatar} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-gray-900 text-white p-2.5 rounded-full ring-4 ring-white shadow-lg transition-transform group-hover:scale-110">
                                        <Camera size={16} />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-4 font-bold border-b border-gray-100 pb-1">터치하여 사진 업로드하기</p>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">닉네임</label>
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        placeholder="이름이나 닉네임"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">한 줄 소개</label>
                                    <textarea
                                        rows={2}
                                        value={tempIntro}
                                        onChange={(e) => setTempIntro(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                                        placeholder="목표나 자기소개를 적어주세요"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-8 pt-2">
                            <button
                                onClick={() => {
                                    setProfileName(tempName);
                                    setProfileIntro(tempIntro);
                                    setProfileAvatar(tempAvatar);
                                    setIsEditModalOpen(false);
                                }}
                                className="w-full bg-gray-900 text-white h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-black shadow-xl shadow-gray-200"
                            >
                                <Check size={18} />
                                프로필 저장하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Detail Modal */}
            {selectedFeedback && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center px-6">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setSelectedFeedback(null)}
                    />
                    <div className="relative w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="px-6 pt-8 pb-4 flex justify-between items-start border-b border-gray-50">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">피드백 상세</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">
                                    {selectedFeedback.type === 'mentor' ? 'Mentor Task Feedback' : 'Self Task Feedback'}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedFeedback(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${selectedFeedback.subjectClass}`}>
                                    {selectedFeedback.subjectLabel}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${selectedFeedback.statusClass}`}>
                                    {selectedFeedback.statusLabel}
                                </span>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                                    {selectedFeedback.type === 'mentor' ? '멘토 과제' : '나의 과제'}
                                </span>
                                <span className="ml-auto text-[10px] text-gray-400 font-bold">
                                    {formatFeedbackDate(selectedFeedback.deadline)}
                                </span>
                            </div>

                            <div>
                                <h4 className="text-[15px] font-black text-gray-900">{selectedFeedback.title}</h4>
                            </div>

                            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4">
                                <p className="text-[11px] font-black text-purple-600 mb-2">멘토 피드백</p>
                                <p className="text-[13px] text-gray-700 font-medium leading-relaxed">
                                    {selectedFeedback.feedback}
                                </p>
                                {selectedFeedback.feedbackAlt && (
                                    <p className="text-[12px] text-gray-500 font-medium leading-relaxed mt-3 border-t border-purple-100 pt-3">
                                        {selectedFeedback.feedbackAlt}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="px-6 pb-8">
                            <button
                                onClick={() => router.push(`/planner/${selectedFeedback.taskId}`)}
                                className="w-full bg-gray-900 text-white h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-black"
                            >
                                플래너에서 확인하기
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
