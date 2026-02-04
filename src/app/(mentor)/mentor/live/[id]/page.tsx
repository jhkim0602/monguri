"use client";

import {
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Whiteboard,
  Chat,
} from "@/components/ui";
import {
  Mic,
  Video,
  Monitor,
  PhoneOff,
  Hand,
  MessageSquare,
  Users,
  Settings,
  MoreVertical,
  ChevronLeft,
  Share2,
  Layout,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LiveRoomPage() {
  const params = useParams();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(false);
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="fixed inset-0 z-[100] bg-[#F9FAFB] text-slate-900 overflow-hidden flex flex-col font-sans">
      {/* 
        =============================================
        TOP BAR (Floating Glass - Light)
        =============================================
      */}
      <div className="absolute top-0 left-0 right-0 h-20 z-50 pointer-events-none flex items-start justify-between p-6">
        {/* Left: Session Info */}
        <div className="pointer-events-auto flex items-center gap-4 animate-slide-down">
          <Link href="/mentor/live">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-none text-slate-900 tracking-tight">
              기말고사 대비 수학 특강
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-red-50 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold border border-red-100 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                ON AIR
              </span>
              <span className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                00:12:45
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="pointer-events-auto flex items-center gap-3 animate-slide-down delay-75">
          <div className="flex -space-x-2 mr-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm"
              >
                S{i}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 shadow-sm">
              +2
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm rounded-full h-9 px-4"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="w-4 h-4 mr-2 text-slate-500" />
            {showChat ? "채팅 숨기기" : "채팅 보기"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="rounded-full h-9 px-4 shadow-sm bg-red-500 hover:bg-red-600 border-none"
          >
            수업 종료
          </Button>
        </div>
      </div>

      {/* 
        =============================================
        MAIN STAGE
        =============================================
      */}
      <div className="flex-1 flex overflow-hidden pt-24 pb-6 px-6 gap-6 relative z-10">
        {/* Center Canvas */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Whiteboard Container */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
            <Whiteboard
              roomId={params.id}
              username="Mentor"
              className="rounded-none border-none bg-transparent"
            />

            {/* Floating Tools inside Canvas */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button className="w-8 h-8 bg-white shadow-md rounded-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-50">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 bg-white shadow-md rounded-lg border border-slate-100 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-50">
                <Layout className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Student Video Strip (Bottom of Canvas) */}
          <div className="h-28 flex gap-3 overflow-x-auto pb-1 shrink-0 scrollbar-hide">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="min-w-[160px] bg-white rounded-xl border border-slate-200 overflow-hidden relative group hover:border-blue-400 transition-all cursor-pointer shadow-sm"
              >
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                  <Avatar className="w-10 h-10 border border-white shadow-sm">
                    <AvatarFallback className="bg-slate-200 text-slate-600">
                      S{i}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute bottom-2 left-2 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 bg-white/80 backdrop-blur rounded shadow-sm border border-slate-100">
                  학생 {i}
                </div>
                <div className="absolute top-2 right-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center border border-green-200">
                    <Mic className="w-3 h-3 text-green-600" />
                  </div>
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-1.5 bg-white rounded-full hover:bg-slate-50 shadow-sm text-slate-700">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 bg-white rounded-full hover:bg-slate-50 shadow-sm text-slate-700">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {/* Drag & Drop Zone Placeholder */}
            <div className="min-w-[100px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 transition-colors cursor-pointer bg-slate-50/50">
              <span className="text-xl">+</span>
              <span className="text-[10px] font-medium">초대</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Collapsible) */}
        <div
          className={`w-80 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col transition-all duration-500 ${showChat ? "mr-0 opacity-100 translate-x-0" : "-mr-[22rem] opacity-0 translate-x-10"}`}
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <span className="text-sm font-bold text-slate-800">채팅</span>
            <button className="p-1 hover:bg-slate-100 rounded">
              <Settings className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
            </button>
          </div>
          <Chat
            roomId={params.id as string}
            username="강사님 (Mentor)"
            className="flex-1 bg-transparent border-none"
          />
        </div>
      </div>

      {/* 
        =============================================
        BOTTOM CONTROL ISLAND (Floating - Light)
        =============================================
      */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-xl px-6 py-3 rounded-full border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center gap-6 animate-slide-up">
          {/* Media Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${micOn ? "bg-white border border-slate-100 hover:bg-slate-50 text-slate-700" : "bg-red-500 text-white shadow-red-200"}`}
            >
              {micOn ? (
                <Mic className="w-5 h-5" />
              ) : (
                <PhoneOff className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setVideoOn(!videoOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${videoOn ? "bg-white border border-slate-100 hover:bg-slate-50 text-slate-700" : "bg-red-500 text-white shadow-red-200"}`}
            >
              {videoOn ? (
                <Video className="w-5 h-5" />
              ) : (
                <PhoneOff className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="w-px h-8 bg-slate-200 mx-2" />

          {/* Tools */}
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors tooltip-trigger relative group">
              <Monitor className="w-5 h-5" />
              <span className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                화면 공유
              </span>
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors relative group">
              <Hand className="w-5 h-5" />
              <span className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                손들기
              </span>
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors relative group">
              <Settings className="w-5 h-5" />
              <span className="absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                설정
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
