"use client";
import { Upload as UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ImageUploader({
  onImageSelect,
}: {
  onImageSelect: (file: File[] | null) => void;
}) {
  const [uploadImagePreview, setUploadImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const setPreviewImage = (file: File[] | FileList | null) => {
    if (file === null || file === undefined) {
      console.error("No file provided");
      setUploadImage(null);
      onImageSelect(null);
    }

    if (Array.isArray(file)) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && isValidImage(e.target.result as string)) {
          setUploadImage(e.target.result as string);
        } else {
          console.log("Not an image");
          setUploadImage(null);
        }
      };
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
    <div className="w-full md:w-1/2">
      <div className="relative rounded-lg overflow-hidden group">
        {uploadImagePreview ? (
          <div>
            <Image
              src={uploadImagePreview}
              alt={"Bilde for opplasting"}
              width={800}
              height={450}
              className="object-cover rounded-xl aspect-[4/3]"
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
            </div>
            <input
              id="file-input"
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
