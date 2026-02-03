"use client";

import { use, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
} from "@/components/ui";
import { Heatmap, Timeline, TimeBlock } from "@/components/ui";
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  ChevronLeft,
  MoreVertical,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/components/ui";

// Mock student data
const MOCK_STUDENT = {
  id: "1",
  name: "Kim Min-ji",
  grade: "High 2",
  avatar: "/avatar-1.png",
  email: "minji@test.com",
  phone: "010-1234-5678",
  goal: "Medicine (Yonsei Univ)",
  stats: {
    studyHours: 42,
    attendance: "95%",
    tasksCompleted: 128,
  },
};

const MOCK_TIMELINE_BLOCKS: TimeBlock[] = [
  {
    id: "1",
    startTime: "09:00",
    endTime: "12:00",
    subject: "Math",
    color: "bg-blue-500",
    isValidated: true,
  },
  {
    id: "2",
    startTime: "13:00",
    endTime: "14:30",
    subject: "English",
    color: "bg-orange-500",
  },
  {
    id: "3",
    startTime: "15:00",
    endTime: "16:00",
    subject: "Science",
    color: "bg-purple-500",
    isValidated: true,
  },
];

export default function MenteeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params); // Keeping mostly to avoid removing too much, but ideally remove if unused.
  // Actually, unwrappedParams is unused. Let's just consume it to be safe or ignore.
  console.log(unwrappedParams);

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/mentor/students">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {MOCK_STUDENT.name}
            </h1>
            <Badge variant="outline" className="text-gray-500 border-gray-300">
              {MOCK_STUDENT.grade}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Message
          </Button>
          <Button variant="default" className="gap-2">
            <CalendarIcon className="w-4 h-4" /> Schedule Meeting
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {["Overview", "Study Logs", "Calendar", "Notes"].map((tab) => {
            const id = tab.toLowerCase().replace(" ", "-");
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                )}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="shadow-sm border-gray-100 h-fit">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={MOCK_STUDENT.avatar} />
                  <AvatarFallback>{MOCK_STUDENT.name[0]}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{MOCK_STUDENT.name}</h2>
                <p className="text-gray-500 mb-6">{MOCK_STUDENT.email}</p>

                <div className="w-full space-y-4 text-left">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Target Goal</span>
                    <span className="font-medium text-sm">
                      {MOCK_STUDENT.goal}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">Phone</span>
                    <span className="font-medium text-sm">
                      {MOCK_STUDENT.phone}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-2 text-blue-600">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Study Hours</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {MOCK_STUDENT.stats.studyHours}h
                </p>
                <p className="text-sm text-blue-600/80 mt-1">
                  +12% vs last week
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <div className="flex items-center gap-3 mb-2 text-green-600">
                  <CalendarIcon className="w-5 h-5" />
                  <span className="font-medium">Attendance</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {MOCK_STUDENT.stats.attendance}
                </p>
                <p className="text-sm text-green-600/80 mt-1">Consistent!</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                <div className="flex items-center gap-3 mb-2 text-purple-600">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-medium">Cmpl. Tasks</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {MOCK_STUDENT.stats.tasksCompleted}
                </p>
                <p className="text-sm text-purple-600/80 mt-1">
                  Ahead of schedule
                </p>
              </div>
            </div>

            {/* Heatmap */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle>Study Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <Heatmap data={[]} />
              </CardContent>
            </Card>

            {/* Timeline Preview */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle>Today&apos;s Activity log</CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline
                  blocks={MOCK_TIMELINE_BLOCKS}
                  date="2026-02-01"
                  className="h-[400px] overflow-hidden"
                />
                <div className="mt-4 text-center">
                  <Button variant="outline" className="w-full">
                    View Full Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab !== "overview" && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">
            This section is under construction.
          </p>
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl animate-bounce">
            🚧
          </div>
        </div>
      )}
    </div>
  );
}
