"use client";

import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Type,
  CheckSquare,
} from "lucide-react";

interface CommandItemProps {
  title: string;
  subtitle?: string; // Optional description
  icon: React.ReactNode;
  command: ({ editor, range }: { editor: any; range: any }) => void;
}

export interface SuggestionProps {
  items: CommandItemProps[];
  command: (item: CommandItemProps) => void;
}

export const CommandList = forwardRef((props: SuggestionProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];

    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }

      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }

      if (event.key === "Enter") {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[300px] p-1 animate-in fade-in zoom-in-95 duration-150">
      <div className="px-2 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
        기본 블록
      </div>
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`flex items-center gap-3 w-full px-2 py-2 text-left text-sm rounded-md transition-colors ${
              index === selectedIndex ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <div className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm shrink-0">
              {item.icon}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">{item.title}</span>
              {item.subtitle && (
                <span className="text-[11px] text-gray-400">{item.subtitle}</span>
              )}
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-3 text-sm text-gray-500 text-center">
          결과 없음
        </div>
      )}
    </div>
  );
});

CommandList.displayName = "CommandList";
