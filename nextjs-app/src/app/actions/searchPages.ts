"use server";

import { CMS_ROLES, getUserWithRole } from "@/lib/requireRole";

import { DOCUMENT_MENU_MIN_SEARCH_CHARS } from "@/lib/document-menu-file-picker";
import { buildTitleSearchPattern } from "@/lib/groq-title-search-pattern";
import { client } from "@/sanity/lib/client";
import { pagesSearchQuery } from "@/sanity/lib/queries";
import type { PagesSearchQueryResult } from "@/types/sanity.types";

const MAX_RESULTS = 50;

export type SearchPagesResult =
  | { success: { pages: PagesSearchQueryResult }; status: 200 }
  | { error: { message: string }; status: 401 | 500 };

export async function searchPages({
  searchTerm,
  limit = 40,
}: {
  searchTerm: string;
  limit?: number;
}): Promise<SearchPagesResult> {
  const user = await getUserWithRole(CMS_ROLES);

  if (!user) {
    return { error: { message: "Unauthorized" }, status: 401 };
  }

  const trimmed = searchTerm.trim().toLowerCase();
  if (trimmed.length < DOCUMENT_MENU_MIN_SEARCH_CHARS) {
    return { success: { pages: [] }, status: 200 };
  }

  const end = Math.min(Math.max(1, Math.floor(limit)), MAX_RESULTS);
  const searchPattern = buildTitleSearchPattern(trimmed);

  try {
    const pages = await client.fetch(pagesSearchQuery, {
      SEARCH_PATTERN: searchPattern,
      END: end,
    });

    return {
      success: { pages: (pages ?? []) as PagesSearchQueryResult },
      status: 200,
    } satisfies SearchPagesResult;
  } catch (error) {
    console.error("searchPages failed:", error);
    return {
      error: { message: "Kunne ikke søke etter sider." },
      status: 500,
    };
  }
}
