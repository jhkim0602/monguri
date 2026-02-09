"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabaseClient";

export type MentorProfile = {
  id: string;
  role: "mentor" | "mentee" | "admin";
  name: string | null;
  avatar_url: string | null;
  intro: string | null;
  goal: string | null;
  target_exam: string | null;
  target_date: string | null;
  grade: string | null;
  created_at: string;
};

type MentorProfileUpdates = {
  name?: string;
  intro?: string | null;
  avatar_url?: string | null;
};

type MentorProfileContextValue = {
  mentorId: string | null;
  profile: MentorProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: MentorProfileUpdates) => Promise<MentorProfile>;
};

const MentorProfileContext = createContext<MentorProfileContextValue | undefined>(
  undefined,
);

export function MentorProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMentorId(null);
        setProfile(null);
        setError("로그인이 필요합니다.");
        return;
      }

      setMentorId(user.id);
      const response = await fetch(
        `/api/mentor/profile?mentorId=${encodeURIComponent(user.id)}`,
      );
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "프로필 정보를 불러오지 못했습니다.");
      }

      setProfile(result.data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "프로필 정보를 불러오지 못했습니다.";
      setError(message);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: MentorProfileUpdates) => {
      if (!mentorId) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch("/api/mentor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId,
          ...updates,
        }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "프로필 저장에 실패했습니다.");
      }

      setProfile(result.data);
      return result.data as MentorProfile;
    },
    [mentorId],
  );

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const value = useMemo(
    () => ({
      mentorId,
      profile,
      isLoading,
      error,
      refreshProfile,
      updateProfile,
    }),
    [mentorId, profile, isLoading, error, refreshProfile, updateProfile],
  );

  return (
    <MentorProfileContext.Provider value={value}>
      {children}
    </MentorProfileContext.Provider>
  );
}

export function useMentorProfile() {
  const context = useContext(MentorProfileContext);
  if (!context) {
    throw new Error("useMentorProfile must be used within MentorProfileProvider");
  }
  return context;
}
