"use client";

import { useEffect, useState } from "react";
import { cn } from "./lib/utils";

interface DDayCountdownProps {
  targetDate: string; // YYYY-MM-DD
  label: string;
  className?: string;
}

export function DDayCountdown({
  targetDate,
  label,
  className,
}: DDayCountdownProps) {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const diff = target - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setDaysLeft(days);
  }, [targetDate]);

  return (
    <div
      className={cn(
        "flex flex-col items-center bg-gray-900 text-white p-4 rounded-xl",
        className,
      )}
    >
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="text-3xl font-bold font-mono">
        D-{daysLeft > 0 ? daysLeft : "Day"}
      </div>
    </div>
  );
}
