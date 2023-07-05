import Link from 'next/link';

/**
 * Pagination buttons for navigating between pages of blog posts
 * @param pageNumber The current page number
 * @param totalPages The total number of pages
 */
export default function Pagination({
  pageNumber,
  totalPages,
}: {
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <nav
      aria-label="Navigasjon mellom blogginnlegg"
      className="m-auto my-8 flex justify-center font-bold text-brand-black"
    >
      <ul className="flex justify-between">
        {pageNumber > 1 && (
          <li className="mr-2 rounded-md bg-brand-primaryButton px-8 py-2 shadow-md">
            <Link href={`/blog-collection/${pageNumber - 1}`}>
              ← Forrige side
            </Link>
          </li>
        )}
        {pageNumber < totalPages && (
          <li className="ml-2 rounded-md bg-brand-primaryButton px-8 py-2 shadow-md">
            <Link href={`/blog-collection/${pageNumber + 1}`}>
              Neste side →
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
