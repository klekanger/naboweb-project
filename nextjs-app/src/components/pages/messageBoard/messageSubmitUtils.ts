import { getMessagePortableTextCharacterCount } from "@/context/messageEditorContext";
import { prepareImageUploadFile } from "@/lib/prepareImageUploadFile";
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

  const ready = await prepareImageUploadFile(messageImageFile);

  const fileData = new FormData();
  fileData.set("messageImage", ready);
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

export async function readMessageApiResponse(response: Response) {
  const data: unknown = await response.json();

  if (data && typeof data === "object" && "error" in data) {
    const error = (data as { error?: { message?: string } }).error;
    throw new Error(error?.message ?? "Noe gikk galt");
  }

  return data;
}

export function showMessageErrorModal({
  error,
  setModalTitle,
  setModalBody,
  openModal,
  title = "Det oppsto en feil",
  fallbackMessage = "Ukjent feil",
}: {
  error: unknown;
  setModalTitle: (title: string) => void;
  setModalBody: (body: string) => void;
  openModal: () => void;
  title?: string;
  fallbackMessage?: string;
}) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  console.error(error);
  setModalTitle(title);
  setModalBody(message);
  openModal();
}
