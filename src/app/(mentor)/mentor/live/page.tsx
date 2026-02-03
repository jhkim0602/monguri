"use client";

import { Button, Card, CardContent, Badge } from "@/components/ui";
import { Video, Calendar, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LivePage() {
  const sessions = [
    {
      id: 1,
      title: "기말고사 대비 수학 특강",
      time: "오늘, 19:00",
      attendees: 5,
      status: "예정됨",
      tags: ["수학", "고3"],
    },
    {
      id: 2,
      title: "영어 빈칸추론 집중 공략",
      time: "내일, 20:00",
      attendees: 3,
      status: "예정됨",
      tags: ["영어", "고2"],
    },
    {
      id: 3,
      title: "주간 학습 피드백 세션",
      time: "2026.02.05, 18:00",
      attendees: 1,
      status: "예정됨",
      tags: ["상담"],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">라이브 강의</h1>
          <p className="text-gray-500 text-sm mt-1">
            실시간 수업 세션을 개설하고 관리합니다.
          </p>
        </div>
        <Button className="bg-red-500 hover:bg-red-600 text-white flex flex-row items-center gap-2">
          <Video className="w-4 h-4 shrink-0" />
          즉시 회의 시작
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Card */}
        <Card className="border-gray-100 shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 text-white col-span-1 lg:col-span-2">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <Badge className="bg-white/20 text-white border-none mb-3 hover:bg-white/30">
                NEXT CLASS
              </Badge>
              <h2 className="text-3xl font-bold mb-2">
                기말고사 대비 수학 특강
              </h2>
              <p className="text-indigo-100 flex items-center gap-2 mb-6">
                <Calendar className="w-4 h-4" /> 오늘 오후 7:00 (3시간 후 시작)
              </p>
              <Link href="/mentor/live/1">
                <Button className="bg-white text-indigo-700 hover:bg-indigo-50 border-none font-bold px-6 py-5 rounded-full text-base shadow-lg cursor-pointer flex flex-row items-center gap-2">
                  강의실 입장하기 <ArrowRight className="w-5 h-5 shrink-0" />
                </Button>
              </Link>
            </div>
            <div className="hidden md:block opacity-50">
              <Video className="w-48 h-48" />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-gray-900 text-lg">예정된 세션</h3>
          {sessions.slice(1).map((session) => (
            <Card
              key={session.id}
              className="border-gray-100 shadow-sm hover:border-blue-200 transition-all"
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{session.title}</h4>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {session.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="flex items-center gap-1 text-xs text-gray-500 justify-end">
                      <Users className="w-3 h-3" /> {session.attendees}명 참여
                    </span>
                    <div className="flex gap-1 mt-1 justify-end">
                      {session.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link href={`/mentor/live/${session.id}`}>
                    <Button variant="outline" size="sm">
                      입장
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
