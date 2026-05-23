import { urlForImage } from "@/sanity/lib/utils";
import type { SanityReference } from "@/types/types";
import Image from "next/image";

interface ImageBoxProps {
  image?: { asset?: SanityReference; lqip?: string };
  alt?: string;
  width?: number;
  height?: number;
  size?: string;
  caption?: string;
  classesWrapper?: string;
  "data-sanity"?: string;
}

export default function ImageBox({
  image,
  alt = "Cover image",
  width = 3500,
  height = 2000,
  size = "(min-width: 640px) 80vw, 100vw",
  caption,
  ...props
}: ImageBoxProps) {
  const imageUrl =
    image && urlForImage(image)?.height(height).width(width).fit("crop").url();

  return (
    <div className="w-full rounded-xl flex flex-col">
      {imageUrl && (
        <>
          <Image
            className="rounded-xl w-full h-full mb-0 pb-0"
            alt={alt}
            width={width}
            height={height}
            sizes={size}
            src={imageUrl}
            {...(typeof image?.lqip === "string" && image.lqip.length > 0
              ? {
                  placeholder: "blur" as const,
                  blurDataURL: image.lqip,
                }
              : {})}
          />
          {caption && (
            <div className="rich-image-caption">
              <em>{caption}</em>
            </div>
          )}
        </>
      )}
    </div>
  );
}
