"use client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  MessageSquare,
} from "lucide-react";
import { Button } from "./components/button";
import { cn } from "./lib/utils";

interface SessionControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
  className?: string;
}

export function SessionControls({
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onLeave,
  className,
}: SessionControlsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 bg-gray-900/90 backdrop-blur p-4 rounded-2xl",
        className,
      )}
    >
      <Button
        variant={isMuted ? "destructive" : "secondary"}
        size="icon"
        className="rounded-full w-12 h-12"
        onClick={onToggleMute}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>

      <Button
        variant={isVideoOff ? "destructive" : "secondary"}
        size="icon"
        className="rounded-full w-12 h-12"
        onClick={onToggleVideo}
      >
        {isVideoOff ? (
          <VideoOff className="w-5 h-5" />
        ) : (
          <Video className="w-5 h-5" />
        )}
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="rounded-full w-12 h-12"
      >
        <Monitor className="w-5 h-5" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="rounded-full w-12 h-12"
      >
        <MessageSquare className="w-5 h-5" />
      </Button>

      <div className="w-px h-8 bg-gray-700 mx-2"></div>

      <Button
        variant="destructive"
        size="icon"
        className="rounded-full w-14 h-14"
        onClick={onLeave}
      >
        <PhoneOff className="w-6 h-6" />
      </Button>
    </div>
  );
}
