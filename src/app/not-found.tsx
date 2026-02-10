"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type NotFoundDestination = {
  href: string;
  label: string;
};

export default function NotFoundPage() {
  const router = useRouter();
  const [destination, setDestination] = useState<NotFoundDestination | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const resolveDestination = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        setDestination({
          href: "/landing",
          label: "랜딩페이지로 이동",
        });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      const role = profile?.role;
      if (role === "mentor" || role === "admin") {
        setDestination({
          href: "/dashboard",
          label: "대시보드로 이동",
        });
        return;
      }

      if (role === "mentee") {
        setDestination({
          href: "/home",
          label: "홈으로 이동",
        });
        return;
      }

      setDestination({
        href: "/landing",
        label: "랜딩페이지로 이동",
      });
    };

    resolveDestination();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePrimaryMove = useCallback(() => {
    if (!destination) return;
    router.push(destination.href);
  }, [destination, router]);

  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(destination?.href ?? "/landing");
  }, [destination, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-cyan-100/40 blur-3xl sm:h-96 sm:w-96" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-10 sm:px-8 sm:py-14">
        <section className="w-full rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_24px_80px_-24px_rgba(30,58,138,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="order-2 space-y-4 text-center lg:order-1 lg:space-y-5 lg:text-left">
              <p className="inline-flex items-center rounded-full border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 text-xs font-bold tracking-wider text-blue-700">
                ERROR 404
              </p>
              <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                찾으시는 페이지가
                <br />
                존재하지 않습니다
              </h1>
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base lg:mx-0">
                주소가 잘못 입력되었거나 페이지가 이동되었을 수 있어요. 아래
                버튼으로 안전한 경로로 이동해 주세요.
              </p>

              <div className="flex flex-col items-stretch justify-center gap-3 pt-2 sm:flex-row lg:justify-start">
                <button
                  type="button"
                  onClick={handlePrimaryMove}
                  disabled={!destination}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  <Home className="h-4 w-4" />
                  {destination?.label ?? "이동 경로 확인 중..."}
                </button>
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  이전으로 이동
                </button>
              </div>
            </div>

            <div className="order-1 translate-y-2 lg:order-2 lg:translate-y-0">
              <div className="relative mx-auto w-full max-w-[240px] sm:max-w-[300px] lg:max-w-[360px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200/60 to-indigo-200/40 blur-3xl" />
                <Image
                  src="/images/mascot_404.png"
                  alt="길을 잃은 설스터디 마스코트"
                  width={1481}
                  height={2001}
                  priority
                  className="relative h-auto w-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
