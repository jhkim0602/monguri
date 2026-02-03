"use client";

import { useRef, useEffect } from "react";
import { cn } from "./lib/utils";
import { User, MicOff } from "lucide-react";

interface VideoPlayerProps {
  name: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isLocal?: boolean; // New prop to distinguish local camera vs remote stream
  className?: string;
}

export function VideoPlayer({
  name,
  isMuted,
  isVideoOff,
  isLocal = false,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Only local user controls their own camera
    if (!isLocal || isVideoOff) return;

    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Failed to access camera:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideoOff, isLocal]);

  return (
    <div
      className={cn(
        "relative bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center group isolate",
        className,
      )}
    >
      {isVideoOff ? (
        <div className="flex flex-col items-center text-gray-400">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-2">
            <User className="w-10 h-10" />
          </div>
          <span className="text-sm font-medium">{name} (Camera Off)</span>
        </div>
      ) : isLocal ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          {/* Mock Network Indicator */}
          <div className="absolute top-3 right-3 flex gap-1">
            <div className="w-1 h-3 bg-green-500 rounded-full" />
            <div className="w-1 h-3 bg-green-500 rounded-full" />
            <div className="w-1 h-3 bg-green-500 rounded-full" />
          </div>
        </>
      ) : (
        // Remote User Mock (Looping video or Gradient)
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 animate-pulse flex items-center justify-center">
          <span className="text-white/20 font-bold text-lg select-none">
            Connecting...
          </span>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded-md text-white text-xs font-medium backdrop-blur-sm flex items-center gap-2">
        <span>{name}</span>
        {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
      </div>

      {/* Speaking Indicator border */}
      {!isMuted && !isVideoOff && (
        <div className="absolute inset-0 border-2 border-green-500/0 transition-all duration-300 group-hover:border-green-500/50 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}
