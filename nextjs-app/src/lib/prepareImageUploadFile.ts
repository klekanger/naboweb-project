/**
 * Convert HEIC/HEIF to JPEG in the browser before upload (Sanity/sharp often cannot
 * decode newer iPhone codecs). Uses `heic-to/next` (libheif WASM).
 */
export function isHeicLikeFile(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

function heicConvertedFile(blob: Blob, originalName: string): File {
  const name = originalName.replace(/\.(heic|heif)$/i, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}

export async function prepareImageUploadFile(file: File): Promise<File> {
  if (!isHeicLikeFile(file)) return file;

  if (typeof window === "undefined") {
    throw new Error("HEIC conversion is only supported in the browser");
  }

  const { heicTo } = await import("heic-to/next");
  const blob = await heicTo({
    blob: file,
    type: "image/jpeg",
    quality: 0.92,
  });
  if (!blob) {
    throw new Error("HEIC conversion returned empty result");
  }
  return heicConvertedFile(blob, file.name);
}
