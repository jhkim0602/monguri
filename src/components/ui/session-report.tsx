"use client";

import { Card, CardContent } from "./components/card";
import { Badge } from "./components/badge";
import { Clock, BookOpen } from "lucide-react";
import { cn } from "./lib/utils";

interface SessionReportProps {
  subject: string;
  startTime: string;
  endTime: string;
  duration: string; // e.g. "1h 30m"
  status: "COMPLETED" | "REVIEWED" | "PENDING";
  className?: string;
}

export function SessionReportCard({
  subject,
  startTime,
  endTime,
  duration,
  status,
  className,
}: SessionReportProps) {
  return (
    <Card className={cn("border-gray-200 shadow-sm", className)}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{subject}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>
                {startTime} - {endTime} ({duration})
              </span>
            </div>
          </div>
        </div>
        <div>
          {status === "REVIEWED" && (
            <Badge
              variant="default"
              className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
            >
              Reviewed
            </Badge>
          )}
          {status === "COMPLETED" && (
            <Badge variant="secondary">In Review</Badge>
          )}
          {status === "PENDING" && <Badge variant="outline">Pending</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
