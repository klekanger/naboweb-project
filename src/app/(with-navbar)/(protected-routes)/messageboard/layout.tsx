import MessageEditorProvider from "@/context/messageEditorContext";

export default function MessageBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MessageEditorProvider>{children}</MessageEditorProvider>;
}
