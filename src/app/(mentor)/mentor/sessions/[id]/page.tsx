"use client";

import { useState } from "react";
import { SessionReportCard, ReviewForm } from "@/components/ui";
import { ImageViewerModal } from "@/components/ui";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { ChevronLeft, Maximize2 } from "lucide-react";
import Link from "next/link";

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?q=80&w=2900&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2842&auto=format&fit=crop",
];

export default function SessionDetailPage() {
  // Mock usage of params to silence lint
  // const { id } = use(params);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleReviewSubmit = (feedback: string, rating: number) => {
    alert(`Review submitted!\nRating: ${rating}\nFeedback: ${feedback}`);
    // Mock API call
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/mentor/mentees/1">
          {" "}
          {/* Go back to mentee detail */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Session Review</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Session Info */}
          <SessionReportCard
            subject="Mathematics - Calculus"
            startTime="09:00"
            endTime="10:30"
            duration="1h 30m"
            status="COMPLETED"
          />

          {/* Proof Images */}
          <Card>
            <CardHeader>
              <CardTitle>Proof of Study</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {MOCK_IMAGES.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer"
                    onClick={() => setIsViewerOpen(true)}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      alt="Proof"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="text-white w-6 h-6 drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Review Form */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Leave Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewForm onSubmit={handleReviewSubmit} />
            </CardContent>
          </Card>
        </div>
      </div>

      <ImageViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        images={MOCK_IMAGES}
      />
    </div>
  );
}
