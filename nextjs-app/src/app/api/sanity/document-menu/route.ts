import {
  getSanityAdminEditorAuth,
  simpleErrorResponse,
  simpleSuccessResponse,
} from "@/app/api/_utils/routeUtils";
import {
  CMS_CONFLICT_MESSAGE,
  getCmsDocument,
  isBoundedString,
  isDocumentId,
  readJsonObject,
} from "@/app/api/_utils/cmsDocuments";
import { isRevisionConflict } from "@/app/api/_utils/messageAccess";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

const MAX_BUTTON_TEXT = 100;

type ButtonUpdate = { text: string; fileId: string };

const isButton = (b: unknown): b is ButtonUpdate =>
  typeof b === "object" &&
  b !== null &&
  isBoundedString((b as ButtonUpdate).text, MAX_BUTTON_TEXT) &&
  isDocumentId((b as ButtonUpdate).fileId);

export async function PATCH(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const body = await readJsonObject(request);
  if (!body) return simpleErrorResponse("Invalid request body", 400);

  const { buttons } = body;
  if (!Array.isArray(buttons) || buttons.length !== 4 || !buttons.every(isButton)) {
    return simpleErrorResponse("Invalid request body", 400);
  }

  // Only the documentMenu singleton may be patched here.
  const { doc, errorResponse } = await getCmsDocument(
    "documentMenu",
    body.documentMenuId,
  );
  if (errorResponse) return errorResponse;

  // Every button must point to an existing "other document".
  const fileIds = [...new Set(buttons.map((b) => b.fileId))];
  const validFileCount = await clientWithWriteAccess.fetch<number>(
    `count(*[_type == "fileOtherDocuments" && _id in $ids])`,
    { ids: fileIds },
    { perspective: "published" },
  );
  if (validFileCount !== fileIds.length) {
    return simpleErrorResponse("Ugyldig fil valgt", 400);
  }

  const [b1, b2, b3, b4] = buttons;

  try {
    await clientWithWriteAccess
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set({
        button1Text: b1.text,
        button1File: { _ref: b1.fileId, _type: "reference" },
        button2Text: b2.text,
        button2File: { _ref: b2.fileId, _type: "reference" },
        button3Text: b3.text,
        button3File: { _ref: b3.fileId, _type: "reference" },
        button4Text: b4.text,
        button4File: { _ref: b4.fileId, _type: "reference" },
      })
      .commit();

    revalidateTag("documentMenu", "max");

    return simpleSuccessResponse();
  } catch (error) {
    if (isRevisionConflict(error)) {
      return simpleErrorResponse(CMS_CONFLICT_MESSAGE, 409);
    }
    console.error("Document menu update failed:", error);
    return simpleErrorResponse("Noe gikk galt ved lagring av dokumentmenyen.", 500);
  }
}
