"use server";

import { CMS_ROLES, getUserWithRole } from "@/lib/requireRole";
import { DOCUMENT_MENU_MIN_SEARCH_CHARS } from "@/lib/document-menu-file-picker";
import { buildTitleSearchPattern } from "@/lib/groq-title-search-pattern";
import { client } from "@/sanity/lib/client";
import { fileOtherDocumentsSearchQuery } from "@/sanity/lib/queries";

const MAX_RESULTS = 50;

type FileHit = {
  _id: string;
  title: string | null;
  url: string | null;
};

export type SearchFileOtherDocumentsResult =
  | { success: { files: FileHit[] }; status: 200 }
  | { error: { message: string }; status: 400 | 401 | 500 };

export async function searchFileOtherDocuments({
  searchTerm,
  limit = 40,
}: {
  searchTerm: string;
  limit?: number;
}): Promise<SearchFileOtherDocumentsResult> {
  const user = await getUserWithRole(CMS_ROLES);

  if (!user) {
    return { error: { message: "Unauthorized" }, status: 401 };
  }

  const trimmed = searchTerm.trim().toLowerCase();
  if (trimmed.length < DOCUMENT_MENU_MIN_SEARCH_CHARS) {
    return { success: { files: [] }, status: 200 };
  }

  const end = Math.min(Math.max(1, Math.floor(limit)), MAX_RESULTS);
  const searchPattern = buildTitleSearchPattern(trimmed);

  try {
    const files = await client.fetch(fileOtherDocumentsSearchQuery, {
      SEARCH_PATTERN: searchPattern,
      END: end,
    });

    return {
      success: { files: (files ?? []) as FileHit[] },
      status: 200,
    };
  } catch (err) {
    console.error("searchFileOtherDocuments failed:", err);
    return {
      error: { message: "Kunne ikke søke etter filer." },
      status: 500,
    };
  }
}
