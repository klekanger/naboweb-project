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

const DOC_TYPE = "fileMeetingMinutes";
const MAX_TITLE = 200;
const MAX_TEXT = 2_000;
const MAX_FILES = 20;
const TAG_LIMITS = { maxItems: 20, maxLength: 50 };
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function revalidateMinutes() {
  revalidateTag(DOC_TYPE, "max");
}

type MinutesFields = {
  title?: string;
  description?: string;
  meetingDate?: string | null;
  meetingPlace?: string;
  tags?: string[];
  assetIds?: string[];
};

/** Validates the fields that are present; returns an error message or the fields. */
function parseFields(body: Record<string, unknown>): MinutesFields | string {
  const { title, description, meetingDate, meetingPlace, tags, assetIds } = body;
  const fields: MinutesFields = {};

  if (title !== undefined) {
    if (!isBoundedString(title, MAX_TITLE) || !title.trim()) return "Ugyldig tittel";
    fields.title = title;
  }
  if (description !== undefined && description !== null) {
    if (!isBoundedString(description, MAX_TEXT)) return "Ugyldig beskrivelse";
    fields.description = description;
  }
  if (meetingDate !== undefined) {
    if (meetingDate !== null && !(typeof meetingDate === "string" && DATE_PATTERN.test(meetingDate))) {
      return "Ugyldig møtedato";
    }
    fields.meetingDate = meetingDate;
  }
  if (meetingPlace !== undefined && meetingPlace !== null) {
    if (!isBoundedString(meetingPlace, MAX_TITLE)) return "Ugyldig møtested";
    fields.meetingPlace = meetingPlace;
  }
  if (tags !== undefined && tags !== null) {
    if (!isStringArray(tags, TAG_LIMITS)) return "Ugyldige stikkord";
    fields.tags = tags;
  }
  if (assetIds !== undefined && assetIds !== null) {
    if (
      !Array.isArray(assetIds) ||
      assetIds.length > MAX_FILES ||
      !assetIds.every(isFileAssetId)
    ) {
      return "Ugyldige filer";
    }
    fields.assetIds = assetIds;
  }
  return fields;
}

const meetingDocuments = (assetIds: string[]) =>
  assetIds.map((assetId, i) => ({
    _type: "file",
    _key: `doc-${i}-${assetId}`,
    asset: { _ref: assetId, _type: "reference" },
  }));

export async function POST(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const body = await readJsonObject(request);
  if (!body) return simpleErrorResponse("Ugyldig forespørsel", 400);

  const fields = parseFields(body);
  if (typeof fields === "string") return simpleErrorResponse(fields, 400);
  if (!fields.title || !fields.assetIds || fields.assetIds.length === 0) {
    return simpleErrorResponse("title and at least one file are required", 400);
  }

  try {
    const result = await clientWithWriteAccess.create({
      _type: DOC_TYPE,
      title: fields.title,
      description: fields.description ?? "",
      meetingDate: fields.meetingDate ?? null,
      meetingPlace: fields.meetingPlace ?? "",
      tags: fields.tags ?? [],
      meetingDocuments: meetingDocuments(fields.assetIds),
    });

    revalidateMinutes();
    return simpleSuccessResponse({ _id: result._id });
  } catch (error) {
    console.error("Meeting minutes creation failed:", error);
    return simpleErrorResponse("Noe gikk galt ved oppretting av referatet.", 500);
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
  if (fields.meetingDate !== undefined) patch.meetingDate = fields.meetingDate;
  if (fields.meetingPlace !== undefined) patch.meetingPlace = fields.meetingPlace;
  if (fields.tags !== undefined) patch.tags = fields.tags;
  if (fields.assetIds && fields.assetIds.length > 0) {
    patch.meetingDocuments = meetingDocuments(fields.assetIds);
  }

  try {
    await clientWithWriteAccess
      .patch(doc._id)
      .ifRevisionId(doc._rev)
      .set(patch)
      .commit();
    revalidateMinutes();
    return simpleSuccessResponse();
  } catch (error) {
    if (isRevisionConflict(error)) {
      return simpleErrorResponse(CMS_CONFLICT_MESSAGE, 409);
    }
    console.error("Meeting minutes update failed:", error);
    return simpleErrorResponse("Noe gikk galt ved oppdatering av referatet.", 500);
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
    revalidateMinutes();
    return simpleSuccessResponse();
  } catch (error) {
    console.error("Meeting minutes deletion failed:", error);
    return simpleErrorResponse("Noe gikk galt ved sletting av referatet.", 500);
  }
}
