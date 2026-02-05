"use client";

import { useState } from "react";
import {
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Video,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Download,
} from "lucide-react";
import { RESOURCES_MOCK } from "@/constants/resources";

export default function MaterialsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResources = RESOURCES_MOCK.filter((res) => {
    const matchesTab = activeTab === "all" || res.category === activeTab;
    const matchesSearch = res.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText size={20} className="text-red-500" />;
      case "image":
        return <ImageIcon size={20} className="text-blue-500" />;
      case "video":
        return <Video size={20} className="text-purple-500" />;
      default:
        return <FileText size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">자료실</h1>
          <p className="text-gray-500 text-sm mt-1">
            수업 자료와 과제 파일을 관리하세요.
          </p>
        </div>
        <button className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
          <Plus size={18} />
          자료 업로드
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
          {["all", "korean", "math", "english", "common"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab === "all"
                ? "전체"
                : tab === "korean"
                  ? "국어"
                  : tab === "math"
                    ? "수학"
                    : tab === "english"
                      ? "영어"
                      : "공통"}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="파일명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
      </div>

      {/* File List */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {filteredResources.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  파일명
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  크기
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  등록일
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredResources.map((file) => (
                <tr
                  key={file.id}
                  className="group hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          {file.name}
                        </h4>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase">
                          {file.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {file.size}
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {file.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <FolderOpen size={32} />
            </div>
            <p className="text-gray-500 font-bold">검색 결과가 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">
              다른 검색어나 필터를 사용해보세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
