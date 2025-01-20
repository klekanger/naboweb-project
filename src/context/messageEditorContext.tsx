"use client";

import { createContext, useState } from "react";
import type { MessageType } from "@/types/types";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import type { Message } from "@/types/sanity.types";

type MessageEditorContextType = {
  editor: Editor | null;
  isEditingMessage: boolean;
  setIsEditingMessage: (isEditingMessage: boolean) => void;
  message: MessageType;
  setMessage: (message: MessageType) => void;
  messageImageFile: File | null;
  setMessageImageFile: (messageImageFile: File | null) => void;
};

const messageEditorInitialValue = {
  editor: null,
  isEditingMessage: false,
  setIsEditingMessage: () => {},
  message: {
    title: "",
    bodyText: null,
    author: {
      firstName: "",
      lastName: "",
    },
    userId: "",
    fromAdmin: false,
    messageImage: null,
  },
  setMessage: () => {},
  messageImageFile: null,
  setMessageImageFile: () => {},
};

export const MessageEditorContext = createContext<MessageEditorContextType>(
  messageEditorInitialValue,
);

export default function MessageEditorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      CharacterCount.configure({
        limit: 2000,
      }),
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

  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [message, setMessage] = useState<MessageType>({
    title: "",
    bodyText: null,
    author: {
      firstName: "",
      lastName: "",
    },
    userId: "",
    fromAdmin: false,
    messageImage: null,
  });
  const [messageImageFile, setMessageImageFile] = useState<File | null>(null);

  return (
    <MessageEditorContext.Provider
      value={{
        editor,
        isEditingMessage,
        setIsEditingMessage,
        message,
        setMessage,
        messageImageFile,
        setMessageImageFile,
      }}
    >
      {children}
    </MessageEditorContext.Provider>
  );
}
