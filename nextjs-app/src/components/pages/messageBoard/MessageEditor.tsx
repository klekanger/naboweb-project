import ImageUploader from "@/components/shared/ImageUploader";
import { MessageEditorContext } from "@/context/messageEditorContext";
import { Input, Label, TextField } from "@heroui/react";
import { toHTML } from "@portabletext/to-html";
import { Editor, EditorContent, useEditorState } from "@tiptap/react";
import { Bold, Italic, UnderlineIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import type { Image as SanityImage } from "sanity";
import { PortableTextBlock } from "sanity";

export default function MessageEditor({
  editorContent,
  messageImage,
  title,
  maxCharacters = 1000,
}: {
  editorContent?: PortableTextBlock[];
  messageImage?: SanityImage;
  title?: string;
  maxCharacters?: number;
}) {
  const { editor, message, setMessage, setMessageImageFile } =
    useContext(MessageEditorContext);

  const handleImageSelect = (selectedImages: File[] | null) => {
    setMessageImageFile(selectedImages?.[0] ?? null);
  };

  const htmlContent = useMemo(
    () => toHTML(editorContent ?? []),
    [editorContent],
  );

  // Set the initial title and editor content on first load
  useEffect(() => {
    setMessage({ ...message, title: title ?? "" });
    if (editor) {
      editor.commands.setContent(htmlContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prevent input when character limit is reached
  useEffect(() => {
    if (!editor) {
      return;
    }

    const originalEditorProps = editor.options.editorProps;

    editor.setOptions({
      editorProps: {
        ...originalEditorProps,
        transformPastedText: (text: string) => {
          const currentCount = editor.storage.characterCount.characters();
          const remaining = maxCharacters - currentCount;
          if (remaining <= 0) {
            return "";
          }
          if (text.length > remaining) {
            return text.slice(0, remaining);
          }
          return text;
        },
        handleDrop: (
          view: any,
          event: DragEvent,
          slice: any,
          moved: boolean,
        ) => {
          const currentCount = editor.storage.characterCount.characters();
          if (currentCount >= maxCharacters && !moved) {
            event.preventDefault();
            return true;
          }
          return false;
        },
        handleDOMEvents: {
          keydown: (view: any, event: KeyboardEvent) => {
            const currentCount = editor.storage.characterCount.characters();
            if (currentCount >= maxCharacters) {
              // Allow backspace, delete, and arrow keys
              if (
                event.key === "Backspace" ||
                event.key === "Delete" ||
                event.key.startsWith("Arrow") ||
                event.key === "Home" ||
                event.key === "End" ||
                event.ctrlKey ||
                event.metaKey
              ) {
                return false; // Allow the default behavior
              }
              // Prevent all other input
              event.preventDefault();
              return true;
            }
            return false; // Allow the default behavior
          },
        },
      },
    });

    return () => {
      // Restore original editorProps on cleanup
      editor.setOptions({
        editorProps: originalEditorProps,
      });
    };
  }, [editor, maxCharacters]);

  return (
    <>
      <div>
        <TextField
          value={message.title}
          onChange={(value) => setMessage({ ...message, title: value })}
          isRequired
        >
          <Label>Tittel</Label>
          <Input type="text" />
        </TextField>
        <div className="h-4" />

        <div className="overflow-hidden mb-4 md:mb-8">
          <MenuBar editor={editor} maxCharacters={maxCharacters} />
          <EditorContent editor={editor} aria-label="Teksteditor" />
        </div>
      </div>
      <ImageUploader
        onImageSelect={handleImageSelect}
        messageImage={messageImage}
        editMode={true}
      />
    </>
  );
}

// Text editor toolbar
const MenuBar = ({
  editor,
  maxCharacters,
}: {
  editor: Editor | null;
  maxCharacters: number;
}) => {
  if (!editor) {
    return null;
  }

  const editorState = useEditorState({
    editor,
    selector: ({ editor: editorInstance }) => ({
      isBold: editorInstance?.isActive("bold") ?? false,
      isItalic: editorInstance?.isActive("italic") ?? false,
      isUnderline: editorInstance?.isActive("underline") ?? false,
      isHeading: editorInstance?.isActive("heading", { level: 2 }) ?? false,
      characterCount: editorInstance?.storage.characterCount.characters() ?? 0,
    }),
  });

  const calculatedPercentage = editorState
    ? Math.round((100 / maxCharacters) * editorState.characterCount)
    : 0;

  return (
    <div role="toolbar" className="">
      <div className="button-group bg-default/10 border-b border-brand-black/10 rounded-t-lg flex gap-2 py-2 px-2 justify-start">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors border border-gray-300 ${
            editorState.isBold
              ? "bg-brand-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Bold"
        >
          <Bold className="w-4 h-4" strokeWidth={3} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors border border-gray-300 ${
            editorState.isItalic
              ? "bg-brand-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors border border-gray-300 ${
            editorState.isUnderline
              ? "bg-brand-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          aria-label="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 h-8 rounded-md text-sm font-medium transition-colors border border-gray-300 ${
            editorState.isHeading
              ? "bg-brand-primary text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Mellomtittel
        </button>
        <div
          className={`items-center flex text-xs text-brand-black/60 gap-2 ml-4 ${editorState && editorState.characterCount === maxCharacters ? "character-count--warning" : ""}`}
        >
          <svg height="20" width="20" viewBox="0 0 20 20">
            <circle r="10" cx="10" cy="10" fill="#C8DD80" />
            <circle
              r="5"
              cx="10"
              cy="10"
              fill="transparent"
              stroke="#005600"
              strokeWidth="10"
              strokeDasharray={`calc(${calculatedPercentage} * 31.4 / 100) 31.4`}
              transform="rotate(-90) translate(-20)"
            />
            <circle r="6" cx="10" cy="10" fill="white" />
          </svg>
          {editorState?.characterCount ?? 0} / {maxCharacters} tegn
        </div>
      </div>
    </div>
  );
};
