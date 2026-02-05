"use client";

import { cn } from "./lib/utils";

export interface Subject {
  id: string;
  name: string;
  colorHex: string;
  textColorHex: string;
}

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function SubjectSelector({
  subjects,
  selectedId,
  onChange,
}: SubjectSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {subjects.map((subject) => {
        const isSelected = selectedId === subject.id;
          return (
          <button
            key={subject.id}
            onClick={() => onChange(subject.id)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2",
              isSelected
                ? "border-transparent text-white scale-105 shadow-md"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300",
            )}
            style={
              isSelected
                ? {
                    backgroundColor: subject.colorHex,
                    color: subject.textColorHex,
                  }
                : undefined
            }
          >
            {subject.name}
          </button>
        );
      })}
    </div>
  );
}
