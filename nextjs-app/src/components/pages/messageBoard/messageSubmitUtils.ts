import { getMessagePortableTextCharacterCount } from "@/context/messageEditorContext";
import type { PortableTextBlock } from "@portabletext/types";

export function getMessageValidationError(
  title: string,
  bodyText: PortableTextBlock[] | null | undefined,
) {
  if (title.trim() === "") {
    return "Meldingen din trenger en tittel.";
  }

  const messageCharacterCount = getMessagePortableTextCharacterCount(bodyText);
  if (messageCharacterCount < 10) {
    return "Det er alltid fint å fatte seg i korthet, men innlegget ditt må være litt lenger (mer enn 10 tegn).";
  }

  return null;
}

export async function uploadMessageImage(
  messageImageFile: File | null,
  title: string,
) {
  if (!messageImageFile) {
    return null;
  }

  const fileData = new FormData();
  fileData.set("messageImage", messageImageFile);
  fileData.set("title", title);

  const fileUploadResponse = await fetch("/api/upload-image-to-sanity", {
    method: "POST",
    body: fileData,
  });

  const fileUploadData = await fileUploadResponse.json();

  if ("error" in fileUploadData) {
    throw new Error(fileUploadData.error?.message ?? "Noe gikk galt");
  }

  if ("success" in fileUploadData) {
    return fileUploadData.success?.imageId ?? null;
  }

  return null;
}
