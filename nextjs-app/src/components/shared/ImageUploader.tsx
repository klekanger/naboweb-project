"use client";
import { isHeicLikeFile, prepareImageUploadFile } from "@/lib/prepareImageUploadFile";
import { urlForImage } from "@/sanity/lib/utils";
import { cn } from "@heroui/react";
import { Upload as UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Image as SanityImage } from "sanity";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const isAllowedFile = (file: File) =>
  ALLOWED_MIME_TYPES.has(file.type) ||
  (file.type === "" && isHeicLikeFile(file));

export default function ImageUploader({
  onImageSelect,
  className,
  messageImage,
  editMode = false,
}: {
  onImageSelect: (file: File[] | null) => void;
  className?: string;
  messageImage?: SanityImage;
  editMode?: boolean;
}) {
  const [userFilePreview, setUserFilePreview] = useState<string | null>(null);

  const sanityPreviewUrl = useMemo(
    () =>
      editMode && messageImage
        ? urlForImage(messageImage)?.width(800).height(600).fit("max").url() ??
          null
        : null,
    [editMode, messageImage],
  );

  const uploadImagePreview = userFilePreview ?? sanityPreviewUrl;
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readPreviewDataUrl = (f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result && typeof result === "string" && /^data:image\/\w+;base64,/.test(result)) {
        setUserFilePreview(result);
      } else {
        setUserFilePreview(null);
      }
    };
    reader.readAsDataURL(f);
  };

  const processSelectedFiles = async (file: File[] | FileList | null) => {
    if (!file) {
      setUserFilePreview(null);
      onImageSelect(null);
      return;
    }

    let list = file instanceof FileList ? Array.from(file) : file;

    if (!list.every(isAllowedFile)) {
      setError("Bildeformatet må være JPG, PNG, WEBP eller HEIC");
      setUserFilePreview(null);
      onImageSelect(null);
      return;
    }

    setError(null);

    if (list.length === 0) {
      setUserFilePreview(null);
      onImageSelect(null);
      return;
    }

    let toUse = list;
    if (isHeicLikeFile(list[0])) {
      setIsConvertingHeic(true);
      try {
        const converted = await prepareImageUploadFile(list[0]);
        toUse = [converted];
      } catch {
        setError(
          "Kunne ikke konvertere HEIC-bildet i nettleseren. Prøv JPG eller WEBP.",
        );
        setUserFilePreview(null);
        onImageSelect(null);
        return;
      } finally {
        setIsConvertingHeic(false);
      }
    }

    onImageSelect(toUse);
    readPreviewDataUrl(toUse[0]);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    void processSelectedFiles(event.dataTransfer.files);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    void processSelectedFiles(Array.from(event.target.files || []));
  };

  const clearSelection = () => {
    setDragOver(false);
    setUserFilePreview(null);
    onImageSelect(null);
    setError(null);
    setIsConvertingHeic(false);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="relative rounded-lg overflow-hidden group">
        {uploadImagePreview ? (
          <div>
            <Image
              src={uploadImagePreview}
              alt={"Bilde for opplasting"}
              width={800}
              height={600}
              className="object-cover rounded-xl aspect-4/3"
            />
            <button
              onClick={(event) => {
                event.preventDefault();
                clearSelection();
              }}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragOver(false);
            }}
            onDrop={handleDrop}
            className={`border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center transition-colors hover:border-primary ${dragOver ? "bg-default-100" : ""} ${isConvertingHeic ? "pointer-events-none opacity-70" : ""}`}
          >
            <UploadIcon className="w-8 h-8 text-muted-foreground mb-2" />
            <div className="prose lg:prose-lg text-center">
              {isConvertingHeic ? (
                <div className="text-sm text-foreground/80">
                  Konverterer HEIC-bilde…
                </div>
              ) : (
                <>
                  Dra inn et bilde her, eller{" "}
                  <label
                    htmlFor="file-input"
                    className="text-primary underline cursor-pointer"
                  >
                    velg fil
                  </label>
                </>
              )}
              <div className="text-xs my-0">
                Bildet beskjæres automatisk til 4/3 breddeformat.
              </div>
              {error ? (
                <div className="text-xs text-red-500">{error}</div>
              ) : (
                <div className="text-xs h-4"></div>
              )}
            </div>
            <input
              id="file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
              disabled={isConvertingHeic}
              onChange={handleFileSelect}
              onDragOver={(e) => e.preventDefault()}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
