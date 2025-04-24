"use client";

import { Button, Input } from "@heroui/react";
import { toHTML } from "@portabletext/to-html";
import { PortableTextBlock } from "@portabletext/types";
import { Schema } from "@sanity/schema";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeftIcon, Bold, Italic, UnderlineIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useMemo, useState } from "react";
import { MessageEditorContext } from "@/app/context/messageEditorContext";
import type { Image as SanityImage } from "sanity";
import ImageUploader from "./ImageUploader";

const MAX_CHARACTERS = 1000;

const defaultSchema = Schema.compile({
  name: "myMessage",
  types: [
    {
      type: "object",
      name: "message",
      fields: [
        {
          title: "Body",
          name: "bodyText",
          type: "array",
          of: [{ type: "block" }],
        },
      ],
    },
  ],
});

const blockContentType = defaultSchema
  .get("message")
  .fields.find((field: { name: string }) => field.name === "bodyText").type;

/**
 * Editor for creating and editing content
 *
 * @param editorTitle - The title of the editor window
 * @param content - The initial content of the editor
 *
 */
export default function ContentEditor({
  editorContent,
  messageImage,
}: {
  editorContent: PortableTextBlock[];
  messageImage?: SanityImage;
}) {
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const { message, messageImageFile, setMessage, setMessageImageFile } =
    useContext(MessageEditorContext);
  const router = useRouter();

  if (!editorContent) {
    console.error("[ContentEditor] editorContent is not defined");
    return (
      <div>
        <p className="text-brand-danger pb-8">
          Innhold mangler &ndash; eller det har oppstått en feil
        </p>
        <Button
          color="primary"
          onPress={router.back}
          startContent={<ArrowLeftIcon />}
        >
          Tilbake
        </Button>
      </div>
    );
  }

  const handleImageSelect = (selectedImages: File[] | null) => {
    setMessageImageFile(selectedImages?.[0] ?? null);
  };

  // convert from sanity PortableTextBlock[] to HTML string
  const htmlContent = useMemo(() => toHTML(editorContent), [editorContent]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      CharacterCount.configure({
        limit: 2000,
      }),
      Placeholder.configure({ placeholder: "Skriv et innlegg..." }),
    ],
    content: htmlContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "h-64 md:h-96 bg-default-100 px-2 rounded-b-lg focus:outline-none block",
      },
    },
  });

  const percentage = editor
    ? Math.round(
        (100 / MAX_CHARACTERS) * editor.storage.characterCount.characters(),
      )
    : 0;

  return (
    <>
      <Input
        type="text"
        label="Tittel"
        size="lg"
        isRequired
        value={message.title}
        onValueChange={(e) => setMessage({ ...message, title: e })}
      />

      <div className="w-full mt-4">
        <MenuBar editor={editor} percentage={percentage} />
      </div>

      <EditorContent
        editor={editor}
        aria-label="Teksteditor for å opprette nytt innlegg"
        className="mb-4 md:mb-8"
      />
      <ImageUploader onImageSelect={handleImageSelect} className="" />
    </>
  );
}

// Text editor toolbar
const MenuBar = ({
  editor,
  percentage,
}: {
  editor: Editor | null;
  percentage: number;
}) => {
  if (!editor) {
    return null;
  }

  return (
    <div role="toolbar">
      <div className="button-group flex gap-2 py-2 bg-default-100 px-2 rounded-t-lg">
        <Button
          size="sm"
          isIconOnly
          onPress={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-brand-primary" : ""}
          aria-label="Bold"
          title="Bold"
        >
          <Bold className="w-[1rem] h-[1rem]" strokeWidth={3} />
        </Button>
        <Button
          size="sm"
          isIconOnly
          onPress={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-brand-primary" : ""}
          aria-label="Italic"
          title="Italic"
        >
          <Italic className="w-[1rem] h-[1rem]" />
        </Button>
        <Button
          size="sm"
          isIconOnly
          onPress={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-brand-primary" : ""}
          aria-label="Underline"
          title="Underline"
        >
          <UnderlineIcon className="w-[1rem] h-[1rem]" />
        </Button>

        <Button
          size="sm"
          onPress={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "bg-brand-primary" : ""
          }
        >
          Mellomtittel
        </Button>
        <div
          className={`items-center flex text-xs text-brand-black/60 gap-2 ml-4 ${editor && editor.storage.characterCount.characters() === MAX_CHARACTERS ? "character-count--warning" : ""}`}
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
              strokeDasharray={`calc(${percentage} * 31.4 / 100) 31.4`}
              transform="rotate(-90) translate(-20)"
            />
            <circle r="6" cx="10" cy="10" fill="white" />
          </svg>
          {editor && editor.storage.characterCount.characters()} /{" "}
          {MAX_CHARACTERS} tegn
        </div>
      </div>
    </div>
  );
};
