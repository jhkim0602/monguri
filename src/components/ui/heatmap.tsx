"use client";

import { cn } from "./lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/tooltip";

interface HeatmapDate {
  date: string; // YYYY-MM-DD
  count: number; // Study hours or sessions
}

interface HeatmapProps {
  data: HeatmapDate[];
  year?: number;
}

export function Heatmap({
  data,
  year = new Date().getFullYear(),
}: HeatmapProps) {
  // Generate days for the year (simplified for demo: just last 3 months or so)
  // For a real generic heatmap we'd iterate all days.
  // Here we'll just mock a grid of 12 weeks.

  const intensity = (count: number) => {
    if (count === 0) return "bg-gray-100";
    if (count < 2) return "bg-blue-200";
    if (count < 4) return "bg-blue-400";
    if (count < 6) return "bg-blue-600";
    return "bg-blue-800";
  };

  // Create a map for fast lookup
  const dataMap = new Map(data.map((d) => [d.date, d.count]));

  const weeks = 12;
  const daysPerWeek = 7;
  const totalDays = weeks * daysPerWeek;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 overflow-x-auto pb-2">
        {Array.from({ length: weeks }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {Array.from({ length: daysPerWeek }).map((_, dayIndex) => {
              // Calculate day offset from the end (bottom-right is today)
              // This is a naive implementation:
              // Week 15 (last), Day 6 (last) -> Today (offset 0)
              // Week 0, Day 0 -> 111 days ago

              const reversedIndex =
                (weeks - 1 - weekIndex) * daysPerWeek +
                (daysPerWeek - 1 - dayIndex);
              const date = new Date();
              date.setDate(date.getDate() - reversedIndex);
              const dateStr = date.toISOString().split("T")[0];
              const count = dataMap.get(dateStr) || 0;

              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "w-3 h-3 rounded-sm transition-colors",
                    intensity(count),
                  )}
                  title={`${count} hours on ${dateStr}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm" />
          <div className="w-3 h-3 bg-blue-200 rounded-sm" />
          <div className="w-3 h-3 bg-blue-400 rounded-sm" />
          <div className="w-3 h-3 bg-blue-600 rounded-sm" />
          <div className="w-3 h-3 bg-blue-800 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
