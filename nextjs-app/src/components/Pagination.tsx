import Link from "next/link";

function normalizedPathBase(url: string) {
  return `/${url.replace(/^\//, "").replace(/\/$/, "")}`;
}

function hrefForPathPage(
  base: string,
  targetPage: number,
  useRootUrlForFirstPage: boolean,
) {
  if (targetPage === 1 && useRootUrlForFirstPage) return base;
  return `${base}/${targetPage}`;
}

/**
 * Pagination buttons for navigating between pages of blog posts
 * @param pageNumber The current page number
 * @param totalPages The total number of pages
 * @param url The URL of the current page - with or without trailing/leading slash
 * @param useRootUrlForFirstPage When true, page 1 uses `/base` without `/1` (optional catch-all index).
 */
export default function Pagination({
  pageNumber,
  totalPages,
  url,
  useRootUrlForFirstPage = false,
}: {
  pageNumber: number;
  totalPages: number;
  url: string;
  useRootUrlForFirstPage?: boolean;
}) {
  if (!url) {
    return null;
  }

  const base = normalizedPathBase(url);

  return (
    <nav
      aria-label="Navigasjon mellom blogginnlegg"
      className="m-auto my-8 flex justify-center font-bold text-brand-black"
    >
      <ul className="flex justify-between">
        {pageNumber > 1 && (
          <li className="mr-2 rounded-xl bg-brand-primary px-8 py-2 shadow-md">
            <Link
              href={hrefForPathPage(
                base,
                pageNumber - 1,
                useRootUrlForFirstPage,
              )}
              className=""
            >
              ← Forrige side
            </Link>
          </li>
        )}
        {pageNumber < totalPages && (
          <li className="ml-2 rounded-xl bg-brand-primary px-8 py-2 shadow-md">
            <Link
              href={hrefForPathPage(
                base,
                pageNumber + 1,
                useRootUrlForFirstPage,
              )}
              className=""
            >
              Neste side →
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
