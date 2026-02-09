"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Shuffle, X } from "lucide-react";

import { useMentorProfile } from "@/contexts/MentorProfileContext";

type MentorProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AVATAR_STYLES = [
  { id: "notionists", label: "노션" },
  { id: "avataaars", label: "카툰" },
  { id: "lorelei", label: "일러스트" },
  { id: "micah", label: "심플" },
  { id: "adventurer", label: "어드벤처" },
  { id: "big-smile", label: "스마일" },
  { id: "bottts", label: "로봇" },
  { id: "thumbs", label: "엄지" },
];

function parseAvatarUrl(url: string): { style: string; seed: string } {
  const match = url.match(/dicebear\.com\/[\d.x]+\/([^/]+)\/svg\?seed=(.+)/);
  if (match) {
    return { style: match[1], seed: decodeURIComponent(match[2]) };
  }
  return { style: "notionists", seed: "default" };
}

function generateAvatarUrl(style: string, seed: string): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}

export default function MentorProfileModal({
  isOpen,
  onClose,
}: MentorProfileModalProps) {
  const { profile, updateProfile } = useMentorProfile();
  const [name, setName] = useState("");
  const [intro, setIntro] = useState("");
  const [avatarStyle, setAvatarStyle] = useState("notionists");
  const [avatarSeed, setAvatarSeed] = useState("default");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const parsed = parseAvatarUrl(profile?.avatar_url ?? "");
    const nextSeed = parsed.seed || profile?.name || "default";

    setName(profile?.name ?? "");
    setIntro(profile?.intro ?? "");
    setAvatarStyle(parsed.style);
    setAvatarSeed(nextSeed);
    setError(null);
    setSuccessMessage(null);
  }, [isOpen, profile]);

  const normalizedName = name.trim();
  const normalizedIntro = intro.trim();
  const normalizedSeed = avatarSeed.trim() || normalizedName || "default";
  const selectedAvatarUrl = generateAvatarUrl(avatarStyle, normalizedSeed);

  const hasChanges = useMemo(() => {
    if (!profile) return normalizedName.length > 0;
    return (
      normalizedName !== (profile.name ?? "") ||
      normalizedIntro !== (profile.intro ?? "") ||
      selectedAvatarUrl !== (profile.avatar_url ?? "")
    );
  }, [normalizedIntro, normalizedName, profile, selectedAvatarUrl]);

  const isSaveDisabled = !normalizedName || !hasChanges || isSaving;

  const handleSave = async () => {
    if (!normalizedName) {
      setError("이름을 입력해주세요.");
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      await updateProfile({
        name: normalizedName,
        intro: normalizedIntro || null,
        avatar_url: selectedAvatarUrl,
      });
      setSuccessMessage("프로필이 저장되었습니다.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShuffleSeed = () => {
    setAvatarSeed(generateRandomSeed());
  };

  if (!isOpen) return null;

  const previewAvatar = selectedAvatarUrl;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 px-4 py-6">
      <div className="relative w-full max-w-xl rounded-2xl border border-gray-100 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="닫기"
        >
          <X size={18} />
        </button>

        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-black text-gray-900">멘토 프로필 설정</h2>
          <p className="mt-1 text-sm text-gray-500">
            상단/사이드바에 표시되는 내 프로필 정보를 수정합니다.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="relative">
              <img
                src={previewAvatar}
                alt="멘토 프로필 미리보기"
                className="h-14 w-14 rounded-xl border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={handleShuffleSeed}
                className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 text-white transition-colors hover:bg-primary/90"
                aria-label="아바타 랜덤 변경"
              >
                <Shuffle size={12} />
              </button>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {normalizedName || "멘토"}
              </p>
              <p className="text-xs text-gray-500">
                {normalizedIntro || "소개를 입력해보세요."}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">
                버튼을 눌러 아바타 변경
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
              아바타 스타일
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setAvatarStyle(style.id)}
                  className={`flex flex-col items-center rounded-xl border-2 p-2 transition-all ${
                    avatarStyle === style.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <img
                    src={generateAvatarUrl(style.id, normalizedSeed)}
                    alt={style.label}
                    className="h-9 w-9 rounded-full"
                  />
                  <span className="mt-1 text-[10px] font-bold text-gray-600">
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
              이름
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
              소개
            </label>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="전공/강점 등을 간단히 소개해주세요"
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {successMessage}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
