import ImageUploader from "@/components/shared/ImageUploader";
import { MessageEditorContext } from "@/context/messageEditorContext";
import { Button, Input, Spacer } from "@heroui/react";
import { toHTML } from "@portabletext/to-html";
import { Schema } from "@sanity/schema";
import { Editor, EditorContent } from "@tiptap/react";
import { Bold, Italic, UnderlineIcon } from "lucide-react";
import { useContext, useEffect, useMemo } from "react";
import type { Image as SanityImage } from "sanity";
import { PortableTextBlock } from "sanity";

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

  const percentage = editor
    ? Math.round(
        (100 / maxCharacters) * editor.storage.characterCount.characters(),
      )
    : 0;

  return (
    <>
      <div>
        <Input
          type="text"
          label="Tittel"
          size="lg"
          isRequired
          value={message.title}
          onValueChange={(e) => setMessage({ ...message, title: e })}
        />
        <Spacer y={4} />

        <MenuBar
          editor={editor}
          percentage={percentage}
          maxCharacters={maxCharacters}
        />
        <EditorContent
          editor={editor}
          aria-label="Teksteditor"
          className="mb-4 md:mb-8"
        />
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
  percentage,
  maxCharacters,
}: {
  editor: Editor | null;
  percentage: number;
  maxCharacters: number;
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
          onClick={() => editor.chain().focus().toggleBold().run()}
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
          onClick={() => editor.chain().focus().toggleItalic().run()}
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
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-brand-primary" : ""}
          aria-label="Underline"
          title="Underline"
        >
          <UnderlineIcon className="w-[1rem] h-[1rem]" />
        </Button>

        <Button
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "bg-brand-primary" : ""
          }
        >
          Mellomtittel
        </Button>
        <div
          className={`items-center flex text-xs text-brand-black/60 gap-2 ml-4 ${editor && editor.storage.characterCount.characters() === maxCharacters ? "character-count--warning" : ""}`}
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
          {maxCharacters} tegn
        </div>
      </div>
    </div>
  );
};
