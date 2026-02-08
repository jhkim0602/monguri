import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import { CommandList } from "./CommandList"; // Import the CommandList component
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Type,
  CheckSquare,
} from "lucide-react";

// Define the available commands
const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: "텍스트",
      subtitle: "일반 텍스트를 작성합니다.",
      icon: <Type size={18} />,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .toggleNode("paragraph", "paragraph")
          .run();
      },
    },
    {
      title: "제목 1",
      subtitle: "가장 큰 섹션 제목입니다.",
      icon: <Heading1 size={18} />,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run();
      },
    },
    {
      title: "제목 2",
      subtitle: "중간 크기의 섹션 제목입니다.",
      icon: <Heading2 size={18} />,
      command: ({ editor, range }: any) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run();
      },
    },
    {
      title: "글머리 기호 목록",
      subtitle: "간단한 불렛 리스트를 만듭니다.",
      icon: <List size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "번호 매기기 목록",
      subtitle: "순서가 있는 리스트를 만듭니다.",
      icon: <ListOrdered size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "인용구",
      subtitle: "중요한 텍스트를 강조합니다.",
      icon: <Quote size={18} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: "이미지",
      subtitle: "이미지를 삽입합니다.",
      icon: <ImageIcon size={18} />,
      command: ({ editor, range }: any) => {
        // Trigger generic image upload handling if possible, or simple prompt
        const url = window.prompt("이미지 URL을 입력하세요:");
        if (url) {
            editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
        }
      },
    },
  ]
    .filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 10);
};

// Configure the render logic using tippy.js
const renderItems = () => {
  let component: ReactRenderer | null = null;
  let popup: any | null = null;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },

    onUpdate(props: any) {
      component?.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown(props: any) {
      if (props.event.key === "Escape") {
        popup[0].hide();
        return true;
      }

      return (component?.ref as any)?.onKeyDown?.(props);
    },

    onExit() {
      popup[0].destroy();
      component?.destroy();
    },
  };
};

export const SlashCommandExtension = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const suggestion = {
    items: getSuggestionItems,
    render: renderItems,
};
