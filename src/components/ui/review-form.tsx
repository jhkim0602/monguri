"use client";

import { useState } from "react";
import { Button } from "./components/button";
import { Textarea } from "./components/textarea"; // Assuming we make this or use input
import { Star } from "lucide-react";

interface ReviewFormProps {
  onSubmit: (feedback: string, rating: number) => void;
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feedback, rating);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`p-1 transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            >
              <Star className="w-6 h-6 fill-current" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">
          Feedback
        </label>
        <textarea
          className="w-full min-h-[100px] rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write your constructive feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={!feedback || rating === 0}>
        Submit Review
      </Button>
    </form>
  );
}
