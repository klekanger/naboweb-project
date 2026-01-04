import Link from "next/link";

/**
 * Pagination buttons for navigating between pages of blog posts
 * @param pageNumber The current page number
 * @param totalPages The total number of pages
 * @param url The URL of the current page - with or without trailing/leading slash
 */
export default function Pagination({
  pageNumber,
  totalPages,
  url,
}: {
  pageNumber: number;
  totalPages: number;
  url: string;
}) {
  if (!url) {
    return null;
  }

  const urlWithSlash = `/${url.replace(/^\//, "").replace(/\/$/, "")}/`; // Add slash before and after url if missing

  return (
    <nav
      aria-label="Navigasjon mellom blogginnlegg"
      className="m-auto my-8 flex justify-center font-bold text-brand-black"
    >
      <ul className="flex justify-between">
        {pageNumber > 1 && (
          <li className="mr-2 rounded-xl bg-brand-primary px-8 py-2 shadow-md">
            <Link href={`${urlWithSlash}${pageNumber - 1}`} className="">
              ← Forrige side
            </Link>
          </li>
        )}
        {pageNumber < totalPages && (
          <li className="ml-2 rounded-xl bg-brand-primary px-8 py-2 shadow-md">
            <Link href={`${urlWithSlash}${pageNumber + 1}`} className="">
              Neste side →
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
