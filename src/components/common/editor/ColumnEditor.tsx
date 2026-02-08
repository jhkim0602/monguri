"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SlashCommandExtension, suggestion } from "./SlashCommandExtension";

interface EditorProps {
  content?: string;
  onChange?: (html: string) => void;
  editable?: boolean;
}

export default function ColumnEditor({
  content = "",
  onChange,
  editable = true,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // 마크다운 입력 규칙 활성화
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-xl my-6 max-w-full h-auto",
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return '제목';
          }
          return "'/' 로 명령어 메뉴 열기";
        },
        showOnlyWhenEditable: true,
      }),
      SlashCommandExtension.configure({
        suggestion: suggestion,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="notion-editor">
      <style jsx global>{`
        .notion-editor {
          @apply min-h-[600px];
        }

        /* Notion-like prose styling */
        .ProseMirror {
          @apply text-gray-900 leading-relaxed;
        }

        /* Headings with proper spacing */
        .ProseMirror h1 {
          @apply text-4xl font-bold mb-2 mt-8 text-gray-900;
          line-height: 1.2;
        }

        .ProseMirror h2 {
          @apply text-3xl font-bold mb-2 mt-6 text-gray-900;
          line-height: 1.3;
        }

        .ProseMirror h3 {
          @apply text-2xl font-bold mb-2 mt-5 text-gray-900;
          line-height: 1.4;
        }

        .ProseMirror h4 {
          @apply text-xl font-bold mb-2 mt-4 text-gray-900;
        }

        /* Paragraph spacing */
        .ProseMirror p {
          @apply text-base mb-3 text-gray-800;
          line-height: 1.7;
        }

        /* Lists */
        .ProseMirror ul,
        .ProseMirror ol {
          @apply pl-6 mb-4 space-y-1;
        }

        .ProseMirror ul li {
          @apply list-disc text-gray-800;
        }

        .ProseMirror ol li {
          @apply list-decimal text-gray-800;
        }

        /* Blockquote */
        .ProseMirror blockquote {
          @apply border-l-4 border-gray-300 pl-4 py-2 my-4 text-gray-600 italic;
        }

        /* Code */
        .ProseMirror code {
          @apply bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono;
        }

        .ProseMirror pre {
          @apply bg-gray-900 text-gray-100 p-4 rounded-lg my-4 overflow-x-auto;
        }

        .ProseMirror pre code {
          @apply bg-transparent text-gray-100 p-0;
        }

        /* Strong and emphasis */
        .ProseMirror strong {
          @apply font-bold text-gray-900;
        }

        .ProseMirror em {
          @apply italic;
        }

        /* Placeholder styling */
        .ProseMirror p.is-editor-empty:first-child::before {
          @apply text-gray-400;
          content: attr(data-placeholder);
          float: left;
          pointer-events: none;
          height: 0;
        }

        /* Focus state - subtle glow */
        .ProseMirror:focus {
          @apply outline-none;
        }

        /* Smooth transitions */
        .ProseMirror * {
          @apply transition-colors duration-150;
        }

        /* Image styling */
        .ProseMirror img {
          @apply cursor-pointer hover:shadow-lg transition-shadow;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
}
