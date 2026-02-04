"use client";

import {
  Button,
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Input,
} from "@/components/ui";
import { Search, Mail, MoreHorizontal, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const students = [
    {
      id: 1,
      name: "김민지",
      email: "minji@example.com",
      grade: "고2",
      attendance: "92%",
      lastActive: "10분 전",
      status: "공부 중",
      avatar: "/avatar-1.png",
      progress: 75,
    },
    {
      id: 2,
      name: "이준호",
      email: "junho@example.com",
      grade: "고3",
      attendance: "88%",
      lastActive: "2시간 전",
      status: "오프라인",
      avatar: "/avatar-2.png",
      progress: 60,
    },
    {
      id: 3,
      name: "박소은",
      email: "soeun@example.com",
      grade: "고1",
      attendance: "95%",
      lastActive: "5분 전",
      status: "공부 중",
      avatar: "/avatar-3.png",
      progress: 90,
    },
    {
      id: 4,
      name: "최우진",
      email: "woojin@example.com",
      grade: "고3",
      attendance: "80%",
      lastActive: "1일 전",
      status: "오프라인",
      avatar: "/avatar-4.png",
      progress: 45,
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.includes(searchTerm) || student.email.includes(searchTerm),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">학생 관리</h1>
          <p className="text-gray-500 text-sm mt-1">
            담당 학생들의 학습 현황을 관리하세요.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          + 학생 초대
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9 bg-white"
            placeholder="이름 또는 이메일 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <Card
            key={student.id}
            className="border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border border-gray-100">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name[0]}</AvatarFallback>
                    </Avatar>
                    {student.status === "공부 중" && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{student.name}</h3>
                    <p className="text-xs text-gray-500">{student.grade}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </Button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">출석률</span>
                  <span className="font-medium text-gray-900">
                    {student.attendance}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">이번 달 목표</span>
                    <span className="font-medium text-blue-600">
                      {student.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <Button
                  variant="outline"
                  className="flex-1 text-xs h-9 flex flex-row items-center justify-center gap-2"
                  onClick={() =>
                    (window.location.href = `mailto:${student.email}`)
                  }
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  이메일
                </Button>
                <Link
                  href={`/mentor/students/${student.id}`}
                  className="flex-1"
                >
                  <Button className="w-full text-xs h-9 bg-gray-900 hover:bg-gray-800 text-white flex flex-row items-center justify-center gap-1">
                    상세 보기 <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
