"use client";

import type { MessageType } from "@/types/types";
import { type SanityImageAsset } from "@/types/sanity.types";
import type { PortableTextBlock } from "@portabletext/types";
import { usePathname } from "next/navigation";
import { createContext, useEffect, useRef, useState } from "react";

type MessageContextMessage = Omit<MessageType, "messageImage"> & {
  messageImage: SanityImageAsset | null;
};

function getMessagePortableTextPlainText(
  bodyText: PortableTextBlock[] | undefined | null,
) {
  if (!Array.isArray(bodyText) || bodyText.length === 0) {
    return "";
  }

  return bodyText
    .map((block) => {
      if (block._type !== "block" || !Array.isArray(block.children)) {
        return "";
      }

      return block.children
        .map((child) =>
          child._type === "span" && typeof child.text === "string"
            ? child.text
            : "",
        )
        .join("");
    })
    .join("\n")
    .trim();
}

export function getMessagePortableTextCharacterCount(
  bodyText: PortableTextBlock[] | undefined | null,
) {
  return getMessagePortableTextPlainText(bodyText).length;
}

const NEW_MESSAGE_PATH = "/messageboard/new-message";

type MessageEditorContextType = {
  isEditingMessage: boolean;
  setIsEditingMessage: (isEditingMessage: boolean) => void;
  message: MessageContextMessage;
  setMessage: (message: MessageContextMessage) => void;
  messageImageFile: File | null;
  setMessageImageFile: (messageImageFile: File | null) => void;
  /** Increments when the app navigates into the new-message route from elsewhere (provider stays mounted). */
  newMessageEditorMountKey: number;
};

const messageEditorInitialValue: MessageEditorContextType = {
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
  newMessageEditorMountKey: 1,
};

export const MessageEditorContext = createContext<MessageEditorContextType>(
  messageEditorInitialValue,
);

export default function MessageEditorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const [newMessageEditorMountKey, setNewMessageEditorMountKey] = useState(1);

  useEffect(() => {
    const previousPathname = prevPathnameRef.current;
    prevPathnameRef.current = pathname;

    if (
      pathname === NEW_MESSAGE_PATH &&
      previousPathname !== null &&
      previousPathname !== NEW_MESSAGE_PATH
    ) {
      const timeoutId = window.setTimeout(() => {
        setNewMessageEditorMountKey((key) => key + 1);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [pathname]);

  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [message, setMessage] = useState<MessageContextMessage>({
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
        isEditingMessage,
        setIsEditingMessage,
        message,
        setMessage,
        messageImageFile,
        setMessageImageFile,
        newMessageEditorMountKey,
      }}
    >
      {children}
    </MessageEditorContext.Provider>
  );
}
