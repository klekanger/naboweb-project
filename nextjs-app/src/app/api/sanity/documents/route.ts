import {
  getSanityAdminEditorAuth,
  simpleErrorResponse,
  simpleSuccessResponse,
} from "@/app/api/_utils/routeUtils";
import { clientWithWriteAccess } from "@/sanity/lib/client";
import { type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

function revalidateDocs() {
  revalidateTag("fileOtherDocuments", "max");
}

export async function POST(request: NextRequest) {
  const auth = await getSanityAdminEditorAuth();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { title, description, tags, assetId } = await request.json();

  if (!title || !assetId) {
    return simpleErrorResponse("title and assetId are required", 400);
  }

  try {
    const result = await clientWithWriteAccess.create({
      _type: "fileOtherDocuments",
      title,
      description: description ?? "",
      tags: tags ?? [],
      otherDocument: {
        _type: "file",
        asset: { _ref: assetId, _type: "reference" },
      },
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

  const { _id, title, description, tags, assetId } = await request.json();

  if (!_id) {
    return simpleErrorResponse("_id is required", 400);
  }

  const patch: Record<string, unknown> = { title, description, tags };

  if (assetId) {
    patch.otherDocument = {
      _type: "file",
      asset: { _ref: assetId, _type: "reference" },
    };
  }

  try {
    await clientWithWriteAccess.patch(_id).set(patch).commit();
    revalidateDocs();
    return simpleSuccessResponse();
  } catch (error) {
    console.error("Document update failed:", error);
    return simpleErrorResponse("Noe gikk galt ved oppdatering av dokumentet.", 500);
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
    revalidateDocs();
    return simpleSuccessResponse();
  } catch (error) {
    console.error("Document deletion failed:", error);
    return simpleErrorResponse("Noe gikk galt ved sletting av dokumentet.", 500);
  }
}
