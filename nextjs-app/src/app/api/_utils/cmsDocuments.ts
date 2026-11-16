// Shared checks for the editor/admin CMS routes under /api/sanity. Every
// client-supplied id is validated as a plain published document id and bound
// to the expected _type before the write token touches it.

import { clientWithWriteAccess } from "@/sanity/lib/client";
import {
  CMS_DOCUMENT_FILE_ASSETS_QUERY,
  CMS_DOCUMENT_REVISION_QUERY,
  COUNT_REFERENCES_QUERY,
} from "@/sanity/lib/queries";
import { simpleErrorResponse } from "@/app/api/_utils/routeUtils";
import { IMAGE_ASSET_ID_PATTERN } from "@/app/api/_utils/messageInput";
import type { NextResponse } from "next/server";

/**
 * A published document id: no dots, so drafts.* and versions.* ids are
 * rejected, and always a string, so it can never become a query selector.
 */
const DOCUMENT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const FILE_ASSET_ID_PATTERN = /^file-[A-Za-z0-9]+-[A-Za-z0-9]+$/;
export { IMAGE_ASSET_ID_PATTERN };

export const isDocumentId = (v: unknown): v is string =>
  typeof v === "string" && DOCUMENT_ID_PATTERN.test(v);

export const isFileAssetId = (v: unknown): v is string =>
  typeof v === "string" && FILE_ASSET_ID_PATTERN.test(v);

export const isImageAssetId = (v: unknown): v is string =>
  typeof v === "string" && IMAGE_ASSET_ID_PATTERN.test(v);

export function isBoundedString(v: unknown, max: number): v is string {
  return typeof v === "string" && v.length <= max;
}

export function isStringArray(
  v: unknown,
  { maxItems, maxLength }: { maxItems: number; maxLength: number },
): v is string[] {
  return (
    Array.isArray(v) &&
    v.length <= maxItems &&
    v.every((s) => isBoundedString(s, maxLength))
  );
}

export async function readJsonObject(
  request: Request,
): Promise<Record<string, unknown> | null> {
  const body = await request.json().catch(() => null);
  return body && typeof body === "object" && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : null;
}

type CmsDocument = { _id: string; _rev: string };

type CmsDocumentResult =
  | { doc: CmsDocument; errorResponse?: never }
  | { doc?: never; errorResponse: NextResponse };

/**
 * Loads the published document with this id only if it has the expected
 * _type. Use the returned _rev to guard the following write.
 */
export async function getCmsDocument(
  type: string,
  id: unknown,
): Promise<CmsDocumentResult> {
  if (!isDocumentId(id)) {
    return { errorResponse: simpleErrorResponse("Ugyldig _id", 400) };
  }

  const doc = await clientWithWriteAccess.fetch(
    CMS_DOCUMENT_REVISION_QUERY,
    { type, id },
    { perspective: "published" },
  );

  if (!doc) {
    return { errorResponse: simpleErrorResponse("Fant ikke dokumentet", 404) };
  }

  return { doc };
}

// Params are server-controlled: the type is a route constant and the id and
// revision come from getCmsDocument.
const DELETE_AT_REVISION = `*[
  _type == $type
  && _id == $id
  && _rev == $rev
]`;

/**
 * Deletes the published document only if it still has the checked type and
 * revision, then removes any Studio draft so publishing it cannot restore the
 * document. Returns false if nothing matched (changed in the meantime).
 *
 * With `deleteFileAssets`, the uploaded files are deleted too, so their
 * cdn.sanity.io URLs stop working. A file still referenced by another
 * document is kept.
 */
export async function deleteCmsDocument(
  type: string,
  doc: CmsDocument,
  { deleteFileAssets = false }: { deleteFileAssets?: boolean } = {},
) {
  const assetIds = deleteFileAssets
    ? ((
        await clientWithWriteAccess.fetch(
          CMS_DOCUMENT_FILE_ASSETS_QUERY,
          { type, id: doc._id },
          { perspective: "published" },
        )
      )?.assetIds ?? [])
    : [];

  const result = await clientWithWriteAccess.delete({
    query: DELETE_AT_REVISION,
    params: { type, id: doc._id, rev: doc._rev },
  });

  if (!result.results?.length) {
    return false;
  }

  await clientWithWriteAccess.delete(`drafts.${doc._id}`);
  await deleteUnreferencedFileAssets(assetIds);
  return true;
}

/**
 * Deletes file assets that nothing references any more. Failures are logged,
 * not thrown: the document itself is already gone at this point.
 */
async function deleteUnreferencedFileAssets(assetIds: (string | null)[]) {
  for (const assetId of new Set(assetIds)) {
    if (!isFileAssetId(assetId)) continue;
    try {
      const references = await clientWithWriteAccess.fetch(
        COUNT_REFERENCES_QUERY,
        { id: assetId },
      );
      if (references === 0) {
        await clientWithWriteAccess.delete(assetId);
      }
    } catch (error) {
      console.error(`Could not delete file asset ${assetId}:`, error);
    }
  }
}

export const CMS_CONFLICT_MESSAGE =
  "Dokumentet ble endret av noen andre i mellomtiden. Last inn siden og prøv igjen.";
