"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Settings,
    CheckCircle2,
    HelpCircle,
    BookOpen,
} from "lucide-react";
import { USER_PROFILE } from "@/constants/common";
import Header from "@/components/mentee/layout/Header";
import FeedbackArchive from "@/components/mentee/mypage/FeedbackArchive";
import MentorMeetingSection from "@/components/mentee/mypage/MentorMeetingSection";

export default function MyPage() {
    const router = useRouter();

    // Profile Edit States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profileName, setProfileName] = useState(USER_PROFILE.name);
    const [profileIntro, setProfileIntro] = useState("서울대학교 입학을 목표로 열공 중 ✨");
    const [profileAvatar, setProfileAvatar] = useState(USER_PROFILE.avatar);

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
