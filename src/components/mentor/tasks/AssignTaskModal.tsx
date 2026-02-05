"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  BookOpen,
  AlertCircle,
  FolderOpen,
  FileText,
  CheckCircle2,
} from "lucide-react";

import { useModal } from "@/contexts/ModalContext";
import { RESOURCES_MOCK } from "@/constants/resources";

export default function AssignTaskModal({
  isOpen,
  onClose,
  studentName,
}: {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
}) {
  const { openModal } = useModal();
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const handleAttachFromLibrary = () => {
    setIsLibraryOpen(true);
  };

  const handleSelectResource = (filename: string) => {
    setAttachedFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename],
    );
  };

  if (!isOpen) return null;

  // Resource Selection Overlay
  if (isLibraryOpen) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsLibraryOpen(false)}
        />
        <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FolderOpen size={20} className="text-blue-600" /> 자료 선택
            </h3>
            <button
              onClick={() => setIsLibraryOpen(false)}
              className="text-gray-400 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {RESOURCES_MOCK.map((res) => (
              <div
                key={res.id}
                onClick={() => handleSelectResource(res.name)}
                className={`flex items-center justify-between p-3 mb-2 rounded-xl border transition-all cursor-pointer ${
                  attachedFiles.includes(res.name)
                    ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200"
                    : "bg-gray-50 border-gray-100 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      attachedFiles.includes(res.name)
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {attachedFiles.includes(res.name) && (
                      <CheckCircle2 size={12} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {res.name}
                    </p>
                    <span className="text-[10px] text-gray-500 uppercase bg-white px-1 rounded border border-gray-100">
                      {res.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end">
            <button
              onClick={() => setIsLibraryOpen(false)}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg"
            >
              선택 완료 ({attachedFiles.length})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">
            새 과제 부여 ({studentName})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              과목
            </label>
            <div className="flex gap-2">
              {["국어", "수학", "영어", "탐구"].map((subject) => (
                <button
                  key={subject}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 focus:bg-gray-900 focus:text-white focus:border-gray-900 transition-colors"
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              과제 제목
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium"
              placeholder="예: 수능특강 3강 문제풀이"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              상세 내용
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium min-h-[100px] resize-none"
              placeholder="학생에게 전달할 구체적인 지시사항을 입력하세요."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              학습 자료 (Resource Library)
            </label>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAttachFromLibrary}
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600 transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <FolderOpen size={16} />
                </div>
                <span className="text-sm font-bold">
                  자료실에서 파일 가져오기
                </span>
              </button>

              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {file}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setAttachedFiles((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                마감일
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-bold text-gray-700"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                난이도 설정
              </label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-bold text-gray-700 bg-white">
                <option>상 (High)</option>
                <option>중 (Medium)</option>
                <option>하 (Low)</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              과제를 부여하면 학생의 플래너에 즉시 반영되며, 알림이 전송됩니다.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900"
          >
            취소
          </button>
          <button
            onClick={() => {
              onClose();
              openModal({
                title: "과제 부여 완료",
                content: `✅ ${studentName} 학생에게 새 과제가 전송되었습니다.`,
                type: "success",
              });
            }}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            과제 전송하기
          </button>
        </div>
      </div>
    </div>
  );
}
