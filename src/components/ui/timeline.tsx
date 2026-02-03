"use client";

import * as React from "react";
import { cn } from "./lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./components/tooltip";

export interface TimeBlock {
  id: string;
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  subject: string;
  color: string; // Tailwind classes e.g. "bg-blue-500"
  isValidated?: boolean; // If mentor approved
}

interface TimelineProps {
  blocks: TimeBlock[];
  date: string;
  onBlockClick?: (block: TimeBlock) => void;
  className?: string;
}

export function Timeline({
  blocks,
  date,
  onBlockClick,
  className,
}: TimelineProps) {
  // Hours from 6:00 to 24:00 (or 2:00 next day). For MVP: 08:00 - 02:00 (18 hours)
  const hours = Array.from({ length: 18 }, (_, i) => i + 8);

  // Function to convert time string to pixels/offset
  // Each hour = 60px height. Each 10 min = 10px.
  const timeToOffset = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    if (h < 8) return (h + 24 - 8) * 60 + m; // Past midnight handling
    return (h - 8) * 60 + m;
  };

  const getBlockStyle = (block: TimeBlock) => {
    const start = timeToOffset(block.startTime);
    const end = timeToOffset(block.endTime);
    const height = Math.max(end - start, 10); // Minimum 10px

    return {
      top: `${start}px`,
      height: `${height}px`,
    };
  };

  return (
    <div
      className={cn(
        "relative flex bg-white border border-gray-100 rounded-xl overflow-hidden",
        className,
      )}
    >
      {/* Time Labels */}
      <div className="w-14 border-r border-gray-100 bg-gray-50/50 flex flex-col items-center">
        {hours.map((hour) => (
          <div
            key={hour}
            className="h-[60px] text-xs text-gray-400 font-medium pt-1 relative w-full text-center border-b border-gray-100/50 last:border-b-0"
          >
            {hour % 24}:00
          </div>
        ))}
      </div>

      {/* Grid Lines & Blocks */}
      <div className="flex-1 relative min-h-[1080px]">
        {" "}
        {/* 18 hours * 60px */}
        {/* Background Grid (10-min lines) */}
        {hours.map((hour) => (
          <div
            key={`grid-${hour}`}
            className="h-[60px] w-full border-b border-gray-100 last:border-b-0 box-border relative"
          >
            {/* 30 min line */}
            <div className="absolute top-1/2 w-full border-b border-dashed border-gray-50"></div>
          </div>
        ))}
        {/* Render Blocks */}
        {blocks.map((block) => (
          <TooltipProvider key={block.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "absolute left-1 right-1 rounded-md border border-white/20 shadow-sm cursor-pointer hover:brightness-95 transition-all z-10",
                    block.color,
                  )}
                  style={getBlockStyle(block)}
                  onClick={() => onBlockClick?.(block)}
                >
                  <div className="p-1 text-[10px] sm:text-xs font-bold text-white truncate leading-tight">
                    {block.subject}
                  </div>
                  {block.isValidated && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-bold">{block.subject}</p>
                <p className="text-xs">
                  {block.startTime} - {block.endTime}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        {/* Current Time Indicator (Static for Mock) */}
        <div
          className="absolute w-full border-t-2 border-red-500 z-20"
          style={{ top: "450px" }}
        >
          {" "}
          {/* 15:30 */}
          <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
