"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Settings,
    ChevronRight,
    ChevronRight as ArrowRight,
    CheckCircle2,
    MessageCircle,
    Lock,
    Bell,
    HelpCircle,
    Info,
    LogOut,
    Camera,
    X,
    Check,
    Library,
    Calculator,
    Languages
} from "lucide-react";
import Header from "@/components/mentee/layout/Header";
import { supabase } from "@/lib/supabaseClient";
import {
    adaptMentorTasksToUi,
    adaptProfileToUi,
    type MentorTaskLike,
} from "@/lib/menteeAdapters";

export default function MyPage() {
    const router = useRouter();

    // Profile Edit States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profileName, setProfileName] = useState("");
    const [profileIntro, setProfileIntro] = useState("서울대학교 입학을 목표로 열공 중 ✨");
    const [profileAvatar, setProfileAvatar] = useState("");
    const [mentorTasks, setMentorTasks] = useState<MentorTaskLike[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedRef = useRef(false);

    // Achievement Detail State
    const [selectedStatSubject, setSelectedStatSubject] = useState<string>('korean');
    const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

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

                const [tasksRes, profileRes] = await Promise.all([
                    fetch(`/api/mentee/tasks?menteeId=${user.id}`),
                    fetch(`/api/mentee/profile?profileId=${user.id}`)
                ]);

                if (tasksRes.ok) {
                    const tasksJson = await tasksRes.json();
                    if (isMounted && Array.isArray(tasksJson.tasks)) {
                        setMentorTasks(adaptMentorTasksToUi(tasksJson.tasks));
                    }
                }

                if (profileRes.ok) {
                    const profileJson = await profileRes.json();
                    const nextProfile = adaptProfileToUi(profileJson.profile ?? null);
                    if (isMounted && nextProfile) {
                        setProfileName(nextProfile.name);
                        setProfileAvatar(nextProfile.avatar);
                        if (!isEditModalOpen) {
                            setTempName(nextProfile.name);
                            setTempAvatar(nextProfile.avatar);
                        }
                    }
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
    }, [isEditModalOpen]);

    // Temp states for modal
    const [tempName, setTempName] = useState(profileName);
    const [tempIntro, setTempIntro] = useState(profileIntro);
    const [tempAvatar, setTempAvatar] = useState(profileAvatar);

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50" />;
    }

    // Filter Tasks based on period
    const getFilteredTasks = (categoryId: string, period: 'daily' | 'weekly' | 'monthly') => {
        const today = new Date(2026, 1, 2); // Standard "today" for the app
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        return mentorTasks.filter(t => {
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

    const menuItems = [
        { icon: Bell, label: "공지사항", color: "text-blue-500", bg: "bg-blue-50" },
        { icon: Lock, label: "개인정보 조치", color: "text-emerald-500", bg: "bg-emerald-50" },
        { icon: HelpCircle, label: "고객센터", color: "text-orange-500", bg: "bg-orange-50" },
        { icon: Info, label: "앱 정보", color: "text-gray-500", bg: "bg-gray-100" },
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
                    onClick={() => setIsDetailModalOpen(true)}
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
                        <header className="px-6 pt-8 pb-4 flex justify-between items-center border-b border-gray-50 flex-shrink-0">
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

            {/* Floating Counseling Button */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] pointer-events-none z-40 px-6 flex justify-end">
                <button className="pointer-events-auto bg-gray-900 text-white pl-4 pr-6 py-3.5 rounded-full shadow-2xl flex items-center gap-2 active:scale-95 transition-all hover:bg-black group">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center group-hover:animate-bounce">
                        <MessageCircle size={16} fill="white" />
                    </div>
                    <span className="text-sm font-black whitespace-nowrap">상담받아보기</span>
                </button>
            </div>

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
        </div>
    );
}
