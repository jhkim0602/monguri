"use client";

import { useState, useRef, useEffect, ChangeEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Settings,
    CheckCircle2,
    HelpCircle,
    BookOpen,
    Camera,
    CalendarDays,
} from "lucide-react";
import Header from "@/components/mentee/layout/Header";
import { supabase } from "@/lib/supabaseClient";
import {
    adaptProfileToUi,
} from "@/lib/menteeAdapters";
import MentorMeetingSection from "@/components/mentee/mypage/MentorMeetingSection";

export default function MyPage() {
    const router = useRouter();
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const MAX_AVATAR_SIZE_BYTES = 700 * 1024;
    const DDAY_STORAGE_PREFIX = "mentee-d-day";
    const DDAY_LABEL_STORAGE_PREFIX = "mentee-d-day-label";

    // Profile States
    const [profileId, setProfileId] = useState<string | null>(null);
    const [profileName, setProfileName] = useState("");
    const [profileIntro, setProfileIntro] = useState("");
    const [profileAvatar, setProfileAvatar] = useState("");
    const [avatarDraft, setAvatarDraft] = useState("");
    const [lastSavedAvatar, setLastSavedAvatar] = useState("");
    const [isSavingAvatar, setIsSavingAvatar] = useState(false);
    const [avatarSaveState, setAvatarSaveState] = useState<"idle" | "saved" | "error">("idle");
    const [avatarSaveError, setAvatarSaveError] = useState("");
    const [goalDraft, setGoalDraft] = useState("");
    const [lastSavedGoal, setLastSavedGoal] = useState("");
    const [isSavingGoal, setIsSavingGoal] = useState(false);
    const [goalSaveState, setGoalSaveState] = useState<"idle" | "saved" | "error">("idle");
    const [goalSaveError, setGoalSaveError] = useState("");
    const [dDayDateDraft, setDDayDateDraft] = useState("");
    const [lastSavedDDayDate, setLastSavedDDayDate] = useState("");
    const [dDayNameDraft, setDDayNameDraft] = useState("");
    const [lastSavedDDayName, setLastSavedDDayName] = useState("");
    const [isSavingDDay, setIsSavingDDay] = useState(false);
    const [dDaySaveState, setDDaySaveState] = useState<"idle" | "saved" | "local_saved" | "error">("idle");
    const [dDaySaveError, setDDaySaveError] = useState("");

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
                    setProfileId(user.id);
                }

                // Load Profile Only (Tasks removed as FeedbackArchive moved)
                const profileRes = await fetch(`/api/mentee/profile?profileId=${user.id}`);

                if (profileRes.ok) {
                    const profileJson = await profileRes.json();
                    const nextProfile = adaptProfileToUi(profileJson.profile ?? null);
                    if (isMounted && nextProfile) {
                        const intro = nextProfile.intro ?? "";
                        const avatar = nextProfile.avatar ?? "";
                        setProfileName(nextProfile.name);
                        setProfileIntro(intro);
                        setProfileAvatar(avatar);
                        setAvatarDraft(avatar);
                        setLastSavedAvatar(avatar);
                        setAvatarSaveState("idle");
                        setAvatarSaveError("");
                        setGoalDraft(intro);
                        setLastSavedGoal(intro);
                        setGoalSaveState("idle");
                        setGoalSaveError("");
                        const savedDDay = localStorage.getItem(`${DDAY_STORAGE_PREFIX}:${user.id}`) ?? "";
                        const savedDDayLabel =
                            localStorage.getItem(`${DDAY_LABEL_STORAGE_PREFIX}:${user.id}`) ??
                            nextProfile.dDayLabel ??
                            "";
                        setDDayDateDraft(savedDDay);
                        setLastSavedDDayDate(savedDDay);
                        setDDayNameDraft(savedDDayLabel);
                        setLastSavedDDayName(savedDDayLabel);
                        setDDaySaveState("idle");
                        setDDaySaveError("");
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
    }, []); // Only load once

    const isMissingColumnError = (message: string, columnName: string) =>
        message.toLowerCase().includes("column") &&
        message.toLowerCase().includes(columnName.toLowerCase());

    const saveProfileWithClientSupabase = async (updates: {
        intro?: string;
        avatarUrl?: string | null;
        dDayDate?: string | null;
        dDayLabel?: string | null;
    }) => {
        if (!profileId) {
            throw new Error("로그인이 필요합니다.");
        }

        const payload: Record<string, string | null> = {};
        if (updates.intro !== undefined) {
            payload.intro = updates.intro;
        }
        if (updates.avatarUrl !== undefined) {
            payload.avatar_url = updates.avatarUrl;
        }

        let updatedProfile: any = null;

        if (Object.keys(payload).length > 0) {
            const { data, error } = await supabase
                .from("profiles")
                .update(payload)
                .eq("id", profileId)
                .select("id, role, name, avatar_url, intro")
                .maybeSingle();

            if (error) {
                throw new Error(error.message);
            }
            updatedProfile = data ?? null;
        }

        if (updates.dDayDate !== undefined) {
            const dDayColumns = [
                "d_day_date",
                "d_day_target_date",
                "dday_date",
                "target_date",
                "exam_date",
            ] as const;
            let updated = false;
            let lastColumnError: Error | null = null;

            for (const column of dDayColumns) {
                const { error } = await supabase
                    .from("profiles")
                    .update({ [column]: updates.dDayDate })
                    .eq("id", profileId)
                    .select("id")
                    .maybeSingle();

                if (!error) {
                    updated = true;
                    break;
                }

                if (isMissingColumnError(error.message, column)) {
                    lastColumnError = new Error(error.message);
                    continue;
                }

                throw new Error(error.message);
            }

            if (!updated) {
                throw (
                    lastColumnError ??
                    new Error("D-day 컬럼을 찾지 못했습니다.")
                );
            }
        }

        if (updates.dDayLabel !== undefined) {
            const dDayLabelColumns = [
                "d_day_label",
                "d_day_name",
                "dday_label",
                "dday_name",
                "target_label",
                "exam_label",
            ] as const;
            let updated = false;
            let lastColumnError: Error | null = null;

            for (const column of dDayLabelColumns) {
                const { error } = await supabase
                    .from("profiles")
                    .update({ [column]: updates.dDayLabel })
                    .eq("id", profileId)
                    .select("id")
                    .maybeSingle();

                if (!error) {
                    updated = true;
                    break;
                }

                if (isMissingColumnError(error.message, column)) {
                    lastColumnError = new Error(error.message);
                    continue;
                }

                throw new Error(error.message);
            }

            if (!updated) {
                throw (
                    lastColumnError ??
                    new Error("D-day 이름 컬럼을 찾지 못했습니다.")
                );
            }
        }

        return adaptProfileToUi((updatedProfile as any) ?? null);
    };

    const dDayNameLabel = useMemo(() => {
        const trimmed = dDayNameDraft.trim();
        return trimmed.length > 0 ? trimmed : "D-day";
    }, [dDayNameDraft]);

    const dDayValueLabel = useMemo(() => {
        if (!dDayDateDraft) return "미설정";
        const target = new Date(`${dDayDateDraft}T00:00:00`);
        if (Number.isNaN(target.getTime())) return "미설정";
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil(
            (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays > 0) return `D-${diffDays}`;
        if (diffDays === 0) return "D-Day";
        return `D+${Math.abs(diffDays)}`;
    }, [dDayDateDraft]);

    const handleAvatarFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setAvatarSaveState("error");
            setAvatarSaveError("이미지 파일만 업로드할 수 있어요.");
            return;
        }

        if (file.size > MAX_AVATAR_SIZE_BYTES) {
            setAvatarSaveState("error");
            setAvatarSaveError("이미지 용량은 700KB 이하만 업로드할 수 있어요.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : "";
            if (!result) {
                setAvatarSaveState("error");
                setAvatarSaveError("이미지 파일을 읽지 못했어요.");
                return;
            }

            setAvatarDraft(result);
            setAvatarSaveState("idle");
            setAvatarSaveError("");
        };
        reader.onerror = () => {
            setAvatarSaveState("error");
            setAvatarSaveError("이미지 파일을 읽는 중 오류가 발생했어요.");
        };
        reader.readAsDataURL(file);
    };

    const handleSaveAvatar = async () => {
        if (!profileId || isSavingAvatar) return;

        if (avatarDraft === lastSavedAvatar) {
            setAvatarSaveState("saved");
            return;
        }

        setIsSavingAvatar(true);
        setAvatarSaveState("idle");
        setAvatarSaveError("");

        try {
            let savedAvatar = avatarDraft;
            const response = await fetch("/api/mentee/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileId,
                    avatarUrl: avatarDraft || null,
                }),
            });

            if (!response.ok) {
                const errorJson = await response.json().catch(() => null);
                const errorMessage = errorJson?.error ?? "프로필 사진 저장에 실패했습니다.";

                if (
                    response.status === 403 &&
                    String(errorMessage).includes("Profile is not a mentee.")
                ) {
                    const fallbackProfile = await saveProfileWithClientSupabase({
                        avatarUrl: avatarDraft || null,
                    });
                    savedAvatar = fallbackProfile?.avatar ?? avatarDraft;
                } else {
                    throw new Error(errorMessage);
                }
            } else {
                const json = await response.json();
                const updatedProfile = adaptProfileToUi(json.profile ?? null);
                savedAvatar = updatedProfile?.avatar ?? avatarDraft;
            }

            setProfileAvatar(savedAvatar);
            setAvatarDraft(savedAvatar);
            setLastSavedAvatar(savedAvatar);
            setAvatarSaveState("saved");
        } catch (error) {
            console.error("Failed to save avatar", error);
            setAvatarSaveState("error");
            setAvatarSaveError(
                error instanceof Error ? error.message : "프로필 사진 저장에 실패했습니다.",
            );
        } finally {
            setIsSavingAvatar(false);
        }
    };

    const handleSaveGoal = async () => {
        if (!profileId || isSavingGoal) return;

        if (goalDraft === lastSavedGoal) {
            setGoalSaveState("saved");
            return;
        }

        setIsSavingGoal(true);
        setGoalSaveState("idle");
        setGoalSaveError("");

        try {
            let savedGoal = goalDraft.trim();
            const response = await fetch("/api/mentee/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profileId,
                    intro: goalDraft.trim(),
                }),
            });

            if (!response.ok) {
                const errorJson = await response.json().catch(() => null);
                const errorMessage = errorJson?.error ?? "목표 저장에 실패했습니다.";

                if (
                    response.status === 403 &&
                    String(errorMessage).includes("Profile is not a mentee.")
                ) {
                    const fallbackProfile = await saveProfileWithClientSupabase({
                        intro: goalDraft.trim(),
                    });
                    savedGoal = fallbackProfile?.intro ?? goalDraft.trim();
                } else {
                    throw new Error(errorMessage);
                }
            } else {
                const json = await response.json();
                const updatedProfile = adaptProfileToUi(json.profile ?? null);
                savedGoal = updatedProfile?.intro ?? goalDraft.trim();
            }

            setProfileIntro(savedGoal);
            setGoalDraft(savedGoal);
            setLastSavedGoal(savedGoal);
            setGoalSaveState("saved");
        } catch (error) {
            console.error("Failed to save goal", error);
            setGoalSaveState("error");
            setGoalSaveError(
                error instanceof Error ? error.message : "목표 저장에 실패했습니다.",
            );
        } finally {
            setIsSavingGoal(false);
        }
    };

    const handleSaveDDay = async () => {
        if (!profileId || isSavingDDay) return;

        if (
            dDayDateDraft === lastSavedDDayDate &&
            dDayNameDraft.trim() === lastSavedDDayName
        ) {
            setDDaySaveState("saved");
            return;
        }

        setIsSavingDDay(true);
        setDDaySaveState("idle");
        setDDaySaveError("");

        try {
            let savedLocallyOnly = false;
            try {
                await saveProfileWithClientSupabase({
                    dDayDate: dDayDateDraft || null,
                    dDayLabel: dDayNameDraft.trim() || null,
                });
            } catch (error) {
                console.warn("Failed to persist D-day to profile columns", error);
                savedLocallyOnly = true;
            }

            const storageKey = `${DDAY_STORAGE_PREFIX}:${profileId}`;
            const labelStorageKey = `${DDAY_LABEL_STORAGE_PREFIX}:${profileId}`;
            if (dDayDateDraft) {
                localStorage.setItem(storageKey, dDayDateDraft);
            } else {
                localStorage.removeItem(storageKey);
            }
            if (dDayNameDraft.trim()) {
                localStorage.setItem(labelStorageKey, dDayNameDraft.trim());
            } else {
                localStorage.removeItem(labelStorageKey);
            }

            setLastSavedDDayDate(dDayDateDraft);
            setLastSavedDDayName(dDayNameDraft.trim());
            setDDaySaveState(savedLocallyOnly ? "local_saved" : "saved");
            if (savedLocallyOnly) {
                setDDaySaveError("서버 저장 실패. 현재 기기에 임시 저장되었습니다.");
            }
        } catch (error) {
            console.error("Failed to save D-day", error);
            setDDaySaveState("error");
            setDDaySaveError(
                error instanceof Error ? error.message : "D-day 저장에 실패했습니다.",
            );
        } finally {
            setIsSavingDDay(false);
        }
    };

    const menuItems = [
        { icon: BookOpen, label: "서울대쌤 칼럼", color: "text-indigo-500", bg: "bg-indigo-50", href: "/columns" },
        { icon: HelpCircle, label: "고객센터", color: "text-orange-500", bg: "bg-orange-50" },
    ];

    if (isLoading) {
        return <div className="min-h-screen bg-gray-50" />;
    }

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
                            <img src={avatarDraft || profileAvatar || "/placeholder-avatar.png"} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1.5 rounded-full ring-2 ring-white">
                            <CheckCircle2 size={12} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-900">{profileName || "학생"}님</h2>
                                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Mentee</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                            {profileIntro || "목표를 설정해보세요."}
                        </p>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                        className="hidden"
                        onChange={handleAvatarFileChange}
                    />
                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-[11px] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <Camera size={13} />
                        사진 선택
                    </button>
                    <div className="flex-1" />
                    <button
                        type="button"
                        onClick={handleSaveAvatar}
                        disabled={!profileId || isSavingAvatar}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${!profileId || isSavingAvatar
                            ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                            : "bg-primary text-white border-primary hover:bg-primary/90"
                            }`}
                    >
                        {isSavingAvatar ? "저장 중..." : "사진 저장"}
                    </button>
                </div>
                <p className="mt-2 text-[11px] font-semibold text-gray-400">
                    {avatarSaveState === "saved"
                        ? "프로필 사진 저장됨"
                        : avatarSaveState === "error"
                            ? avatarSaveError || "프로필 사진 저장 실패"
                            : avatarDraft === lastSavedAvatar
                                ? "저장된 프로필 사진"
                                : "새 프로필 사진 저장 필요"}
                </p>
            </section>

            <section id="goal-setting" className="px-6 mb-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <h3 className="text-sm font-black text-gray-900 mb-2">목표 설정</h3>
                    <p className="text-xs text-gray-500 mb-3">
                        마이페이지 목표를 저장하면 홈/멘토 화면에도 같은 목표가 노출됩니다.
                    </p>
                    <textarea
                        value={goalDraft}
                        onChange={(event) => {
                            setGoalDraft(event.target.value);
                            if (goalSaveState !== "idle") {
                                setGoalSaveState("idle");
                                setGoalSaveError("");
                            }
                        }}
                        placeholder="예: 6월 모의고사 수학 1등급 달성"
                        className="w-full min-h-[110px] rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        maxLength={500}
                    />
                    <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-[11px] text-gray-400 font-semibold">
                            {goalSaveState === "saved"
                                ? "저장됨"
                                : goalSaveState === "error"
                                    ? goalSaveError || "저장 실패"
                                    : goalDraft === lastSavedGoal
                                        ? "저장된 목표"
                                        : "저장 필요"}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400 font-semibold">
                                {goalDraft.length}/500
                            </span>
                            <button
                                type="button"
                                onClick={handleSaveGoal}
                                disabled={!profileId || isSavingGoal}
                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${!profileId || isSavingGoal
                                    ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                                    : "bg-primary text-white border-primary hover:bg-primary/90"
                                    }`}
                            >
                                {isSavingGoal ? "저장 중..." : "목표 저장"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="dday-setting" className="px-6 mb-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <h3 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-2">
                        <CalendarDays size={16} className="text-blue-500" />
                        D-day 설정
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                        이름과 목표 날짜를 설정하면 홈 화면 배지에 같이 표시됩니다.
                    </p>
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            value={dDayNameDraft}
                            onChange={(event) => {
                                setDDayNameDraft(event.target.value);
                                if (dDaySaveState !== "idle") {
                                    setDDaySaveState("idle");
                                    setDDaySaveError("");
                                }
                            }}
                            placeholder="예: 수능 / 기말고사"
                            maxLength={30}
                            className="h-10 px-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        />
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dDayDateDraft}
                                onChange={(event) => {
                                    setDDayDateDraft(event.target.value);
                                    if (dDaySaveState !== "idle") {
                                        setDDaySaveState("idle");
                                        setDDaySaveError("");
                                    }
                                }}
                                className="h-10 px-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            />
                            <span className="inline-flex items-center justify-center px-3 h-10 rounded-xl bg-blue-50 text-blue-600 text-sm font-black min-w-[84px]">
                                {dDayNameLabel} {dDayValueLabel}
                            </span>
                            <button
                                type="button"
                                onClick={handleSaveDDay}
                                disabled={!profileId || isSavingDDay}
                                className={`px-3 py-2 rounded-full text-[11px] font-bold border transition-colors ${!profileId || isSavingDDay
                                    ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                                    : "bg-primary text-white border-primary hover:bg-primary/90"
                                    }`}
                            >
                                {isSavingDDay ? "저장 중..." : "D-day 저장"}
                            </button>
                        </div>
                    </div>
                    <p className="mt-2 text-[11px] text-gray-400 font-semibold">
                        {dDaySaveState === "saved"
                            ? "저장됨"
                            : dDaySaveState === "local_saved"
                                ? dDaySaveError || "임시 저장됨"
                                : dDaySaveState === "error"
                                    ? dDaySaveError || "저장 실패"
                                    : (
                                        dDayDateDraft === lastSavedDDayDate &&
                                        dDayNameDraft.trim() === lastSavedDDayName
                                    )
                                        ? "저장된 D-day"
                                        : "저장 필요"}
                    </p>
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
