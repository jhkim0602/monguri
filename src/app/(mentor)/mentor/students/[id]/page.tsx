"use client";

import {
  Button,
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Heatmap,
} from "@/components/ui";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Clock,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentDetailPage() {
  const params = useParams(); // In a real app, fetch data based on params.id
  const [heatmapData, setHeatmapData] = useState<
    { date: string; count: number }[]
  >([]);

  useEffect(() => {
    setHeatmapData(
      Array(60)
        .fill(0)
        .map((_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          count: Math.floor(Math.random() * 5),
        })),
    );
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/mentor/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">학생 상세 정보</h1>
          <p className="text-sm text-gray-500">
            학습 이력 및 데이터를 확인합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile */}
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm text-center">
            <CardContent className="p-6 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4 border-4 border-blue-50">
                <AvatarImage src="/avatar-2.png" />
                <AvatarFallback>ST</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-gray-900">이준호</h2>
              <p className="text-gray-500 text-sm mb-4">고3 • 문과</p>

              <div className="flex gap-2 w-full">
                <Button
                  className="flex-1 flex flex-row items-center justify-center gap-2"
                  variant="outline"
                >
                  <Mail className="w-4 h-4 shrink-0" /> 메시지
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 flex flex-row items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0" /> 상담 예약
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                학생 메모
              </h3>
              <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                <p className="font-medium mb-1 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 shrink-0" /> 주의사항
                </p>
                수학 문제 풀이 시 계산 실수가 잦음. 꼼꼼히 검산하도록 지도 필요.
              </div>
              <textarea
                className="w-full text-sm p-3 border border-gray-200 rounded-lg min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="새로운 메모 입력..."
              />
              <Button size="sm" className="w-full">
                메모 저장
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stats & Data */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-none bg-blue-50/50 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-white rounded-full text-blue-600 shadow-sm">
                  <Clock className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">이번 주 학습</p>
                  <p className="text-xl font-bold text-gray-900">14시간</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-green-50/50 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-white rounded-full text-green-600 shadow-sm">
                  <BookOpen className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">완료한 과제</p>
                  <p className="text-xl font-bold text-gray-900">8개</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none bg-purple-50/50 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-white rounded-full text-purple-600 shadow-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">취약 과목</p>
                  <p className="text-xl font-bold text-gray-900">영어</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Heatmap Section */}
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                학습 일관성 (잔디)
              </h3>
              <div className="overflow-x-auto pb-2">
                <Heatmap data={heatmapData} />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity List */}
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">최근 활동 로그</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-gray-50">
                        Upload
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          영어 단어장 인증
                        </p>
                        <p className="text-xs text-gray-500">
                          2026.02.{10 - i} 14:00
                        </p>
                      </div>
                    </div>
                    <span className="text-green-600 text-xs font-medium">
                      검토 완료
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
