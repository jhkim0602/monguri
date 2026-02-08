"use client";

import Link from "next/link";
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  User,
} from "lucide-react";
import { MentorMentee } from "@/types/mentor";

export default function StudentsClient({
  mentees,
}: {
  mentees: MentorMentee[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">학생 관리</h1>
          <p className="text-gray-500 text-sm mt-1">
            담당 학생들의 학습 현황을 한눈에 확인하세요.
          </p>
        </div>
        <button className="px-4 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
          + 학생 추가
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="이름, 학교, 태그 검색..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
          <Filter size={16} />
          필터
        </button>
      </div>

      {/* Student Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                학생 정보
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                진행률
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                최근 학습
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mentees.map((student) => (
              <tr
                key={student.id}
                className="group hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                      <img
                        src={
                          student.avatarUrl ||
                          `https://api.dicebear.com/7.x/notionists/svg?seed=${student.name}`
                        }
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">
                          {student.name}
                        </h3>
                        <span className="px-1.5 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded">
                          {student.grade}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {/* {student.school} • D-{student.dDay} */}
                        {student.goal}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-full max-w-[140px]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-700">
                        {student.stats.attendanceRate}
                      </span>
                      {parseInt(student.stats.attendanceRate) > 0 && (
                        <TrendingUp size={14} className="text-emerald-500" />
                      )}
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${parseInt(student.stats.attendanceRate) > 0 ? "bg-emerald-500" : "bg-gray-300"}`}
                        style={{ width: student.stats.attendanceRate }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {(student as any).recentTask?.title || "-"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {(() => {
                        const t = (student as any).recentTask;
                        if (!t) return "최근 학습 기록 없음";
                        const d = new Date(t.date);
                        return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
                      })()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600`}
                  >
                    활동 중
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/students/${student.id}`}
                    className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
