"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info, HelpCircle } from "lucide-react";

export type ModalType =
  | "success"
  | "error"
  | "info"
  | "confirm"
  | "input"
  | "schedule_adjust"
  | "default";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  type?: ModalType;
  onConfirm?: (inputValue?: any) => void;
  confirmText?: string;
  cancelText?: string;
  inputPlaceholder?: string;
  defaultValue?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  inputType?: "text" | "textarea";
}

export default function CommonModal({
  isOpen,
  onClose,
  title,
  content,
  type = "info",
  onConfirm,
  confirmText = "확인",
  cancelText = "취소",
  inputPlaceholder = "",
  defaultValue = "",
  inputType = "text",
  size = "sm",
}: ModalProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [dateValue, setDateValue] = useState("");
  const [reasonValue, setReasonValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-5xl",
  }[size];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setInputValue(defaultValue);
      if (type === "schedule_adjust" && defaultValue) {
        setDateValue(defaultValue.replace(" ", "T"));
      } else {
        setDateValue("");
      }
      setReasonValue("");
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultValue, type]);

  if (!isVisible) return null;

  const handleConfirm = () => {
    if (type === "input") {
      onConfirm?.(inputValue);
    } else if (type === "schedule_adjust") {
      onConfirm?.({ date: dateValue, reason: reasonValue });
    } else {
      onConfirm?.();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case "confirm":
        return <HelpCircle className="w-6 h-6 text-blue-500" />;
      case "schedule_adjust":
        return <HelpCircle className="w-6 h-6 text-purple-500" />;
      default:
        return <Info className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidthClass} ${size === "2xl" || size === "full" ? "p-0" : "p-6"} transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"} overflow-hidden`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className={`flex flex-col ${size === "2xl" || size === "full" ? "" : "items-center text-center"} ${size === "2xl" || size === "full" ? "p-8" : ""}`}>

          {/* Hide header icon/title for custom layouts if preferred, or keep them aligned left */}
          {size !== "2xl" && size !== "full" && (
             <>
              <div
                className={`mb-4 p-3 rounded-full ${
                  type === "success"
                    ? "bg-green-50"
                    : type === "error"
                      ? "bg-red-50"
                      : type === "confirm"
                        ? "bg-blue-50"
                        : type === "schedule_adjust"
                          ? "bg-purple-50"
                          : "bg-gray-50"
                }`}
              >
                {getIcon()}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
             </>
          )}

          <div className={`text-sm text-gray-500 ${size === "2xl" || size === "full" ? "w-full" : "mb-6"}`}>
            {typeof content === "string" ? <p>{content}</p> : content}
          </div>

          {type === "input" &&
            (inputType === "textarea" ? (
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full h-32 px-4 py-3 mb-6 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full px-4 py-2 mb-6 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                autoFocus
              />
            ))}

          {type === "schedule_adjust" && (
            <div className="w-full space-y-3 mb-6">
              <div className="text-left">
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  변경할 일시
                </label>
                <input
                  type="datetime-local"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all"
                />
              </div>
              <div className="text-left">
                <label className="text-xs font-bold text-gray-500 block mb-1">
                  조정 사유
                </label>
                <textarea
                  value={reasonValue}
                  onChange={(e) => setReasonValue(e.target.value)}
                  placeholder="예: 해당 시간에는 수업이 있습니다."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all resize-none h-20"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 w-full">
            {(type === "confirm" ||
              type === "input" ||
              type === "schedule_adjust") && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-bold rounded-xl transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2.5 text-white text-sm font-bold rounded-xl shadow-lg transition-all ${
                type === "error"
                  ? "bg-red-500 hover:bg-red-600 shadow-red-100"
                  : type === "schedule_adjust"
                    ? "bg-purple-600 hover:bg-purple-700 shadow-purple-100"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
