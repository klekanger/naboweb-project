import BackButton from "@/components/BackButton";
import DocumentsManager from "@/components/admin/DocumentsManager";
import { client } from "@/sanity/lib/client";
import { allOtherDocumentsAdminQuery } from "@/sanity/lib/queries";

export default async function AdminDocumentsPage() {
  const documents = await client.fetch(allOtherDocumentsAdminQuery);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-semibold mb-2">Diverse dokumenter</h1>
      <p className="text-foreground/60 mb-8">
        Last opp og administrer dokumenter som kan lenkes til fra dokumentmenyen og andre steder.
      </p>

      <DocumentsManager initialDocuments={documents ?? []} />

      <div className="mt-10">
        <BackButton buttonLink="/admin" />
      </div>
    </div>
  );
}
