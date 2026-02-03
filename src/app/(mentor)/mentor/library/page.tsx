"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
import {
  FolderPlus,
  FileUp,
  MoreVertical,
  FileText,
  Download,
  Trash2,
  Search,
  Folder,
} from "lucide-react";

// Mock Data
const INITIAL_FILES = [
  {
    id: 1,
    name: "2024 수능 특강 (수학 I).pdf",
    type: "pdf",
    size: "12.4 MB",
    date: "2024.02.01",
    downloads: 24,
  },
  {
    id: 2,
    name: "3월 모의고사 대비 문제집",
    type: "folder",
    size: "-",
    date: "2024.01.28",
    items: 4,
  },
  {
    id: 3,
    name: "지수로그 함수 개념정리.hwp",
    type: "doc",
    size: "2.1 MB",
    date: "2024.01.25",
    downloads: 15,
  },
  {
    id: 4,
    name: "1주차 주간 테스트 정답.pdf",
    type: "pdf",
    size: "0.5 MB",
    date: "2024.01.24",
    downloads: 42,
  },
];

export default function MentorLibraryPage() {
  const [files, setFiles] = useState(INITIAL_FILES);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">자료실</h1>
          <p className="text-gray-500 mt-1">
            학생들에게 공유할 수업 자료와 문제집을 업로드하고 관리하세요.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4" />새 폴더
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
            <FileUp className="w-4 h-4" />
            자료 업로드
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="파일명 검색..."
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>
            총 <strong className="text-indigo-600">{files.length}</strong>개
            파일
          </span>
          <span className="w-px h-3 bg-gray-300 mx-2"></span>
          <button className="hover:text-gray-900">최신순</button>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-3 bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="w-6"></div> {/* Icon */}
          <div>이름</div>
          <div className="w-24">크기</div>
          <div className="w-32">업로드 날짜</div>
          <div className="w-24 text-center">다운로드</div>
          <div className="w-10"></div> {/* Actions */}
        </div>

        <div className="divide-y divide-gray-100">
          {files.map((file) => (
            <div
              key={file.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 hover:bg-gray-50 transition-colors group"
            >
              <div className="w-6 flex justify-center">
                {file.type === "folder" ? (
                  <Folder className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ) : file.type === "pdf" ? (
                  <FileText className="w-6 h-6 text-red-500" />
                ) : (
                  <FileText className="w-6 h-6 text-blue-500" />
                )}
              </div>

              <div className="min-w-0">
                <div className="font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors cursor-pointer">
                  {file.name}
                </div>
                {file.type === "folder" && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {file.items}개 항목
                  </div>
                )}
              </div>

              <div className="w-24 text-sm text-gray-500 font-mono">
                {file.size}
              </div>

              <div className="w-32 text-sm text-gray-500">{file.date}</div>

              <div className="w-24 text-center">
                {file.type !== "folder" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {file.downloads}회
                  </span>
                )}
              </div>

              <div className="w-10 flex justify-end">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
