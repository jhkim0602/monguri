"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import { Camera, User, BookOpen, Save, Hash } from "lucide-react";

export default function MentorSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-500 mt-1">
          계정 정보와 학생들에게 보여질 프로필을 관리하세요.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          공개 프로필 (학생 노출용)
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "account"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          계정 및 보안
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        {activeTab === "profile" ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header / Preview Section */}
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-lg overflow-hidden">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">
                      이름 (실명)
                    </label>
                    <Input
                      defaultValue="박서울"
                      className="bg-gray-50"
                      readOnly
                    />
                    <p className="text-xs text-gray-400">
                      실명은 변경할 수 없습니다.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700">
                      소속 대학 / 학과
                    </label>
                    <Input defaultValue="서울대학교 수학교육과" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700">
                    한줄 소개 (Catchphrase)
                  </label>
                  <Input defaultValue="수포자도 1등급으로 만드는 기적의 개념 설명! 기초부터 탄탄하게 잡아드립니다." />
                  <p className="text-xs text-blue-600 font-medium">
                    ✨ 학생들에게 가장 먼저 보여지는 문구입니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100"></div>

            {/* Teaching Style & Tags */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-indigo-500" /> 수업 스타일 태그
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "개념원리",
                    "친절한 설명",
                    "동기부여",
                    "체계적인",
                    "스파르타",
                    "킬러문제",
                  ].map((tag, i) => (
                    <button
                      key={tag}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        i < 3
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                  <button className="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-500">
                    + 직접 추가
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-500" /> 상세 소개글
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  자신만의 수업 방식, 커리큘럼, 성공 사례 등을 자세히
                  적어주세요.
                </p>
                <textarea
                  className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed text-gray-700 resize-none"
                  defaultValue={`안녕하세요! 서울대학교 수학교육과 박서울입니다.

저는 "수학은 암기가 아니라 이해"라는 철학을 가지고 있습니다. 
공식이 왜 그렇게 유도되었는지부터 시작해, 어떤 변형 문제가 나와도 흔들리지 않는 기초 체력을 길러드립니다.

✅ 수업 특징
1. 매 수업 시작 전 지난 시간 복습 퀴즈
2. 이해가 될 때까지 무한 질의응답 (새벽에도 OK!)
3. 학생 맞춤형 오답노트 직접 제작

믿고 따라오시면 반드시 성적 향상으로 보답하겠습니다.`}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 h-12 text-base rounded-xl">
                <Save className="w-4 h-4 mr-2" />
                프로필 저장하기
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 animate-in fade-in duration-300">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">
              계정 설정 기능은 준비 중입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
