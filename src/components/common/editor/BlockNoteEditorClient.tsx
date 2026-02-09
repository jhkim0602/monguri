"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { isLikelyHtml } from "@/lib/columnContent";

interface BlockNoteEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}

export default function BlockNoteEditorClient({
  initialContent = "",
  onChange,
  editable = true,
}: BlockNoteEditorProps) {
  const lastEmittedContentRef = useRef<string | null>(null);
  const lastLoadedExternalContentRef = useRef<string | null>(null);

  // Image upload handler for Supabase
  const handleUpload = async (file: File): Promise<string> => {
    try {
      console.log("🖼️ Starting image upload:", file.name, file.type, file.size);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `editor-uploads/${fileName}`;

      console.log("📤 Uploading to:", filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("column-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError);
        throw uploadError;
      }

      console.log("✅ Upload successful:", uploadData);

      const {
        data: { publicUrl },
      } = supabase.storage.from("column-images").getPublicUrl(filePath);

      console.log("🔗 Public URL:", publicUrl);

      if (!publicUrl) {
        throw new Error("Failed to get public URL");
      }

      return publicUrl;
    } catch (error) {
      console.error("💥 Error uploading image:", error);
      alert(`이미지 업로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
      throw error;
    }
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: [
      {
        type: "paragraph",
        content: "",
      },
    ],
    uploadFile: handleUpload,
  });

  useEffect(() => {
    const nextRaw = initialContent ?? "";

    if (lastLoadedExternalContentRef.current === nextRaw) {
      return;
    }

    if (lastEmittedContentRef.current === nextRaw) {
      lastLoadedExternalContentRef.current = nextRaw;
      return;
    }

    const trimmed = nextRaw.trim();
    let parsedBlocks: PartialBlock[] = [
      {
        type: "paragraph",
        content: "",
      },
    ];

    if (trimmed) {
      try {
        const parsedJson = JSON.parse(trimmed);
        if (Array.isArray(parsedJson) && parsedJson.length > 0) {
          parsedBlocks = parsedJson as PartialBlock[];
        } else {
          parsedBlocks = [
            {
              type: "paragraph",
              content: trimmed,
            },
          ];
        }
      } catch {
        try {
          const converted = isLikelyHtml(trimmed)
            ? editor.tryParseHTMLToBlocks(trimmed)
            : editor.tryParseMarkdownToBlocks(trimmed);

          if (converted.length > 0) {
            parsedBlocks = converted as PartialBlock[];
          } else {
            parsedBlocks = [
              {
                type: "paragraph",
                content: trimmed,
              },
            ];
          }
        } catch (parseError) {
          console.error("Failed to parse column content:", parseError);
          parsedBlocks = [
            {
              type: "paragraph",
              content: trimmed,
            },
          ];
        }
      }
    }

    const currentBlockIds = editor.document.map((block) => block.id);
    if (currentBlockIds.length > 0) {
      editor.replaceBlocks(currentBlockIds, parsedBlocks);
    }

    lastLoadedExternalContentRef.current = nextRaw;
  }, [editor, initialContent]);

  // Handle content changes
  const handleChange = () => {
    if (onChange) {
      const markdown = editor.blocksToMarkdownLossy(editor.document);
      lastEmittedContentRef.current = markdown;
      onChange(markdown);
    }
  };

  return (
    <div className="world-class-editor-container">
      <style jsx global>{`
        /* 🎨 World-Class Editor Styling - Inspired by Notion, Medium, and Substack */

        .world-class-editor-container {
          @apply relative;
        }

        /* Main editor wrapper - Premium feel */
        .bn-container {
          @apply bg-gradient-to-b from-white to-gray-50/30 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300;
          @apply hover:shadow-md hover:border-gray-200;
          min-height: 600px;
          padding: 4rem 3rem;
        }

        /* Editor content area - Generous spacing for focus */
        .bn-editor {
          @apply max-w-3xl mx-auto;
          background: transparent;
        }

        /* TipTap/ProseMirror base - Match page background */
        .tiptap.ProseMirror {
          background: transparent !important;
          outline: none;
        }

        /* Block styling - Clean and breathable */
        .bn-block {
          @apply mb-2 transition-all duration-200;
        }

        .bn-block:hover {
          @apply -ml-1;
        }

        /* === TYPOGRAPHY - Publication Quality === */

        /* Heading 1 - Hero */
        .bn-block h1,
        .bn-block[data-content-type="heading"][data-level="1"] {
          @apply text-5xl font-black text-gray-900 leading-tight tracking-tight;
          @apply mt-12 mb-4;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
          letter-spacing: -0.02em;
        }

        /* Heading 2 - Major Section */
        .bn-block h2,
        .bn-block[data-content-type="heading"][data-level="2"] {
          @apply text-4xl font-bold text-gray-900 leading-snug tracking-tight;
          @apply mt-10 mb-3;
          letter-spacing: -0.015em;
        }

        /* Heading 3 - Section */
        .bn-block h3,
        .bn-block[data-content-type="heading"][data-level="3"] {
          @apply text-2xl font-bold text-gray-900 leading-normal;
          @apply mt-8 mb-2;
        }

        /* Paragraphs - Reading optimized */
        .bn-block p,
        .bn-block[data-content-type="paragraph"] .bn-inline-content {
          @apply text-lg text-gray-700 leading-relaxed;
          line-height: 1.8;
          font-size: 1.125rem;
        }

        /* === LISTS - Clean and Structured === */

        .bn-block ul,
        .bn-block ol {
          @apply pl-8 space-y-2 my-4;
        }

        .bn-block ul li,
        .bn-block ol li {
          @apply text-lg text-gray-700 leading-relaxed;
          line-height: 1.8;
        }

        .bn-block ul li::marker {
          @apply text-blue-500;
        }

        .bn-block ol li::marker {
          @apply text-gray-500 font-semibold;
        }

        /* === CODE BLOCKS - Developer Friendly === */

        .bn-block code {
          @apply bg-gray-100 text-pink-600 px-2 py-1 rounded text-sm font-mono;
        }

        .bn-block pre {
          @apply bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto my-6;
          @apply border border-gray-700;
        }

        .bn-block pre code {
          @apply bg-transparent text-gray-100 p-0;
        }

        /* === QUOTES - Editorial Style === */

        .bn-block blockquote {
          @apply border-l-4 border-blue-500 pl-6 py-2 my-6 italic;
          @apply text-xl text-gray-700 bg-blue-50 rounded-r-lg;
        }

        /* === IMAGES - Magazine Quality === */

        .bn-block img {
          @apply rounded-2xl my-8 w-full shadow-lg;
          @apply transition-transform duration-300 hover:scale-[1.02];
        }

        /* === INTERACTIVE ELEMENTS === */

        /* Drag Handle - Subtle but accessible */
        .bn-drag-handle-menu {
          @apply text-gray-300 hover:text-gray-600 transition-colors;
        }

        .bn-drag-handle-menu:hover {
          @apply bg-gray-50 rounded-lg;
        }

        /* Side Menu - Clean actions */
        .bn-side-menu {
          @apply text-gray-400;
        }

        .bn-side-menu button {
          @apply hover:bg-gray-100 rounded-lg transition-colors;
        }

        /* === SLASH MENU - Command Palette === */

        .bn-suggestion-menu {
          @apply bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden;
          @apply backdrop-blur-sm;
        }

        .bn-suggestion-menu-item {
          @apply px-4 py-3 cursor-pointer transition-all duration-150;
          @apply flex items-center gap-3;
        }

        .bn-suggestion-menu-item:hover,
        .bn-suggestion-menu-item[data-selected="true"] {
          @apply bg-blue-50;
        }

        .bn-suggestion-menu-item-title {
          @apply font-semibold text-gray-900;
        }

        .bn-suggestion-menu-item-subtitle {
          @apply text-sm text-gray-500;
        }

        /* === PLACEHOLDER - Helpful Hints === */

        .bn-block[data-content-type="paragraph"]
          [data-is-empty="true"]::before {
          @apply text-gray-400;
          content: "Type '/' for commands, or start writing...";
          font-size: 1.125rem;
          line-height: 1.8;
        }

        .bn-block[data-content-type="heading"][data-level="1"]
          [data-is-empty="true"]::before {
          @apply text-gray-300;
          content: "Untitled";
        }

        .bn-block[data-content-type="heading"][data-level="2"]
          [data-is-empty="true"]::before {
          @apply text-gray-300;
          content: "Heading";
        }

        .bn-block[data-content-type="heading"][data-level="3"]
          [data-is-empty="true"]::before {
          @apply text-gray-300;
          content: "Subheading";
        }

        /* === SELECTION - Beautiful highlights === */

        .bn-editor ::selection {
          @apply bg-blue-100;
        }

        /* === FOCUS STATES === */

        .bn-editor:focus-within {
          outline: none;
        }

        /* === ANIMATIONS === */

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bn-block {
          animation: fadeIn 0.2s ease-out;
        }

        /* === RESPONSIVE === */

        @media (max-width: 768px) {
          .bn-container {
            @apply px-4 py-8;
          }

          .bn-block h1 {
            @apply text-3xl;
          }

          .bn-block h2 {
            @apply text-2xl;
          }

          .bn-block h3 {
            @apply text-xl;
          }

          .bn-block p {
            @apply text-base;
          }
        }

        /* === DARK MODE READY === */

        @media (prefers-color-scheme: dark) {
          .bn-container {
            @apply bg-gray-900 border-gray-800;
          }

          .bn-block h1,
          .bn-block h2,
          .bn-block h3 {
            @apply text-gray-100;
          }

          .bn-block p {
            @apply text-gray-300;
          }
        }
      `}</style>

      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={handleChange}
        theme="light"
      />
    </div>
  );
}
