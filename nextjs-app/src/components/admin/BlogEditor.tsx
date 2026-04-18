"use client";

import CustomButton from "@/components/CustomButton";
import { urlForImage } from "@/sanity/lib/utils";
import { Input, Label, TextField } from "@heroui/react";
import {
  defineSchema,
  EditorProvider,
  PortableTextEditable,
  useEditor,
  useEditorSelector,
  type PortableTextBlock,
  type RenderBlockFunction,
  type RenderDecoratorFunction,
  type RenderListItemFunction,
  type RenderStyleFunction,
} from "@portabletext/editor";
import { EventListenerPlugin } from "@portabletext/editor/plugins";
import {
  isActiveDecorator,
  isActiveListItem,
  isActiveStyle,
} from "@portabletext/editor/selectors";
import {
  AlignJustify,
  Bold,
  CheckCircle,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  List,
  ListOrdered,
  Trash2,
  UnderlineIcon,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Image } from "sanity";

type Author = {
  _id: string;
  firstName: string | null;
  lastName: string | null;
};

export type BlogPostData = {
  _id?: string;
  title?: string;
  slug?: string;
  privatePost?: boolean;
  excerpt?: PortableTextBlock[];
  bodyText?: PortableTextBlock[];
  featuredImage?: {
    asset?: { _ref?: string };
    caption?: string;
    alt?: string;
  };
  author?: Array<{ _id: string }>;
};

type Props = {
  mode: "create" | "edit";
  initialData?: BlogPostData;
  authors: Author[];
};

// Schema for the body text editor
const blogBodySchema = defineSchema({
  decorators: [
    { name: "strong" },
    { name: "em" },
    { name: "underline" },
  ],
  styles: [
    { name: "normal" },
    { name: "h2" },
    { name: "h3" },
    { name: "h4" },
    { name: "blockquote" },
  ],
  lists: [{ name: "bullet" }, { name: "number" }],
  annotations: [],
  inlineObjects: [],
  blockObjects: [{ name: "image" }],
});

const renderStyle: RenderStyleFunction = (props) => {
  switch (props.schemaType.value) {
    case "h2":
      return (
        <h2 className="text-2xl font-bold mt-4 mb-2">{props.children}</h2>
      );
    case "h3":
      return (
        <h3 className="text-xl font-semibold mt-3 mb-1">{props.children}</h3>
      );
    case "h4":
      return (
        <h4 className="text-lg font-semibold mt-2 mb-1">{props.children}</h4>
      );
    case "blockquote":
      return (
        <blockquote className="pl-4 border-l-4 border-gray-300 italic my-2 text-foreground/70">
          {props.children}
        </blockquote>
      );
    default:
      return <p className="my-1">{props.children}</p>;
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

const renderBlock: RenderBlockFunction = (props) => {
  if (props.schemaType.name === "image") {
    const v = props.value as { asset?: { _ref?: string }; alt?: string };
    const url = v.asset?._ref
      ? urlForImage({ asset: v.asset } as Image)?.width(600).fit("max").url()
      : null;
    return (
      <figure className="my-4">
        {url ? (
          <img src={url} alt={v.alt ?? ""} className="max-w-full rounded-lg" />
        ) : (
          <div className="p-3 bg-gray-100 text-xs text-gray-500 rounded">[Bilde]</div>
        )}
        {props.children}
      </figure>
    );
  }
  return <div>{props.children}</div>;
};

const renderListItem: RenderListItemFunction = (props) => (
  <>{props.children}</>
);

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function textToBlocks(text: string): PortableTextBlock[] {
  if (!text.trim()) return [];
  return [
    {
      _type: "block",
      _key: Math.random().toString(36).slice(2),
      style: "normal",
      children: [
        {
          _type: "span",
          _key: Math.random().toString(36).slice(2),
          text,
          marks: [],
        },
      ],
      markDefs: [],
    } as unknown as PortableTextBlock,
  ];
}

export default function BlogEditor({ mode, initialData, authors }: Props) {
  const router = useRouter();
  const initialAuthorIds = initialData?.author?.map((a) => a._id) ?? [];

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [privatePost, setPrivatePost] = useState(
    initialData?.privatePost ?? false,
  );
  const [excerpt, setExcerpt] = useState(() => {
    const first = initialData?.excerpt?.[0] as
      | { children?: Array<{ text?: string }> }
      | undefined;
    return first?.children?.[0]?.text ?? "";
  });
  const [selectedAuthorIds, setSelectedAuthorIds] =
    useState<string[]>(initialAuthorIds);
  const [featuredImageId, setFeaturedImageId] = useState(
    initialData?.featuredImage?.asset?._ref ?? "",
  );
  const [featuredImageCaption, setFeaturedImageCaption] = useState(
    initialData?.featuredImage?.caption ?? "",
  );
  const [featuredImageAlt, setFeaturedImageAlt] = useState(
    initialData?.featuredImage?.alt ?? "",
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bodyValueRef = useRef<PortableTextBlock[]>(
    (initialData?.bodyText as PortableTextBlock[]) ?? [],
  );

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("messageImage", file);
    formData.append("title", file.name);

    try {
      const res = await fetch("/api/upload-image-to-sanity", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeaturedImageId(data.success.imageId);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Bildeoppasting feilet.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setErrorMessage("Tittel er påkrevd.");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Slug er påkrevd.");
      return;
    }
    if (!bodyValueRef.current.length) {
      setErrorMessage("Brødtekst er påkrevd.");
      return;
    }

    setIsSaving(true);
    setResult(null);
    setErrorMessage("");

    const payload = {
      _id: initialData?._id,
      title,
      slug,
      privatePost,
      excerpt: textToBlocks(excerpt),
      bodyText: bodyValueRef.current,
      featuredImageId: featuredImageId || undefined,
      featuredImageCaption: featuredImageCaption || undefined,
      featuredImageAlt: featuredImageAlt || undefined,
      authorIds: selectedAuthorIds,
    };

    try {
      const res = await fetch("/api/sanity/blog", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult("success");
      setTimeout(() => router.push("/admin/blog"), 1200);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Noe gikk galt ved lagring.",
      );
      setResult("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?._id) return;
    setIsDeleting(true);

    try {
      const res = await fetch("/api/sanity/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: initialData._id, slug }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push("/admin/blog");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Noe gikk galt ved sletting.",
      );
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Title */}
      <TextField
        value={title}
        onChange={(value) => {
          setTitle(value);
          if (mode === "create") setSlug(slugify(value));
        }}
        isRequired
      >
        <Label>Tittel</Label>
        <Input type="text" placeholder="Tittel på innlegget" />
      </TextField>

      {/* Slug */}
      <TextField value={slug} onChange={setSlug} isRequired>
        <Label>Slug (URL)</Label>
        <Input type="text" placeholder="slug-til-innlegget" />
      </TextField>

      {/* Private toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={privatePost}
          onChange={(e) => setPrivatePost(e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm font-medium">
          Privat innlegg (kun for innloggede brukere)
        </span>
      </label>

      {/* Excerpt */}
      <div>
        <label className="text-sm font-medium block mb-1">Sammendrag</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          maxLength={300}
          rows={3}
          className="w-full border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-secondary/40 bg-background"
          placeholder="Kort beskrivelse av innlegget (vises i listevisning)…"
        />
        <p className="text-xs text-foreground/50 mt-1">{excerpt.length} / 300 tegn</p>
      </div>

      {/* Featured image */}
      <div>
        <label className="text-sm font-medium block mb-2">Toppbilde</label>
        <div className="flex gap-3 flex-wrap items-center">
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
          <CustomButton
            variant="secondary"
            size="sm"
            onPress={() => imageInputRef.current?.click()}
            isPending={isUploading}
          >
            {featuredImageId ? "Bytt bilde" : "Last opp bilde"}
          </CustomButton>
          {featuredImageId && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Bilde lastet opp
            </span>
          )}
        </div>
        {featuredImageId && (
          <div className="mt-3 space-y-3">
            <img
              src={
                urlForImage({ asset: { _ref: featuredImageId } } as Image)
                  ?.width(600)
                  .fit("max")
                  .url() ?? ""
              }
              alt="Toppbilde forhåndsvisning"
              className="max-w-sm w-full rounded-lg border border-border"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField
                value={featuredImageCaption}
                onChange={setFeaturedImageCaption}
              >
                <Label>Bildetekst</Label>
                <Input type="text" placeholder="Valgfri bildetekst" />
              </TextField>
              <TextField value={featuredImageAlt} onChange={setFeaturedImageAlt}>
                <Label>Alt-tekst</Label>
                <Input
                  type="text"
                  placeholder="Beskrivelse for tilgjengelighet"
                />
              </TextField>
            </div>
          </div>
        )}
      </div>

      {/* Body text — @portabletext/editor */}
      <div>
        <label className="text-sm font-medium block mb-1">
          Brødtekst <span className="text-red-500">*</span>
        </label>
        <div className="border border-border rounded-xl overflow-hidden">
          <EditorProvider
            initialConfig={{
              schemaDefinition: blogBodySchema,
              initialValue: bodyValueRef.current,
            }}
          >
            <EventListenerPlugin
              on={(event) => {
                if (event.type === "mutation" && event.value) {
                  bodyValueRef.current = event.value;
                }
              }}
            />
            <BlogBodyToolbar />
            <PortableTextEditable
              className="min-h-[320px] p-4 focus:outline-none"
              renderStyle={renderStyle}
              renderDecorator={renderDecorator}
              renderBlock={renderBlock}
              renderListItem={renderListItem}
            />
          </EditorProvider>
        </div>
      </div>

      {/* Authors */}
      {authors.length > 0 && (
        <div>
          <label className="text-sm font-medium block mb-2">
            Forfatter(e)
          </label>
          <div className="flex flex-wrap gap-2">
            {authors.map((a) => {
              const name = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
              const isSelected = selectedAuthorIds.includes(a._id);
              return (
                <button
                  key={a._id}
                  type="button"
                  onClick={() =>
                    setSelectedAuthorIds((prev) =>
                      isSelected
                        ? prev.filter((id) => id !== a._id)
                        : [...prev, a._id],
                    )
                  }
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isSelected
                      ? "bg-brand-secondary text-white border-brand-secondary"
                      : "border-border hover:border-brand-secondary"
                  }`}
                >
                  {name || a._id}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {errorMessage && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <XCircle className="h-4 w-4" />
          {errorMessage}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 flex-wrap">
        <CustomButton onPress={handleSave} isPending={isSaving}>
          {mode === "create" ? "Publiser innlegg" : "Lagre endringer"}
        </CustomButton>

        {result === "success" && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Lagret!
          </span>
        )}

        {mode === "edit" && !showDeleteConfirm && (
          <CustomButton
            variant="danger"
            onPress={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Slett innlegg
          </CustomButton>
        )}

        {showDeleteConfirm && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-red-600">
              Er du sikker?
            </span>
            <CustomButton
              variant="danger"
              isPending={isDeleting}
              onPress={handleDelete}
            >
              Ja, slett
            </CustomButton>
            <CustomButton
              variant="ghost"
              onPress={() => setShowDeleteConfirm(false)}
            >
              Avbryt
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
}

// Toolbar — must be inside EditorProvider
function BlogBodyToolbar() {
  const editor = useEditor();
  const isBold = useEditorSelector(editor, isActiveDecorator("strong"));
  const isItalic = useEditorSelector(editor, isActiveDecorator("em"));
  const isUnderline = useEditorSelector(editor, isActiveDecorator("underline"));
  const isH2 = useEditorSelector(editor, isActiveStyle("h2"));
  const isH3 = useEditorSelector(editor, isActiveStyle("h3"));
  const isH4 = useEditorSelector(editor, isActiveStyle("h4"));
  const isBlockquote = useEditorSelector(editor, isActiveStyle("blockquote"));
  const isBullet = useEditorSelector(editor, isActiveListItem("bullet"));
  const isNumber = useEditorSelector(editor, isActiveListItem("number"));

  const send = (event: Parameters<typeof editor.send>[0]) => {
    editor.send(event);
    editor.send({ type: "focus" });
  };

  return (
    <div
      role="toolbar"
      className="flex flex-wrap gap-1 p-2 border-b border-border bg-default/10"
    >
      <ToolbarBtn
        label="Bold"
        isActive={isBold}
        onClick={() => send({ type: "decorator.toggle", decorator: "strong" })}
        icon={<Bold className="w-4 h-4" strokeWidth={3} />}
      />
      <ToolbarBtn
        label="Italic"
        isActive={isItalic}
        onClick={() => send({ type: "decorator.toggle", decorator: "em" })}
        icon={<Italic className="w-4 h-4" />}
      />
      <ToolbarBtn
        label="Underline"
        isActive={isUnderline}
        onClick={() =>
          send({ type: "decorator.toggle", decorator: "underline" })
        }
        icon={<UnderlineIcon className="w-4 h-4" />}
      />
      <div className="w-px bg-gray-300 mx-1 self-stretch" />
      <ToolbarBtn
        label="H2"
        isActive={isH2}
        onClick={() => send({ type: "style.toggle", style: "h2" })}
        icon={<Heading2 className="w-4 h-4" />}
      />
      <ToolbarBtn
        label="H3"
        isActive={isH3}
        onClick={() => send({ type: "style.toggle", style: "h3" })}
        icon={<Heading3 className="w-4 h-4" />}
      />
      <ToolbarBtn
        label="H4"
        isActive={isH4}
        onClick={() => send({ type: "style.toggle", style: "h4" })}
        icon={<Heading4 className="w-4 h-4" />}
      />
      <div className="w-px bg-gray-300 mx-1 self-stretch" />
      <ToolbarBtn
        label="Punktliste"
        isActive={isBullet}
        onClick={() =>
          send({ type: "list item.toggle", listItem: "bullet" })
        }
        icon={<List className="w-4 h-4" />}
      />
      <ToolbarBtn
        label="Nummerert liste"
        isActive={isNumber}
        onClick={() =>
          send({ type: "list item.toggle", listItem: "number" })
        }
        icon={<ListOrdered className="w-4 h-4" />}
      />
      <ToolbarBtn
        label="Sitat"
        isActive={isBlockquote}
        onClick={() => send({ type: "style.toggle", style: "blockquote" })}
        icon={<AlignJustify className="w-4 h-4" />}
      />
    </div>
  );
}

function ToolbarBtn({
  label,
  isActive,
  onClick,
  icon,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md text-sm transition-colors border ${
        isActive
          ? "bg-brand-primary text-white border-brand-primary"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300"
      }`}
    >
      {icon}
    </button>
  );
}
