"use client";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
} from "@heroui/react";
import { PortableTextBlock } from "@portabletext/types";
import { Schema } from "@sanity/schema";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  ArrowLeftIcon,
  Bold,
  Italic,
  MessagesSquare,
  UnderlineIcon,
  UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { toHTML } from "@portabletext/to-html";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
 * @param title - The title of the content
 * @param content - The initial content of the editor
 *
 */
export default function ContentEditor({
  title,
  editorTitle,
  editorContent,
}: {
  title: string;
  editorTitle?: string;
  editorContent: PortableTextBlock[];
}) {
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
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

  // convert from sanity PortableTextBlock[] to HTML string
  const htmlContent = useMemo(() => toHTML(editorContent), [editorContent]);

  const [message, setMessage] = useState({
    title: editorTitle ?? "",
    bodyText: htmlContent,
  });

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
      <Card className="p-2 py-8 mb-16">
        <CardHeader className="flex flex-col mb-0 pb-0">
          <div className="pb-4 pr-4 md:pb-8 flex gap-3 w-full">
            <div className="border-r-1 border-black/20 pr-4">
              <MessagesSquare className="h-full" />
            </div>
            <h1 className="text-xl lg:text-3xl prose lg:prose-lg">
              {title ?? "Rediger innhold"}
            </h1>
          </div>

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
        </CardHeader>
        <CardBody className="mt-0 pt-0">
          <EditorContent
            editor={editor}
            aria-label="Teksteditor for å opprette nytt innlegg"
            className="mb-4 md:mb-8"
          />
        </CardBody>

        <CardFooter>
          <div>
            <p className="text-xs mt-4 mb-4">
              Du publiserer som: {/* {firstName} {lastName} */}
            </p>
            <div className="flex gap-4 flex-col md:flex-row">
              <Button
                color="danger"
                as={Link}
                href="/messageboard"
                className="no-underline"
              >
                Avbryt
              </Button>
              <Button
                color="primary"
                onPress={() => console.log("clicked")}
                isLoading={isSubmittingMessage}
                startContent={!isSubmittingMessage && <UploadIcon />}
                className="w-32"
              >
                Send inn
              </Button>
              {/* {isAdmin && (
                <Checkbox
                  isSelected={message.fromAdmin}
                  onValueChange={(e) =>
                    setMessage({ ...message, fromAdmin: e })
                  }
                >
                  Publiser på vegne av styret
                </Checkbox>
              )} */}
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

// Text editor menu
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
