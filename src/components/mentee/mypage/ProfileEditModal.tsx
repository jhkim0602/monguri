"use client";

import { useState, useEffect } from "react";
import { X, Target, Calendar, Shuffle } from "lucide-react";

export interface ProfileEditData {
  name: string;
  intro: string;
  avatar: string;
  goal: string;
  targetExam: string;
  targetDate: string | null;
  grade: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ProfileEditData;
  onSave: (data: ProfileEditData) => Promise<void>;
}

const GRADE_OPTIONS = [
  { value: "고1", label: "고등학교 1학년" },
  { value: "고2", label: "고등학교 2학년" },
  { value: "고3", label: "고등학교 3학년" },
  { value: "N수", label: "N수생" },
  { value: "중3", label: "중학교 3학년" },
];

const EXAM_OPTIONS = [
  { value: "2026 수능", label: "2026 수능" },
  { value: "2025 수능", label: "2025 수능" },
  { value: "6월 모의고사", label: "6월 모의고사" },
  { value: "9월 모의고사", label: "9월 모의고사" },
  { value: "내신 시험", label: "내신 시험" },
  { value: "기타", label: "기타" },
];

// DiceBear avatar styles
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

// Extract style and seed from DiceBear URL
function parseAvatarUrl(url: string): { style: string; seed: string } {
  const match = url.match(/dicebear\.com\/[\d.x]+\/([^/]+)\/svg\?seed=(.+)/);
  if (match) {
    return { style: match[1], seed: match[2] };
  }
  return { style: "notionists", seed: "default" };
}

// Generate DiceBear URL
function generateAvatarUrl(style: string, seed: string): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

// Generate random seed
function generateRandomSeed(): string {
  return Math.random().toString(36).substring(2, 10);
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<ProfileEditData>(initialData);
  const [isSaving, setIsSaving] = useState(false);

  // Avatar state
  const parsed = parseAvatarUrl(initialData.avatar);
  const [avatarStyle, setAvatarStyle] = useState(parsed.style);
  const [avatarSeed, setAvatarSeed] = useState(parsed.seed || initialData.name || "default");

  // Update avatar URL when style or seed changes
  useEffect(() => {
    const newAvatarUrl = generateAvatarUrl(avatarStyle, avatarSeed);
    setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));
  }, [avatarStyle, avatarSeed]);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      const parsed = parseAvatarUrl(initialData.avatar);
      setAvatarStyle(parsed.style);
      setAvatarSeed(parsed.seed || initialData.name || "default");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("프로필 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShuffleSeed = () => {
    setAvatarSeed(generateRandomSeed());
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
            프로필 수정
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-all active:scale-90"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Avatar Section */}
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-blue-100 overflow-hidden ring-4 ring-blue-50">
                  <img
                    src={formData.avatar || generateAvatarUrl("notionists", formData.name || "default")}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleShuffleSeed}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors active:scale-90"
                >
                  <Shuffle size={16} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">버튼을 눌러 아바타 변경</p>
            </div>

            {/* Avatar Style Selector */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-2">
                아바타 스타일
              </label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setAvatarStyle(style.id)}
                    className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                      avatarStyle === style.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <img
                      src={generateAvatarUrl(style.id, avatarSeed)}
                      alt={style.label}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="text-[10px] font-bold text-gray-600 mt-1">
                      {style.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                학년
              </label>
              <select
                value={formData.grade}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, grade: e.target.value }))
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">학년 선택</option>
                {GRADE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                한 줄 소개
              </label>
              <input
                type="text"
                value={formData.intro}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, intro: e.target.value }))
                }
                placeholder="한 줄 소개를 입력하세요"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200" />

          {/* Goal Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Target size={16} className="text-orange-500" />
              </div>
              <span className="text-sm font-bold text-gray-900">목표 설정</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                목표 대학/학과
              </label>
              <input
                type="text"
                value={formData.goal}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, goal: e.target.value }))
                }
                placeholder="예: 서울대 경영학과"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* D-Day Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar size={16} className="text-blue-500" />
              </div>
              <span className="text-sm font-bold text-gray-900">D-Day 설정</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                시험 종류
              </label>
              <select
                value={formData.targetExam}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetExam: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              >
                <option value="">시험 선택</option>
                {EXAM_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">
                시험 날짜
              </label>
              <input
                type="date"
                value={formData.targetDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    targetDate: e.target.value || null,
                  }))
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full py-3.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
