"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Settings,
    CheckCircle2,
    HelpCircle,
    BookOpen,
    Target,
} from "lucide-react";
import Header from "@/components/mentee/layout/Header";
import ProfileEditModal, {
    type ProfileEditData,
} from "@/components/mentee/mypage/ProfileEditModal";
import { supabase } from "@/lib/supabaseClient";
import { adaptProfileToUi, type UiProfile } from "@/lib/menteeAdapters";

export default function MyPage() {
    const router = useRouter();

    // Profile State
    const [profile, setProfile] = useState<UiProfile | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Data States
    const [isLoading, setIsLoading] = useState(true);
    const hasLoadedRef = useRef(false);

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
                    setUserId(user.id);
                }

                const profileRes = await fetch(
                    `/api/mentee/profile?profileId=${user.id}`
                );

                if (profileRes.ok) {
                    const profileJson = await profileRes.json();
                    const nextProfile = adaptProfileToUi(profileJson.profile ?? null);
                    if (isMounted && nextProfile) {
                        setProfile(nextProfile);
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
    }, []);

    const handleSaveProfile = async (data: ProfileEditData) => {
        if (!userId) return;

        const response = await fetch("/api/mentee/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                profileId: userId,
                name: data.name,
                intro: data.intro,
                avatar_url: data.avatar,
                goal: data.goal,
                target_exam: data.targetExam,
                target_date: data.targetDate,
                grade: data.grade,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to update profile");
        }

        const result = await response.json();
        const updatedProfile = adaptProfileToUi(result.profile);
        if (updatedProfile) {
            setProfile(updatedProfile);
        }
    };

    const menuItems = [
        {
            icon: BookOpen,
            label: "서울대쌤 칼럼",
            color: "text-indigo-500",
            bg: "bg-indigo-50",
            href: "/columns",
        },
        {
            icon: HelpCircle,
            label: "고객센터",
            color: "text-orange-500",
            bg: "bg-orange-50",
        },
    ];

    if (isLoading || !profile) {
        return <div className="min-h-screen bg-gray-50" />;
    }

    const formatDDay = (dDay: number | null): string => {
        if (dDay === null) return "";
        if (dDay === 0) return "D-Day";
        if (dDay < 0) return `D+${Math.abs(dDay)}`;
        return `D-${dDay}`;
    };

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
            <section className="px-6 py-8 bg-white mb-4 shadow-sm border-b border-gray-100">
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-blue-100 overflow-hidden ring-4 ring-blue-50 transition-all group-hover:ring-blue-200">
                            <img
                                src={profile.avatar || "/placeholder-avatar.png"}
                                alt="avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full ring-2 ring-white">
                            <CheckCircle2 size={12} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {profile.name || "학생"}님
                                </h2>
                                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                    {profile.grade || "Mentee"}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                프로필 수정
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                            {profile.intro || "서울대학교 입학을 목표로 열공 중 ✨"}
                        </p>
                    </div>
                </div>
            </section>

            {/* Goal & D-Day Card */}
            {(profile.goal || profile.targetDate) && (
                <section className="px-6 mb-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                    <Target size={20} className="text-orange-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 mb-0.5">
                                        {profile.targetExam || "목표"}
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {profile.goal || "목표를 설정해주세요"}
                                    </p>
                                </div>
                            </div>
                            {profile.dDay !== null && (
                                <div className="text-right">
                                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full">
                                        {formatDDay(profile.dDay)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* ETC Menu */}
            <section className="px-6">
                <h3 className="text-[17px] font-black text-gray-900 tracking-tight mb-4">
                    더보기
                </h3>
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
                                    <div
                                        className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-600">
                                        {item.label}
                                    </span>
                                </div>
                                <Settings size={16} className="text-gray-300 opacity-0" />
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Profile Edit Modal */}
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={{
                    name: profile.name,
                    intro: profile.intro,
                    avatar: profile.avatar,
                    goal: profile.goal,
                    targetExam: profile.targetExam,
                    targetDate: profile.targetDate,
                    grade: profile.grade,
                }}
                onSave={handleSaveProfile}
            />
        </div>
    );
}
