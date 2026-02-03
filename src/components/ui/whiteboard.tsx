"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
// import * as Y from "yjs";
// import { WebrtcProvider } from "y-webrtc";
// import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
// import { AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types";

// Dynamically import Excalidraw with ssr: false
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-xl border border-gray-200">
        <p className="text-gray-500 font-medium animate-pulse">
          화이트보드 로딩 중...
        </p>
      </div>
    ),
  },
);

interface WhiteboardProps {
  roomId?: string;
  username?: string;
}

export function Whiteboard({
  roomId = "demo-room",
  username = "User",
}: WhiteboardProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);

  return (
    <div
      className="w-full h-full bg-white rounded-xl border border-gray-200 flex flex-col relative overflow-hidden excalidraw-wrapper isolate"
      onDragOver={(e) => e.preventDefault()}
    >
      <style>{`
        .excalidraw-wrapper .excalidraw svg {
          height: unset;
          width: unset;
          max-width: unset;
          max-height: unset;
          display: initial;
        }
        .excalidraw-wrapper .excalidraw canvas {
          height: unset;
          width: unset;
          max-width: unset;
          max-height: unset;
        }
      `}</style>

      {/* Connection Status Indicator */}
      <div className="absolute top-2 right-14 z-10 px-3 py-1 bg-white/90 rounded-full border border-gray-200 shadow-sm text-xs font-medium flex items-center gap-2 pointer-events-none">
        <div
          className={`w-2 h-2 rounded-full ${isCollaborating ? "bg-green-500 animate-pulse" : "bg-red-400"}`}
        />
        {isCollaborating ? "Live Sync" : "Single User Mode"}
      </div>

      <Excalidraw
        langCode="ko-KR"
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: true,
            loadScene: true,
            toggleTheme: true,
            export: false,
            saveToActiveFile: false,
            saveAsImage: false,
          },
        }}
      />
    </div>
  );
}
