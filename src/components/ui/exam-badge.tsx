"use client";

import { Badge } from "./components/badge";
import { cn } from "./lib/utils";

interface ExamBadgeProps {
  type: "CSAT" | "MOCK_KEY" | "MOCK" | "HOLIDAY";
  className?: string;
  children: React.ReactNode;
}

export function ExamBadge({ type, children, className }: ExamBadgeProps) {
  const styles = {
    CSAT: "bg-red-600 hover:bg-red-700 text-white border-transparent",
    MOCK_KEY: "bg-orange-500 hover:bg-orange-600 text-white border-transparent",
    MOCK: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
    HOLIDAY: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
  };

  return (
    <Badge variant="outline" className={cn(styles[type], className)}>
      {children}
    </Badge>
  );
}
