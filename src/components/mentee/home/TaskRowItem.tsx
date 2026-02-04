"use client";

import { CheckCircle2, ChevronRight, Clock } from "lucide-react";

type TaskStatus = "pending" | "submitted" | "feedback_completed";

interface TaskRowItemProps {
  id: string | number;
  title: string;
  subject: string; // "국어", "수학" etc.
  categoryId: string; // "korean", "math", "english"
  status: TaskStatus | string;
  deadline?: Date;
  isMentorTask: boolean;
  onClick: () => void;
  className?: string;
}

const getSubjectTheme = (categoryId: string) => {
  switch (categoryId) {
    case 'korean':
      return {
        bg: 'bg-orange-50',
        bar: 'bg-orange-400',
        text: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-700'
      };
    case 'math':
      return {
        bg: 'bg-indigo-50',
        bar: 'bg-indigo-500',
        text: 'text-indigo-600',
        badge: 'bg-indigo-100 text-indigo-700'
      };
    case 'english':
      return {
        bg: 'bg-lime-50',
        bar: 'bg-lime-500',
        text: 'text-lime-700',
        badge: 'bg-lime-100 text-lime-800'
      };
    default:
      return {
        bg: 'bg-gray-50',
        bar: 'bg-gray-400',
        text: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-700'
      };
  }
};

export default function TaskRowItem({
  title,
  subject,
  categoryId,
  status,
  isMentorTask,
  onClick,
  className = ""
}: TaskRowItemProps) {
  const theme = getSubjectTheme(categoryId);
  const isCompleted = status === 'submitted' || status === 'feedback_completed';
  const hasFeedback = status === 'feedback_completed';

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center p-3 rounded-xl transition-all cursor-pointer hover:shadow-md border border-transparent hover:border-blue-100 bg-white ${className} ${isCompleted ? 'opacity-70 grayscale-[0.3]' : 'opacity-100'}`}
    >
      {/* Left: Subject Indicator */}
      <div className="flex-shrink-0 mr-4 flex flex-col items-center justify-center w-10">
        <div className={`w-1 h-8 rounded-full mb-1 ${theme.bar}`} />
        <span className={`text-[10px] font-extrabold ${theme.text}`}>{subject}</span>
      </div>

      {/* Center: Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5 mb-0.5">
          {isMentorTask && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-900 text-white">
              Guide
            </span>
          )}
          {hasFeedback && (
             <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-600 animate-pulse">
             Feedback
           </span>
          )}
        </div>
        <h4 className={`text-sm font-bold truncate ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
          {title}
        </h4>
      </div>

      {/* Right: Status / Action */}
      <div className="flex-shrink-0">
        {isCompleted ? (
          <div className={`rounded-full p-1 ${hasFeedback ? 'bg-purple-100' : 'bg-gray-100'}`}>
            <CheckCircle2
              size={20}
              className={hasFeedback ? 'text-purple-600 fill-purple-100' : 'text-gray-400 fill-gray-50'}
            />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 group-hover:border-blue-400 group-hover:bg-blue-50 transition-colors" />
        )}
      </div>
    </div>
  );
}
