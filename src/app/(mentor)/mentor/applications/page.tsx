"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  GraduationCap,
} from "lucide-react";

// Mock Data representing submissions from the Onboarding Form
const MOCK_APPLICATIONS = [
  {
    id: 1,
    name: "김민준",
    school: "상문고등학교",
    grade: "고등학교 2학년",
    track: "이과",
    phone: "010-1234-5678",
    submittedAt: "2024-02-03 10:30",
    status: "pending", // pending, accepted, rejected
    data: {
      weakSubject: "미적분",
      recentScore: "수학 3등급 / 국어 2등급",
      middleSchoolPercent: "상위 15%",
      goals: ["미적분 개념 완성", "고난도 문제풀이", "모의고사 운영 연습"],
      comment:
        "수학 선행을 많이 안 해서 걱정입니다. 개념부터 꼼꼼하게 잡아주실 분을 원해요!",
    },
  },
  {
    id: 2,
    name: "이서연",
    school: "경기여자고등학교",
    grade: "고등학교 3학년",
    track: "문과",
    phone: "010-9876-5432",
    submittedAt: "2024-02-02 18:45",
    status: "pending",
    data: {
      weakSubject: "영어",
      recentScore: "영어 3등급 / 국어 1등급",
      middleSchoolPercent: "전교 10등",
      goals: ["빈칸 추론 정복", "EBS 연계 교재 정리"],
      comment:
        "다른 과목은 괜찮은데 영어가 항상 발목을 잡아요. 단어 관리를 빡세게 해주셨으면 좋겠습니다.",
    },
  },
  {
    id: 3,
    name: "박지훈",
    school: "휘문고등학교",
    grade: "N수생",
    track: "이과",
    phone: "010-5555-4444",
    submittedAt: "2024-02-02 14:20",
    status: "rejected",
    data: {
      weakSubject: "수학 II",
      recentScore: "수학 4등급",
      middleSchoolPercent: "-",
      goals: ["수학 기초 재정립"],
      comment: "기초가 많이 부족합니다.",
    },
  },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)),
    );
    // In a real app, this would trigger an API call and possibly send an SMS to the student
    if (newStatus === "accepted") {
      alert("학생 승인 완료! 학생 목록에 추가되었습니다.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">신규 상담 신청</h1>
          <p className="text-gray-500 mt-1">
            새로 들어온 멘토링 신청서를 검토하고 승인해주세요.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            필터
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 bg-indigo-50/50">
          <div className="text-sm font-medium text-indigo-600 mb-1">
            대기 중
          </div>
          <div className="text-2xl font-bold text-indigo-900">
            {applications.filter((a) => a.status === "pending").length}건
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 bg-green-50/50">
          <div className="text-sm font-medium text-green-600 mb-1">
            이번 달 승인
          </div>
          <div className="text-2xl font-bold text-green-900">12명</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">
            평균 경쟁률
          </div>
          <div className="text-2xl font-bold text-gray-900">4.5:1</div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="이름, 학교 검색..."
              className="pl-9 bg-gray-50 border-none"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {applications.map((app) => (
            <div
              key={app.id}
              className="group transition-colors hover:bg-gray-50"
            >
              {/* Summary Row */}
              <div
                className="p-5 flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(app.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                      app.status === "pending"
                        ? "bg-indigo-100 text-indigo-600"
                        : app.status === "accepted"
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {app.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900">
                        {app.name}
                      </h3>
                      {app.status === "pending" && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold animate-pulse">
                          NEW
                        </span>
                      )}
                      {app.status === "accepted" && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-600 text-[10px] font-bold">
                          승인됨
                        </span>
                      )}
                      {app.status === "rejected" && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">
                          반려됨
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                      <span>{app.school}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>
                        {app.grade} ({app.track})
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {app.submittedAt}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-400 mb-1">희망 과목</div>
                    <div className="text-sm font-semibold text-indigo-600">
                      {app.data.weakSubject}
                    </div>
                  </div>
                  {expandedId === app.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Detail Expanded View */}
              {expandedId === app.id && (
                <div className="px-5 pb-5 pl-[5.5rem] animate-in slide-in-from-top-2 duration-200">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                          최근 성적
                        </div>
                        <div className="font-medium text-gray-900">
                          {app.data.recentScore}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                          중학교 성적/내신
                        </div>
                        <div className="font-medium text-gray-900">
                          {app.data.middleSchoolPercent}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                        학습 목표
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {app.data.goals.map((goal, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-700"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">
                        학생의 한마디
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm text-gray-600 leading-relaxed">
                        "{app.data.comment}"
                      </div>
                    </div>

                    {app.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          className="bg-gray-900 hover:bg-gray-800 text-white flex-1 h-10"
                          onClick={() => handleStatusChange(app.id, "accepted")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          수강 승인하기
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-10 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                          onClick={() => handleStatusChange(app.id, "rejected")}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          반려
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
