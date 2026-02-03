import Link from "next/link";
import { Users, Calendar, TrendingUp } from "lucide-react";

export default function MentorDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">안녕하세요, 멘토님! 👋</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Users size={20} /></div>
                <h3 className="font-bold text-gray-700">관리 학생</h3>
            </div>
            <p className="text-3xl font-black text-gray-900">12<span className="text-sm text-gray-400 font-normal ml-1">명</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><TrendingUp size={20} /></div>
                <h3 className="font-bold text-gray-700">평균 달성률</h3>
            </div>
            <p className="text-3xl font-black text-gray-900">85<span className="text-sm text-gray-400 font-normal ml-1">%</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Calendar size={20} /></div>
                <h3 className="font-bold text-gray-700">오늘의 수업</h3>
            </div>
            <p className="text-3xl font-black text-gray-900">3<span className="text-sm text-gray-400 font-normal ml-1">건</span></p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <p className="text-gray-500 mb-4">아직 준비중인 기능입니다.</p>
          <Link href="/home" className="text-blue-500 hover:underline text-sm font-bold">멘티 앱으로 이동하기</Link>
      </div>
    </div>
  );
}
