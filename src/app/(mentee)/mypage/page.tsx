"use client";

<<<<<<< HEAD
import { useState, useRef, useEffect } from "react";
=======
import { useState } from "react";
>>>>>>> origin/sunbal
import { useRouter } from "next/navigation";
import {
    Settings,
    CheckCircle2,
    HelpCircle,
    BookOpen,
} from "lucide-react";
<<<<<<< HEAD
import Header from "@/components/mentee/layout/Header";
import { supabase } from "@/lib/supabaseClient";
import {
    adaptMentorTasksToUi,
    adaptProfileToUi,
    type MentorTaskLike,
} from "@/lib/menteeAdapters";
=======
import { USER_PROFILE } from "@/constants/common";
import Header from "@/components/mentee/layout/Header";
import FeedbackArchive from "@/components/mentee/mypage/FeedbackArchive";
import MentorMeetingSection from "@/components/mentee/mypage/MentorMeetingSection";
>>>>>>> origin/sunbal

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

<<<<<<< HEAD
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

=======
>>>>>>> origin/sunbal
    // Temp states for modal
    const [tempName, setTempName] = useState(profileName);
    const [tempIntro, setTempIntro] = useState(profileIntro);
    const [tempAvatar, setTempAvatar] = useState(profileAvatar);

<<<<<<< HEAD
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

=======
>>>>>>> origin/sunbal
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setTempAvatar(imageUrl);
        }
    };

    const menuItems = [
        { icon: BookOpen, label: "서울대쌤 칼럼", color: "text-indigo-500", bg: "bg-indigo-50", href: "/columns" },
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
            <section className="px-6 py-8 bg-white mb-6 shadow-sm border-b border-gray-100">
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

            {/* Mentor Meeting Section */}
            <MentorMeetingSection />

            {/* ETC Menu */}
            <section className="px-6">
                <h3 className="text-[17px] font-black text-gray-900 tracking-tight mb-4">더보기</h3>
                <div className="space-y-3">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => item.href && router.push(item.href)}
                                className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-600">{item.label}</span>
                                </div>
                                <Settings size={16} className="text-gray-300 opacity-0" /> {/* Spacer */}
                            </button>
                        );
                    })}
                </div>
            </section>

        </div>
    );
}
