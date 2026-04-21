import AdminEditPageShell from "@/components/admin/AdminEditPageShell";
import DocumentsManager from "@/components/admin/DocumentsManager";
import { client } from "@/sanity/lib/client";
import { allOtherDocumentsAdminQuery } from "@/sanity/lib/queries";

export default async function AdminDocumentsPage() {
  const documents = await client.fetch(allOtherDocumentsAdminQuery);

  return (
    <AdminEditPageShell
      title="Diverse dokumenter"
      backHref="/admin"
      description="Last opp og administrer dokumenter som kan lenkes til fra dokumentmenyen og andre steder."
    >
      <DocumentsManager initialDocuments={documents ?? []} />
    </AdminEditPageShell>
  );
}
