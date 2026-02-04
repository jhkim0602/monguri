import React from "react";

interface MonguriStickerProps {
  /**
   * Opacity level (0.1 to 1.0)
   * Determines how "deep" the stamp looks.
   */
  opacity?: number;
  /**
   * Color of the stamp. Defaults to primary blue (#007AFF).
   */
  color?: string;
  className?: string;
  /**
   * Rotation in degrees for natural feel.
   */
  rotate?: number;
}

export default function MonguriSticker({
  opacity = 1,
  color = "#007AFF",
  className = "",
  rotate = 0,
}: MonguriStickerProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        opacity: opacity,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main Pad (발바닥) */}
        <path
          d="M50 85C65 85 75 75 75 60C75 48 65 40 50 40C35 40 25 48 25 60C25 75 35 85 50 85Z"
          fill={color}
        />
        {/* Left Toe */}
        <ellipse cx="28" cy="35" rx="12" ry="15" fill={color} />
        {/* Middle Toe */}
        <ellipse cx="50" cy="25" rx="12" ry="16" fill={color} />
        {/* Right Toe */}
        <ellipse cx="72" cy="35" rx="12" ry="15" fill={color} />
      </svg>
    </div>
  );
}
