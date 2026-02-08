"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { BlockNoteEditor as BlockNoteEditorType } from "@blocknote/core";

// Dynamically import BlockNote to avoid SSR issues
const BlockNoteEditorComponent = dynamic(
  () => import("./BlockNoteEditorClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[600px] bg-white border border-gray-200 rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">에디터를 불러오는 중...</p>
        </div>
      </div>
    ),
  }
);

interface BlockNoteEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}

export default function ColumnBlockNoteEditor(props: BlockNoteEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-white border border-gray-200 rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">에디터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return <BlockNoteEditorComponent {...props} />;
}
