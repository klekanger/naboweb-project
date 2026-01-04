"use client";

import type { MessageType } from "@/types/types";
import { type SanityImageAsset } from "@/types/sanity.types";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Editor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { createContext, useState } from "react";

type MessageEditorContextType = {
  editor: Editor | null;
  isEditingMessage: boolean;
  setIsEditingMessage: (isEditingMessage: boolean) => void;
  message: Omit<MessageType, "messageImage"> & {
    messageImage: SanityImageAsset | null;
  };
  setMessage: (
    message: Omit<MessageType, "messageImage"> & {
      messageImage: SanityImageAsset | null;
    },
  ) => void;
  messageImageFile: File | null;
  setMessageImageFile: (messageImageFile: File | null) => void;
};

const messageEditorInitialValue: MessageEditorContextType = {
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
  const [message, setMessage] = useState<
    Omit<MessageType, "messageImage"> & {
      messageImage: SanityImageAsset | null;
    }
  >({
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
