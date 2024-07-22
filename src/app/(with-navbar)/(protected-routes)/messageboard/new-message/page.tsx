"use client";

import { Schema } from "@sanity/schema";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Skeleton,
  Input,
} from "@nextui-org/react";
import Underline from "@tiptap/extension-underline";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, MessagesSquare, UnderlineIcon } from "lucide-react";
import Link from "next/link";
import { currentUserRoles } from "@/lib/currentUserRoles";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { htmlToBlocks, getBlockContentFeatures } from "@sanity/block-tools";

type MessageType = {
  title: string;
  bodyText: string;
  author: {
    firstName: string;
    lastName: string;
  };
};

const defaultSchema = Schema.compile({
  name: "myMessage",
  types: [
    {
      type: "object",
      name: "message",
      fields: [
        {
          title: "Title",
          type: "string",
          name: "title",
        },
        {
          title: "Body",
          name: "body",
          type: "array",
          of: [{ type: "block" }],
        },
      ],
    },
  ],
});

const blockContentType = defaultSchema
  .get("message")
  .fields.find((field) => field.name === "body").type;

export default function NewMessage() {
  const userData = useUser();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Skriv et innlegg..." }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "h-64 md:h-96 bg-default-100 px-2 rounded-b-lg focus:outline-none block",
      },
    },
  });

  const [message, setMessage] = useState<MessageType>({
    title: "",
    bodyText: "",
    author: {
      firstName: "",
      lastName: "",
    },
  });

  if (!userData) {
    return null;
  }

  const { firstName, lastName } = userData?.user ?? {};
  const { isAdmin } = currentUserRoles(userData?.user as any);

  const handleSubmit = () => {
    if (editor) {
      const bodyText = editor.getHTML();

      console.log("bodyText", bodyText);
      const blocks = htmlToBlocks(bodyText, blockContentType);
      console.log("blocks", blocks);
    }
  };

  return (
    <>
      <Card className="p-2 py-8 mb-16 prose lg:prose-xl">
        <CardHeader className="flex flex-col mb-0 pb-0">
          <div className="pr-4 flex gap-3 w-full">
            <MessagesSquare />{" "}
            <h1 className="text-xl lg:text-3xl border-l-1 pl-2">
              Opprett nytt innlegg
            </h1>
          </div>

          <Input type="text" label="Tittel" />
          <div className="w-full mt-4">
            <MenuBar editor={editor} />
          </div>
        </CardHeader>
        <CardBody className="mt-0 pt-0">
          <EditorContent editor={editor} />
        </CardBody>

        <CardFooter>
          <div>
            <p className="text-xs mt-4 mb-4">
              Du publiserer som: {firstName} {lastName}
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
              <Button color="primary" onPress={handleSubmit}>
                Send inn
              </Button>
              {isAdmin && (
                <Checkbox isSelected>Publiser på vegne av styret</Checkbox>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

// Text editor menu
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="control-group">
      <div className="button-group flex gap-2 py-2 bg-default-100 px-2 rounded-t-lg">
        <Button
          size="sm"
          isIconOnly
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-brand-primary" : ""}
        >
          <Bold className="w-[1rem] h-[1rem]" strokeWidth={3} />
        </Button>
        <Button
          size="sm"
          isIconOnly
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-brand-primary" : ""}
        >
          <Italic className="w-[1rem] h-[1rem]" />
        </Button>
        <Button
          size="sm"
          isIconOnly
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-brand-primary" : ""}
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
      </div>
    </div>
  );
};
