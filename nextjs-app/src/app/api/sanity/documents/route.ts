import {
  getSanityAdminEditorAuth,
  simpleErrorResponse,
  simpleSuccessResponse,
} from "@/app/api/_utils/routeUtils";
import {
  CMS_CONFLICT_MESSAGE,
  deleteCmsDocument,
  getCmsDocument,
  isBoundedString,
  isFileAssetId,
  isStringArray,
  readJsonObject,
} from "@/app/api/_utils/cmsDocuments";
import { isRevisionConflict } from "@/app/api/_utils/messageAccess";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

const DOC_TYPE = "fileOtherDocuments";
const MAX_TITLE = 200;
const MAX_DESCRIPTION = 2_000;
const TAG_LIMITS = { maxItems: 20, maxLength: 50 };

function revalidateDocs() {
  revalidateTag(DOC_TYPE, "max");
}

type DocumentFields = {
  title?: string;
  description?: string;
  tags?: string[];
  assetId?: string;
};

/** Validates the fields that are present; returns an error message or the fields. */
function parseFields(body: Record<string, unknown>): DocumentFields | string {
  const { title, description, tags, assetId } = body;
  const fields: DocumentFields = {};

  if (title !== undefined) {
    if (!isBoundedString(title, MAX_TITLE) || !title.trim()) return "Ugyldig tittel";
    fields.title = title;
  }
  if (description !== undefined && description !== null) {
    if (!isBoundedString(description, MAX_DESCRIPTION)) return "Ugyldig beskrivelse";
    fields.description = description;
  }
  if (tags !== undefined && tags !== null) {
    if (!isStringArray(tags, TAG_LIMITS)) return "Ugyldige stikkord";
    fields.tags = tags;
  }
  if (assetId !== undefined && assetId !== null && assetId !== "") {
    if (!isFileAssetId(assetId)) return "Ugyldig fil";
    fields.assetId = assetId;
  }
  return fields;
}

const fileField = (assetId: string) => ({
  _type: "file",
  asset: { _ref: assetId, _type: "reference" },
});

export async function POST(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const body = await readJsonObject(request);
  if (!body) return simpleErrorResponse("Ugyldig forespørsel", 400);

  const fields = parseFields(body);
  if (typeof fields === "string") return simpleErrorResponse(fields, 400);
  if (!fields.title || !fields.assetId) {
    return simpleErrorResponse("title and assetId are required", 400);
  }

  try {
    const result = await clientWithWriteAccess.create({
      _type: DOC_TYPE,
      title: fields.title,
      description: fields.description ?? "",
      tags: fields.tags ?? [],
      otherDocument: fileField(fields.assetId),
    });

    revalidateDocs();
    return simpleSuccessResponse({ _id: result._id });
  } catch (error) {
    console.error("Document creation failed:", error);
    return simpleErrorResponse("Noe gikk galt ved oppretting av dokumentet.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const body = await readJsonObject(request);
  if (!body) return simpleErrorResponse("Ugyldig forespørsel", 400);

  const { doc, errorResponse } = await getCmsDocument(DOC_TYPE, body._id);
  if (errorResponse) return errorResponse;

  const fields = parseFields(body);
  if (typeof fields === "string") return simpleErrorResponse(fields, 400);

  const patch: Record<string, unknown> = {};
  if (fields.title !== undefined) patch.title = fields.title;
  if (fields.description !== undefined) patch.description = fields.description;
  if (fields.tags !== undefined) patch.tags = fields.tags;
  if (fields.assetId) patch.otherDocument = fileField(fields.assetId);

  try {
    await clientWithWriteAccess
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set(patch)
      .commit();
    revalidateDocs();
    return simpleSuccessResponse();
  } catch (error) {
    if (isRevisionConflict(error)) {
      return simpleErrorResponse(CMS_CONFLICT_MESSAGE, 409);
    }
    console.error("Document update failed:", error);
    return simpleErrorResponse("Noe gikk galt ved oppdatering av dokumentet.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const body = await readJsonObject(request);
  if (!body) return simpleErrorResponse("Ugyldig forespørsel", 400);

  const { doc, errorResponse } = await getCmsDocument(DOC_TYPE, body._id);
  if (errorResponse) return errorResponse;

  try {
    if (!(await deleteCmsDocument(DOC_TYPE, doc, { deleteFileAssets: true }))) {
      return simpleErrorResponse(CMS_CONFLICT_MESSAGE, 409);
    }
    revalidateDocs();
    return simpleSuccessResponse();
  } catch (error) {
    console.error("Document deletion failed:", error);
    return simpleErrorResponse("Noe gikk galt ved sletting av dokumentet.", 500);
  }
}
