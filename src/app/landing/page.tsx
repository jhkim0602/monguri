"use client";

import LoginForm from "@/components/landing/LoginForm";
import Image from "next/image";
import { Play, Sparkles, Users, BookOpen, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/40 to-indigo-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-violet-100/30 to-pink-100/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-gradient-to-br from-cyan-100/20 to-blue-100/20 rounded-full blur-3xl" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 animate-pulse"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">SeolStudy</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            <a href="#about" className="hover:text-gray-900 transition-colors">소개</a>
            <a href="#video" className="hover:text-gray-900 transition-colors">사용법</a>
            <a href="#contact" className="hover:text-gray-900 transition-colors">문의</a>
          </div>
        </div>
      </nav>

      {/* Hero Section - 1열 */}
      <section className="relative z-10 px-8 py-12 md:py-20">
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
                <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-lg">
                 설명입니다. 잘부탁드립니다.

                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">멘토링</p>
                    <p className="text-sm font-bold text-gray-700">1:1 맞춤 지도</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">학습관리</p>
                    <p className="text-sm font-bold text-gray-700">체계적 플래너</p>
                  </div>
                </div>


              </div>

              {/* Team Info */}
              <div className="pt-6 border-t border-gray-100">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-800">몽구리당당팀</p>
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
      <section id="video" className="relative z-10 px-8 py-16 md:py-24">
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
              2분만에 알아보는 설스터디
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">
              처음 사용하시는 분들을 위한 상세한 가이드 영상을 준비했습니다.
              멘토와 멘티 모두를 위한 핵심 기능을 확인해보세요.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 items-center relative">
            {/* Left - Mascot & Speech Bubble (1 Part) */}
            <div className="hidden md:flex flex-col items-center relative z-20">
              {/* Speech Bubble */}
              <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-violet-100 mb-6 w-full text-center z-30 -translate-y-8">
                <p className="text-xl font-bold text-gray-800 leading-snug">
                  설스터디 웹앱<br/>어떻게 사용하나요?
                </p>
                {/* Tail */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-violet-100 rotate-45" />
              </div>

              {/* Mascot - Sitting on Footer */}
              <div className="absolute -bottom-31 -left-13 w-[500px] h-[500px] lg:w-[700px] lg:h-[700px] z-20 pointer-events-none">
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
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="SeolStudy 사용설명서"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Video Footer */}
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-700">SeolStudy 완벽 가이드</p>
                          <p className="text-xs text-gray-400">멘토 & 멘티 필수 시청</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                          튜토리얼
                        </span>
                        <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-bold">
                          초보자용
                        </span>
                      </div>
                    </div>
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
