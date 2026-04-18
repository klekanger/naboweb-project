import DocumentMenuEditor from "@/components/admin/DocumentMenuEditor";
import BackButton from "@/components/BackButton";
import { client } from "@/sanity/lib/client";
import {
  allFileDocumentsQuery,
  documentMenuAdminQuery,
} from "@/sanity/lib/queries";

export default async function DocumentMenuPage() {
  const [menuData, fileOptions] = await Promise.all([
    client.fetch(documentMenuAdminQuery),
    client.fetch(allFileDocumentsQuery),
  ]);

  if (!menuData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <p>Ingen dokumentmeny funnet. Opprett én i Sanity Studio først.</p>
      </div>
    );
  }

  const initialButtons: [
    { text: string; fileId: string; fileName: string },
    { text: string; fileId: string; fileName: string },
    { text: string; fileId: string; fileName: string },
    { text: string; fileId: string; fileName: string },
  ] = [
    {
      text: menuData.button1Text ?? "",
      fileId: menuData.file1?._id ?? "",
      fileName: menuData.file1?.title ?? "",
    },
    {
      text: menuData.button2Text ?? "",
      fileId: menuData.file2?._id ?? "",
      fileName: menuData.file2?.title ?? "",
    },
    {
      text: menuData.button3Text ?? "",
      fileId: menuData.file3?._id ?? "",
      fileName: menuData.file3?.title ?? "",
    },
    {
      text: menuData.button4Text ?? "",
      fileId: menuData.file4?._id ?? "",
      fileName: menuData.file4?.title ?? "",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-semibold mb-2">Rediger dokumentmeny</h1>
      <p className="text-foreground/60 mb-8">
        Her kan du endre tekst og tilknyttede filer for de fire
        snarveiknappene på Informasjon-siden.
      </p>

      <DocumentMenuEditor
        documentMenuId={menuData._id}
        initialButtons={initialButtons}
        fileOptions={(fileOptions ?? []).map(
          (f: { _id: string; title: string | null; url: string | null }) => ({
            _id: f._id,
            title: f.title,
            url: f.url ?? null,
          }),
        )}
      />

      <div className="mt-10">
        <BackButton buttonLink="/admin" />
      </div>
    </div>
  );
}
