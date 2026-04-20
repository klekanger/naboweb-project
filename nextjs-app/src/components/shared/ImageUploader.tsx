"use client";
import { urlForImage } from "@/sanity/lib/utils";
import { cn } from "@heroui/react";
import { Upload as UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Image as SanityImage } from "sanity";

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
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPreviewImage = (file: File[] | FileList | null) => {
    if (!file) {
      console.error("No file provided");
      setUserFilePreview(null);
      onImageSelect(null);
      return;
    }

    // When dragging and dropping, file is a FileList - convert to array
    if (file instanceof FileList) {
      file = Array.from(file);
    }

    // Validate file type
    if (
      !file.every((f) =>
        ["image/jpeg", "image/png", "image/webp"].includes(f.type),
      )
    ) {
      console.error("Unsupportet image type");
      setError("Bildeformatet må være JPG, PNG eller WEBP");
      setUserFilePreview(null);
      onImageSelect(null);
      return;
    } else {
      setError(null);
    }

    // Run callback with the image file
    onImageSelect(file);

    // Set preview image

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && isValidImage(e.target.result as string)) {
        setUserFilePreview(e.target.result as string);
      } else {
        console.log("Not an image");
        setUserFilePreview(null);
      }
    };

    // Check if there are files to read
    if (file.length > 0) {
      reader.readAsDataURL(file[0]);
    }
  };

  const isValidImage = (file: string) => {
    const imageType = /^data:image\/(\w+);base64,/;
    return imageType.test(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files;

    setPreviewImage(file);
  };

  // check if file is an image
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = Array.from(event.target.files || []);

    setPreviewImage(file);
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
                setDragOver(false);
                setPreviewImage(null);
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
            className={`border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center transition-colors hover:border-primary ${dragOver ? "bg-default-100" : ""}`}
          >
            <UploadIcon className="w-8 h-8 text-muted-foreground mb-2" />
            <div className="prose lg:prose-lg text-center">
              Dra inn et bilde her, eller{" "}
              <label
                htmlFor="file-input"
                className="text-primary underline cursor-pointer"
              >
                velg fil
              </label>
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
              onChange={handleFileSelect}
              onDragOver={handleDrop}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
