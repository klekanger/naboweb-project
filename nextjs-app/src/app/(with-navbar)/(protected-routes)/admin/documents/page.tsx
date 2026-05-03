import AdminEditPageShell from "@/components/admin/AdminEditPageShell";
import DocumentsManager from "@/components/admin/DocumentsManager";
import { FILE_LIST_POSTS_PER_PAGE } from "@/lib/constants";
import { groqSliceRange, totalPagesFromCount } from "@/lib/pagination";
import { client } from "@/sanity/lib/client";
import {
  countOtherDocumentsAdminQuery,
  otherDocumentsAdminPagedQuery,
} from "@/sanity/lib/queries";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function pageNumberFromSearchParam(value: string | string[] | undefined): number {
  if (!value) return 1;
  if (Array.isArray(value)) return 1;
  if (!/^\d+$/.test(value)) return 1;
  const pageNumber = Number(value);
  if (pageNumber < 1) return 1;
  return pageNumber;
}

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const pageNumber = pageNumberFromSearchParam(params.page);
  const totalDocuments = await client.fetch(countOtherDocumentsAdminQuery);
  const totalPages = totalPagesFromCount(
    totalDocuments,
    FILE_LIST_POSTS_PER_PAGE,
  );

  if (pageNumber > totalPages) {
    const targetPage =
      totalPages <= 1 ? "/admin/documents" : `/admin/documents?page=${totalPages}`;
    redirect(targetPage);
  }

  const documents = await client.fetch(
    otherDocumentsAdminPagedQuery,
    groqSliceRange(pageNumber, FILE_LIST_POSTS_PER_PAGE),
  );

  return (
    <AdminEditPageShell
      title="Diverse dokumenter"
      backHref="/admin"
      description="Last opp og administrer dokumenter som kan lenkes til fra dokumentmenyen og andre steder."
    >
      <DocumentsManager
        initialDocuments={documents ?? []}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    </AdminEditPageShell>
  );
}
