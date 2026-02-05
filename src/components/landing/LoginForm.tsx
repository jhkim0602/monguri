"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
    setErrorMessage(null);
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      setErrorMessage("로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.");
      setIsLoading(false);
      return;
=======
    if (id.startsWith("admin") || id.startsWith("mentor")) {
      router.push("/dashboard");
    } else {
      router.push("/home");
>>>>>>> origin/sunbal
    }

    let role = "mentee";
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role) {
      role = profile.role;
    } else if (profileError && profileError.code === "PGRST116") {
      const inferredRole =
        email.startsWith("monguri_mentor") ? "mentor" : email.startsWith("admin") ? "admin" : "mentee";
      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .insert({ id: data.user.id, role: inferredRole })
        .select("role")
        .single();

      if (insertError || !inserted?.role) {
        setErrorMessage("프로필 정보를 생성할 수 없습니다. 잠시 후 다시 시도해 주세요.");
        setIsLoading(false);
        return;
      }
      role = inserted.role;
    } else if (profileError) {
      setErrorMessage("프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setIsLoading(false);
      return;
    }

    router.push(role === "mentor" || role === "admin" ? "/mentor" : "/home");
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-sm bg-white/80 backdrop-blur-md p-8 rounded-[32px] border border-white/50 shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-gray-900 mb-2">시작하기</h2>
        <p className="text-sm text-gray-500 font-medium">
          멘토와 멘티, 성장을 위한 연결
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
<<<<<<< HEAD
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">이메일</label>
=======
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
            아이디
          </label>
>>>>>>> origin/sunbal
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={18} />
            </div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
            비밀번호
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 mt-6 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200"
        >
          {isLoading ? "로그인 중..." : "로그인하고 시작하기"}
          <ArrowRight size={18} />
        </button>
      </form>

      {errorMessage && (
        <p className="mt-4 text-xs text-red-500 font-semibold text-center">{errorMessage}</p>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 text-center mb-3">
          체험용 계정 (클릭 시 자동 입력)
        </p>
        <div className="flex gap-2 justify-center">
          <button
<<<<<<< HEAD
            onClick={() => { setEmail("monguri_mentor_01@example.com"); setPassword("password123"); }}
=======
            onClick={() => {
              setId("mentor1");
              setPassword("password");
            }}
>>>>>>> origin/sunbal
            className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold hover:bg-purple-100 transition-colors border border-purple-100"
          >
            Mentor 1
          </button>
          <button
<<<<<<< HEAD
            onClick={() => { setEmail("monguri_mentee_01@example.com"); setPassword("password123"); }}
=======
            onClick={() => {
              setId("mentee1");
              setPassword("password");
            }}
>>>>>>> origin/sunbal
            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-colors border border-blue-100"
          >
            Mentee 1
          </button>
          <button
<<<<<<< HEAD
            onClick={() => { setEmail("monguri_mentee_02@example.com"); setPassword("password123"); }}
=======
            onClick={() => {
              setId("mentee2");
              setPassword("password");
            }}
>>>>>>> origin/sunbal
            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold hover:bg-blue-100 transition-colors border border-blue-100"
          >
            Mentee 2
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          계정이 없으신가요?{" "}
          <span className="text-blue-500 font-bold cursor-pointer hover:underline">
            회원가입
          </span>
        </p>
      </div>
    </div>
  );
}
