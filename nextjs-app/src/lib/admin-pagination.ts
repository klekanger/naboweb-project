import { FILE_LIST_POSTS_PER_PAGE } from "@/lib/constants";
import {
  groqSliceRange,
  pageNumberFromSearchParam,
  totalPagesFromCount,
} from "@/lib/pagination";
import { client } from "@/sanity/lib/client";
import { redirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type SanityQuery = Parameters<typeof client.fetch>[0];

type GetAdminPagedItemsOptions = {
  searchParams: SearchParams;
  countQuery: SanityQuery;
  pagedQuery: SanityQuery;
  basePath: string;
  pageSize?: number;
};

export async function getAdminPagedItems<T>({
  searchParams,
  countQuery,
  pagedQuery,
  basePath,
  pageSize = FILE_LIST_POSTS_PER_PAGE,
}: GetAdminPagedItemsOptions) {
  const params = await searchParams;
  const pageNumber = pageNumberFromSearchParam(params.page);
  const totalItems = await client.fetch<number>(countQuery);
  const totalPages = totalPagesFromCount(totalItems, pageSize);

  if (pageNumber > totalPages) {
    const targetPage =
      totalPages <= 1 ? basePath : `${basePath}?page=${totalPages}`;
    redirect(targetPage);
  }

  const items = await client.fetch<T[]>(
    pagedQuery,
    groqSliceRange(pageNumber, pageSize),
  );

  return {
    items: items ?? [],
    pageNumber,
    totalPages,
  };
}
