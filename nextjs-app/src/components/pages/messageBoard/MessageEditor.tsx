import ImageUploader from "@/components/shared/ImageUploader";
import {
  getMessagePortableTextCharacterCount,
  MessageEditorContext,
} from "@/context/messageEditorContext";
import { Input, Label, TextField } from "@heroui/react";
import {
  defineSchema,
  EditorProvider,
  PortableTextEditable,
  useEditor,
  useEditorSelector,
  type RenderDecoratorFunction,
  type RenderStyleFunction,
} from "@portabletext/editor";
import { EventListenerPlugin } from "@portabletext/editor/plugins";
import { isActiveDecorator, isActiveStyle } from "@portabletext/editor/selectors";
import type { PortableTextBlock } from "@portabletext/types";
import { Bold, Italic, UnderlineIcon } from "lucide-react";
import {
  useContext,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import type { Image as SanityImage } from "sanity";

const messageBodySchema = defineSchema({
  decorators: [{ name: "strong" }, { name: "em" }, { name: "underline" }],
  styles: [{ name: "normal" }, { name: "h2" }],
  lists: [],
  annotations: [],
  inlineObjects: [],
  blockObjects: [],
});

const renderStyle: RenderStyleFunction = (props) => {
  switch (props.schemaType.value) {
    case "h2":
      return <h2>{props.children}</h2>;
    default:
      return <p>{props.children}</p>;
  }
};

const renderDecorator: RenderDecoratorFunction = (props) => {
  switch (props.value) {
    case "strong":
      return <strong className="font-bold">{props.children}</strong>;
    case "em":
      return <em className="italic">{props.children}</em>;
    case "underline":
      return <u>{props.children}</u>;
    default:
      return <>{props.children}</>;
  }
};

export default function MessageEditor({
  editorContent,
  messageImage,
  title,
  maxCharacters = 1000,
}: {
  editorContent: PortableTextBlock[];
  messageImage?: SanityImage;
  title?: string;
  maxCharacters?: number;
}) {
  const { message, setMessage, setMessageImageFile } =
    useContext(MessageEditorContext);
  const messageRef = useRef(message);
  const initialBody = editorContent;
  const [characterCount, setCharacterCount] = useState(
    getMessagePortableTextCharacterCount(initialBody),
  );
  const previousValidBodyRef = useRef<PortableTextBlock[]>(initialBody);

  const handleImageSelect = (selectedImages: File[] | null) => {
    setMessageImageFile(selectedImages?.[0] ?? null);
  };

  const initialBodyValueRef = useRef<PortableTextBlock[]>(initialBody);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  // Set initial title/body on first load
  useEffect(() => {
    const nextMessage = {
      ...messageRef.current,
      title: title ?? "",
      bodyText: initialBodyValueRef.current,
    };
    messageRef.current = nextMessage;
    previousValidBodyRef.current = initialBodyValueRef.current;
    setCharacterCount(
      getMessagePortableTextCharacterCount(initialBodyValueRef.current),
    );
    setMessage(nextMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <div className="border border-brand-black/10 rounded-lg">
            <EditorProvider
              initialConfig={{
                schemaDefinition: messageBodySchema,
                initialValue: initialBodyValueRef.current as any,
              }}
            >
              <MessageEditorInner
                maxCharacters={maxCharacters}
                characterCount={characterCount}
                setCharacterCount={setCharacterCount}
                previousValidBodyRef={previousValidBodyRef}
              />
            </EditorProvider>
          </div>
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

function MessageEditorInner({
  maxCharacters,
  characterCount,
  setCharacterCount,
  previousValidBodyRef,
}: {
  maxCharacters: number;
  characterCount: number;
  setCharacterCount: (value: number) => void;
  previousValidBodyRef: MutableRefObject<PortableTextBlock[]>;
}) {
  const editor = useEditor();
  const { message, setMessage } = useContext(MessageEditorContext);
  const messageRef = useRef(message);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  const isBold = useEditorSelector(editor, isActiveDecorator("strong"));
  const isItalic = useEditorSelector(editor, isActiveDecorator("em"));
  const isUnderline = useEditorSelector(editor, isActiveDecorator("underline"));
  const isHeading = useEditorSelector(editor, isActiveStyle("h2"));

  const send = (event: Parameters<typeof editor.send>[0]) => {
    editor.send(event);
    editor.send({ type: "focus" });
  };

  const calculatedPercentage = Math.round((100 / maxCharacters) * characterCount);

  return (
    <>
      <EventListenerPlugin
        on={(event) => {
          if (event.type !== "mutation" || !event.value) {
            return;
          }

          const nextValue = event.value as unknown as PortableTextBlock[];
          const nextCount = getMessagePortableTextCharacterCount(nextValue);

          if (nextCount > maxCharacters) {
            editor.send(
              {
                type: "update value",
                value: previousValidBodyRef.current as any,
              } as any,
            );
            return;
          }

          previousValidBodyRef.current = nextValue;
          setCharacterCount(nextCount);
          setMessage({
            ...messageRef.current,
            bodyText: nextValue,
          });
        }}
      />
      <div role="toolbar" className="">
        <div className="button-group bg-default/10 border-b border-brand-black/10 rounded-t-lg flex gap-2 py-2 px-2 justify-start">
          <button
            type="button"
            onClick={() => send({ type: "decorator.toggle", decorator: "strong" })}
            className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors border border-gray-300 ${
              isBold
                ? "bg-brand-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            aria-label="Bold"
          >
            <Bold className="w-4 h-4" strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={() => send({ type: "decorator.toggle", decorator: "em" })}
            className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors border border-gray-300 ${
              isItalic
                ? "bg-brand-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            aria-label="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              send({ type: "decorator.toggle", decorator: "underline" })
            }
            className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors border border-gray-300 ${
              isUnderline
                ? "bg-brand-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            aria-label="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => send({ type: "style.toggle", style: "h2" })}
            className={`px-3 h-8 rounded-md text-sm font-medium transition-colors border border-gray-300 ${
              isHeading
                ? "bg-brand-primary text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Mellomtittel
          </button>
          <div
            className={`items-center flex text-xs text-brand-black/60 gap-2 ml-4 ${characterCount === maxCharacters ? "character-count--warning" : ""}`}
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
            {characterCount} / {maxCharacters} tegn
          </div>
        </div>
      </div>
      <div className="h-64 md:h-96 bg-default-100 px-2 rounded-b-lg focus:outline-none block overflow-y-auto">
        <PortableTextEditable
          className="min-h-full p-2 focus:outline-none prose lg:prose-xl max-w-none"
          renderStyle={renderStyle}
          renderDecorator={renderDecorator}
        />
      </div>
    </>
  );
}
