"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "./components/card";
import { Button } from "./components/button";
import { Badge } from "./components/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "./lib/utils";

interface QuizOption {
  id: string;
  text: string;
}

interface QuizCardProps {
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export function QuizCard({
  question,
  options,
  correctOptionId,
  explanation,
}: QuizCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700"
          >
            AI Generated
          </Badge>
          <span className="text-xs text-gray-400">Math • Calculus</span>
        </div>
        <CardTitle className="text-lg font-medium leading-relaxed">
          {question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option) => {
          let className =
            "w-full justify-start text-left h-auto py-3 px-4 border-2";
          if (isSubmitted) {
            if (option.id === correctOptionId) {
              className += " border-green-500 bg-green-50 text-green-800";
            } else if (option.id === selectedId) {
              className += " border-red-500 bg-red-50 text-red-800";
            } else {
              className += " border-gray-100 opacity-50";
            }
          } else {
            className +=
              selectedId === option.id
                ? " border-blue-500 bg-blue-50 text-blue-800"
                : " border-gray-100 hover:bg-gray-50";
          }

          return (
            <Button
              key={option.id}
              variant="ghost"
              className={className}
              onClick={() => !isSubmitted && setSelectedId(option.id)}
              disabled={isSubmitted}
            >
              {isSubmitted && option.id === correctOptionId && (
                <CheckCircle2 className="w-5 h-5 mr-3 text-green-600 shrink-0" />
              )}
              {isSubmitted &&
                option.id === selectedId &&
                option.id !== correctOptionId && (
                  <XCircle className="w-5 h-5 mr-3 text-red-600 shrink-0" />
                )}
              {(!isSubmitted ||
                (option.id !== correctOptionId &&
                  option.id !== selectedId)) && (
                <div className="w-5 h-5 mr-3 opacity-0" />
              )}
              <span className="flex-1 whitespace-normal">{option.text}</span>
            </Button>
          );
        })}

        {isSubmitted && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
            <span className="font-bold block mb-1">Explanation:</span>
            {explanation}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!isSubmitted ? (
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!selectedId}
          >
            Check Answer
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Next Question
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
