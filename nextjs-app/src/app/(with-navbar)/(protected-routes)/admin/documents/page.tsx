import AdminEditPageShell from "@/components/admin/AdminEditPageShell";
import DocumentsManager from "@/components/admin/DocumentsManager";
import { getAdminPagedItems } from "@/lib/admin-pagination";
import {
  countOtherDocumentsAdminQuery,
  otherDocumentsAdminPagedQuery,
} from "@/sanity/lib/queries";
import type { ComponentProps } from "react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type DocumentItem = ComponentProps<typeof DocumentsManager>["initialDocuments"][number];

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { items: documents, pageNumber, totalPages } =
    await getAdminPagedItems<DocumentItem>({
      searchParams,
      countQuery: countOtherDocumentsAdminQuery,
      pagedQuery: otherDocumentsAdminPagedQuery,
      basePath: "/admin/documents",
    });

  return (
    <AdminEditPageShell
      title="Diverse dokumenter"
      backHref="/admin"
      description="Last opp og administrer dokumenter som kan lenkes til fra dokumentmenyen og andre steder."
    >
      <DocumentsManager
        initialDocuments={documents}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    </AdminEditPageShell>
  );
}
