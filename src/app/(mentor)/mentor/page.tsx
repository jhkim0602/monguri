"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
} from "@/components/ui";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function ClientDate() {
  const [date, setDate] = useState("");

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString("ko-KR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  if (!date) return null;
  return <>{date}</>;
}

export default function MentorDashboard() {
  // Mock Data
  const stats = [
    {
      label: "활동 중인 학생",
      value: "12",
      trend: "이번 달 +2명",
      icon: UsersIcon,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "검토한 학습 시간",
      value: "24.5",
      trend: "지난주보다 12% 증가",
      icon: Clock,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "피드백 제공",
      value: "48",
      trend: "마지막: 2시간 전",
      icon: BookOpen,
      color: "bg-green-100 text-green-600",
    },
  ];

  const students = [
    {
      id: 1,
      name: "김민지",
      grade: "고2",
      status: "공부 중",
      subject: "수학",
      lastActive: "10분 전",
      avatar: "/avatar-1.png",
    },
    {
      id: 2,
      name: "이준호",
      grade: "고3",
      status: "오프라인",
      subject: "-",
      lastActive: "2시간 전",
      avatar: "/avatar-2.png",
    },
    {
      id: 3,
      name: "박소은",
      grade: "고1",
      status: "공부 중",
      subject: "영어",
      lastActive: "5분 전",
      avatar: "/avatar-3.png",
    },
    {
      id: 4,
      name: "최우진",
      grade: "고3",
      status: "오프라인",
      subject: "-",
      lastActive: "1일 전",
      avatar: "/avatar-4.png",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 p-6"
    >
      <motion.div
        variants={item}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            안녕하세요, 김멘토 선생님! 👋
          </h1>
          <p className="text-gray-500 mt-1">오늘 학생들의 학습 현황입니다.</p>
        </div>
        <div className="text-sm text-gray-600 glass-card px-4 py-2 rounded-full font-medium">
          <ClientDate />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.label}
                </CardTitle>
                <div className={stat.color + " p-2 rounded-lg"}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-400 mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Students */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="glass-card border-0 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">담당 학생</CardTitle>
                <p className="text-sm text-gray-400 font-normal mt-1">
                  실시간 학습 상태 개요
                </p>
              </div>
              <Link
                href="/mentor/students"
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 transition-colors"
              >
                전체 보기 <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {students.map((student) => (
                  <Link
                    href={`/mentor/students/${student.id}`}
                    key={student.id}
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: "rgba(255,255,255,0.4)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100/50 bg-white/40 backdrop-blur-sm hover:border-indigo-100 transition-all cursor-pointer"
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>{student.name[0]}</AvatarFallback>
                        </Avatar>
                        {student.status === "공부 중" && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900 group-hover:text-indigo-700 truncate">
                            {student.name}
                          </h4>
                          <Badge
                            variant={
                              student.status === "공부 중"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              student.status === "공부 중"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-500"
                            }
                          >
                            {student.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {student.grade} •{" "}
                          {student.subject !== "-"
                            ? `${student.subject} 공부 중`
                            : `마지막 활동 ${student.lastActive}`}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity / Feed */}
        <motion.div variants={item}>
          <Card className="glass-card border-0 h-full">
            <CardHeader>
              <CardTitle className="text-lg">최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex gap-4 relative pl-4 border-l border-indigo-100"
                  >
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-indigo-100 border-2 border-white"></div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">김민지</span> 학생이
                        과제를 제출했습니다.
                      </p>
                      <p className="text-xs text-gray-400">2분 전</p>
                      {i === 1 && (
                        <div className="mt-2 text-xs bg-white/50 border border-gray-100 p-3 rounded-lg text-gray-600 italic">
                          &quot;4번 문제에서 막혔는데, 확인해주실 수
                          있나요?&quot;
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function UsersIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
