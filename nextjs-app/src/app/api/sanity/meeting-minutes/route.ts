import {
  getSanityAdminEditorAuth,
  simpleErrorResponse,
  simpleSuccessResponse,
} from "@/app/api/_utils/routeUtils";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

function revalidateMinutes() {
  revalidateTag("fileMeetingMinutes", "max");
}

export async function POST(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { title, description, meetingDate, meetingPlace, tags, assetIds } =
    await request.json();

  if (!title || !assetIds || assetIds.length === 0) {
    return simpleErrorResponse("title and at least one file are required", 400);
  }

  try {
    const result = await clientWithWriteAccess.create({
      _type: "fileMeetingMinutes",
      title,
      description: description ?? "",
      meetingDate: meetingDate ?? null,
      meetingPlace: meetingPlace ?? "",
      tags: tags ?? [],
      meetingDocuments: assetIds.map((assetId: string, i: number) => ({
        _type: "file",
        _key: `doc-${i}-${assetId}`,
        asset: { _ref: assetId, _type: "reference" },
      })),
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

  const { _id, title, description, meetingDate, meetingPlace, tags, assetIds } =
    await request.json();

  if (!_id) {
    return simpleErrorResponse("_id is required", 400);
  }

  const patch: Record<string, unknown> = {
    title,
    description,
    meetingDate,
    meetingPlace,
    tags,
  };

  if (assetIds && assetIds.length > 0) {
    patch.meetingDocuments = assetIds.map((assetId: string, i: number) => ({
      _type: "file",
      _key: `doc-${i}-${assetId}`,
      asset: { _ref: assetId, _type: "reference" },
    }));
  }

  try {
    await clientWithWriteAccess.patch(_id).set(patch).commit();
    revalidateMinutes();
    return simpleSuccessResponse();
  } catch (error) {
    console.error("Meeting minutes update failed:", error);
    return simpleErrorResponse("Noe gikk galt ved oppdatering av referatet.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { _id } = await request.json();

  if (!_id) {
    return simpleErrorResponse("_id is required", 400);
  }

  try {
    await clientWithWriteAccess.delete(_id);
    revalidateMinutes();
    return simpleSuccessResponse();
  } catch (error) {
    console.error("Meeting minutes deletion failed:", error);
    return simpleErrorResponse("Noe gikk galt ved sletting av referatet.", 500);
  }
}
