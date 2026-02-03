"use client";

import { useState } from "react";
import { cn } from "./lib/utils";

interface AvailabilityCalendarProps {
  value: Record<string, string[]>; // { "Monday": ["09:00", ...], ... }
  onChange: (value: Record<string, string[]>) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 9); // 9 AM - 10 PM

export function AvailabilityCalendar({
  value,
  onChange,
}: AvailabilityCalendarProps) {
  const toggleSlot = (day: string, hour: number) => {
    const timeStr = `${hour}:00`;
    const daySlots = value[day] || [];
    const newDaySlots = daySlots.includes(timeStr)
      ? daySlots.filter((t) => t !== timeStr)
      : [...daySlots, timeStr];

    onChange({ ...value, [day]: newDaySlots });
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
        <div className="p-3 text-center border-r border-gray-200">Time</div>
        {DAYS.map((day) => (
          <div
            key={day}
            className="p-3 text-center border-r border-gray-200 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>
      <div>
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-8 border-b border-gray-200 last:border-b-0 h-12"
          >
            <div className="flex items-center justify-center text-xs text-gray-400 bg-white border-r border-gray-200">
              {hour}:00
            </div>
            {DAYS.map((day) => {
              const isSelected = value[day]?.includes(`${hour}:00`);
              return (
                <div
                  key={`${day}-${hour}`}
                  onClick={() => toggleSlot(day, hour)}
                  className={cn(
                    "border-r border-gray-200 last:border-r-0 cursor-pointer transition-colors relative hover:bg-blue-50",
                    isSelected ? "bg-blue-500 hover:bg-blue-600" : "bg-white",
                  )}
                >
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
                      OPEN
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
