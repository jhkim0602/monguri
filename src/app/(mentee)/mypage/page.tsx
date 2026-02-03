"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    User,
    Settings,
    ChevronRight,
    ChevronRight as ArrowRight,
    BookOpen,
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
import { USER_PROFILE, MENTOR_TASKS, DEFAULT_CATEGORIES } from "@/constants/common";

export default function MyPage() {
    const router = useRouter();

    // Profile Edit States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profileName, setProfileName] = useState(USER_PROFILE.name);
    const [profileIntro, setProfileIntro] = useState("서울대학교 입학을 목표로 열공 중 ✨");
    const [profileAvatar, setProfileAvatar] = useState(USER_PROFILE.avatar);

    // Achievement Detail State (Default to Korean)
    const [selectedStatSubject, setSelectedStatSubject] = useState<string>('korean');

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Calculate subject-wise achievement
    const getSubjectStats = (categoryId: string) => {
        const subjectTasks = MENTOR_TASKS.filter(t => t.categoryId === categoryId);
        if (subjectTasks.length === 0) return 0;
        const completed = subjectTasks.filter(t => t.status !== 'pending').length;
        return Math.round((completed / subjectTasks.length) * 100);
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
        <div className="h-full overflow-y-auto bg-gray-50 pb-32">
            {/* Header */}
            <header className="px-6 pt-8 pb-6 flex justify-between items-center bg-white sticky top-0 z-20 border-b border-gray-50">
                <h1 className="text-xl font-bold text-gray-900 border-l-4 border-primary pl-3">마이페이지</h1>
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                    <Settings size={22} />
                </button>
            </header>

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
                    <div className="bg-primary/5 px-3 py-1 rounded-full">
                        <span className="text-[10px] text-primary font-black uppercase tracking-widest">Growth Tracking</span>
                    </div>
                </div>

                {/* Subject Tab Bar */}
                <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-[20px] mb-6">
                    {subjects.map(subject => {
                        const isSelected = selectedStatSubject === subject.id;
                        const Icon = subject.icon;
                        return (
                            <button
                                key={subject.id}
                                onClick={() => setSelectedStatSubject(subject.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] transition-all duration-300 ${isSelected
                                    ? 'bg-white shadow-md text-gray-900'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Icon size={16} className={isSelected ? `text-${subject.color}-500` : ''} />
                                <span className="text-sm font-bold">{subject.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content: Achievement Detail */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                        {/* Background Decor */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${subjects.find(s => s.id === selectedStatSubject)?.color}-50 rounded-full blur-3xl opacity-60`} />

                        <div className="relative z-10 flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-[20px] font-black text-gray-900 mb-1">
                                    {subjects.find(s => s.id === selectedStatSubject)?.name} 마스터리
                                </h4>
                                <p className="text-xs text-gray-400 font-medium">멘토가 지정한 핵심 과제 위주 요약</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-[32px] font-black text-${subjects.find(s => s.id === selectedStatSubject)?.color}-500 leading-none`}>
                                    {getSubjectStats(selectedStatSubject)}%
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-4 w-full bg-gray-50 rounded-full mb-8 overflow-hidden p-1 border border-gray-100">
                            <div
                                className={`h-full bg-${subjects.find(s => s.id === selectedStatSubject)?.color}-500 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                                style={{ width: `${getSubjectStats(selectedStatSubject)}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Remaining Tasks */}
                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                    Todo
                                </p>
                                <div className="space-y-2">
                                    {MENTOR_TASKS.filter(t => t.categoryId === selectedStatSubject && t.status === 'pending').slice(0, 2).map(task => (
                                        <div key={task.id} className="text-[11px] font-bold text-gray-600 line-clamp-1">{task.title}</div>
                                    ))}
                                    {MENTOR_TASKS.filter(t => t.categoryId === selectedStatSubject && t.status === 'pending').length === 0 && (
                                        <div className="text-[11px] font-bold text-gray-300">남은 과제 없음 ✨</div>
                                    )}
                                    <div className="text-[10px] text-gray-400 mt-1 font-medium">
                                        총 {MENTOR_TASKS.filter(t => t.categoryId === selectedStatSubject && t.status === 'pending').length}개 남음
                                    </div>
                                </div>
                            </div>

                            {/* Completed Tasks */}
                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    Done
                                </p>
                                <div className="space-y-2">
                                    {MENTOR_TASKS.filter(t => t.categoryId === selectedStatSubject && t.status !== 'pending').slice(0, 2).map(task => (
                                        <div key={task.id} className="text-[11px] font-medium text-gray-400 line-through line-clamp-1">{task.title}</div>
                                    ))}
                                    {MENTOR_TASKS.filter(t => t.categoryId === selectedStatSubject && t.status !== 'pending').length === 0 && (
                                        <div className="text-[11px] font-bold text-gray-300">완료된 과제 없음</div>
                                    )}
                                    <div className="text-[10px] text-gray-400 mt-1 font-medium">
                                        총 {MENTOR_TASKS.filter(t => t.categoryId === selectedStatSubject && t.status !== 'pending').length}개 완료
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/planner')}
                            className="w-full mt-6 py-4 rounded-2xl bg-gray-900 text-white text-[12px] font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-gray-200"
                        >
                            플래너에서 관리하기
                            <ArrowRight size={14} />
                        </button>
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

            {/* Floating Counseling Button - Positioned relative to the 430px container */}
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
