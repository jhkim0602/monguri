"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";
import { normalizeColumnContent } from "@/lib/columnContent";

interface ViewerProps {
  content: string;
}

export default function ColumnViewer({ content }: ViewerProps) {
  const normalizedContent = normalizeColumnContent(content);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class:
            "rounded-2xl border border-gray-100 my-6 max-h-[500px] object-cover mx-auto shadow-sm",
        },
      }),
    ],
    content: normalizedContent,
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base max-w-none focus:outline-none text-gray-700 leading-relaxed",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && normalizedContent !== editor.getHTML()) {
      editor.commands.setContent(normalizedContent);
    }
  }, [normalizedContent, editor]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
}
