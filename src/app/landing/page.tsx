"use client";

import LoginForm from "@/components/landing/LoginForm";
import Image from "next/image";
import { Play, Sparkles, Users, BookOpen, Target } from "lucide-react";

export default function LandingPage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - 16;
    window.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/40 to-indigo-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-violet-100/30 to-pink-100/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-gradient-to-br from-cyan-100/20 to-blue-100/20 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/seoul_logo.svg"
              alt="SeolStudy 로고"
              className="h-8 w-8 object-contain"
            />
            <span className="text-xl font-black text-[#1E3A8A] tracking-tight">
              SeolStudy
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            <button
              type="button"
              onClick={scrollToTop}
              className="hover:text-gray-900 transition-colors"
            >
              소개
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("video")}
              className="hover:text-gray-900 transition-colors"
            >
              사용법
            </button>
            <a
              href="https://forms.gle/FchKdDcm23JdGHpK9"
              className="hover:text-gray-900 transition-colors"
            >
              상담
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section - 1열 */}
      <section
        id="about"
        className="relative z-10 px-8 py-12 md:py-20 scroll-mt-24"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Team & Product Intro */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  제4회 2026 블레이버스 MVP 개발 해커톤
                </span>
              </div>

              {/* Mascot Image */}
              <div className="absolute top-1/2 left-[45%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[600px] md:h-[600px] opacity-80 pointer-events-none -z-10">
                <Image
                  src="/images/mascot.png"
                  alt="SeolStudy Mascot"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Main Title */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight">
                  몽구리당당팀의
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    설스터디 프로젝트
                  </span>
                </h1>
                <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-md">
                  학습 계획·피드백·상담을 한 곳에서 관리하세요.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      멘토링
                    </p>
                    <p className="text-sm font-bold text-gray-700">
                      1:1 맞춤 지도
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">
                      학습관리
                    </p>
                    <p className="text-sm font-bold text-gray-700">
                      체계적 플래너
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Info */}
              <div className="pt-6">
                <div className="mb-4 h-px w-44 bg-gray-200 sm:w-52" />
                <div className="max-w-xs space-y-1">
                  <p className="text-sm font-bold text-gray-800">
                    몽구리당당팀
                  </p>
                  <p className="text-xs text-gray-500 leading-snug">
                    김정환, 이선우, 서준혁, 이연지, 조한결
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Login Form */}
            <div className="flex justify-center md:justify-end">
              <LoginForm />
            </div>
          </div>
        </div>
      </section>

      {/* Video Section - 2열 */}
      <section
        id="video"
        className="relative z-10 overflow-y-hidden px-8 py-16 md:py-24 scroll-mt-24"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-100 mb-6">
              <Play className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">
                사용설명서
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">
              영상으로 알아보는 설스터디
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">
              시작부터 과제 관리, 피드백, 상담 신청까지 핵심 흐름을 한 번에
              확인해보세요.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 items-center relative">
            {/* Left - Mascot & Speech Bubble (1 Part) */}
            <div className="hidden md:flex flex-col items-center relative z-20">
              {/* Speech Bubble */}
              <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-violet-100 mb-6 w-full text-center z-30 -translate-y-8">
                <p className="text-xl font-bold text-gray-800 leading-snug">
                  설스터디 웹앱
                  <br />
                  어떻게 사용하나요?
                </p>
                {/* Tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-violet-100 rotate-45" />
              </div>

              {/* Mascot - Sitting on Footer */}
              <div className="absolute -bottom-[37rem] -left-[13rem] w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] z-20 pointer-events-none">
                <Image
                  src="/images/mascot2.png"
                  alt="Question Mascot"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Right - Video Container (3 Parts) */}
            <div className="md:col-span-3 relative z-10">
              <div className="relative group">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 via-indigo-200 to-violet-200 rounded-3xl opacity-30 blur-2xl group-hover:opacity-40 transition-opacity duration-500" />

                {/* Video Frame */}
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100">
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/7lLqQXCpOMo?rel=0"
                      title="SeolStudy 사용설명서"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
