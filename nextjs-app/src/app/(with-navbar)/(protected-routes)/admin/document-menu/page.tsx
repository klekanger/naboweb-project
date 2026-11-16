import { CMS_ROLES, requireRoleOrRedirect } from "@/lib/requireRole";
import DocumentMenuEditor from "@/components/admin/DocumentMenuEditor";
import AdminEditPageShell from "@/components/admin/AdminEditPageShell";
import { DOCUMENT_MENU_BROWSE_FILE_LIMIT } from "@/lib/document-menu-file-picker";
import { client } from "@/sanity/lib/client";
import {
  documentMenuAdminQuery,
  fileOtherDocumentsBrowseQuery,
} from "@/sanity/lib/queries";
import type { FileOtherDocumentsBrowseQueryResult } from "@/types/sanity.types";

type MenuFileProjection = {
  _id: string;
  title: string | null;
  url: string | null;
} | null;

function uniqueSeedFilesFromMenu(menu: {
  file1: MenuFileProjection;
  file2: MenuFileProjection;
  file3: MenuFileProjection;
  file4: MenuFileProjection;
}): { _id: string; title: string | null; url: string | null }[] {
  const map = new Map<
    string,
    { _id: string; title: string | null; url: string | null }
  >();
  for (const f of [menu.file1, menu.file2, menu.file3, menu.file4]) {
    if (f?._id) map.set(f._id, { _id: f._id, title: f.title, url: f.url });
  }
  return [...map.values()];
}

export default async function DocumentMenuPage() {
  // Check the role here, not only in the layout, and before fetching data.
  await requireRoleOrRedirect(CMS_ROLES);

  const [menuData, browseFileOptions] = await Promise.all([
    client.fetch(documentMenuAdminQuery),
    client.fetch(fileOtherDocumentsBrowseQuery, {
      END: DOCUMENT_MENU_BROWSE_FILE_LIMIT,
    }),
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

  const seedFileOptions = uniqueSeedFilesFromMenu({
    file1: menuData.file1,
    file2: menuData.file2,
    file3: menuData.file3,
    file4: menuData.file4,
  });

  return (
    <AdminEditPageShell
      title="Rediger dokumentmeny"
      backHref="/admin"
      containerClassName="max-w-2xl"
      description={
        <>
          Her kan du endre tekst og tilknyttede filer for de fire første
          snarveiknappene på Informasjon-siden. Listen viser de første{" "}
          {DOCUMENT_MENU_BROWSE_FILE_LIMIT} filene (alfabetisk); skriv minst to
          tegn for å søke blant alle filer.
        </>
      }
    >
      <DocumentMenuEditor
        documentMenuId={menuData._id}
        initialButtons={initialButtons}
        seedFileOptions={seedFileOptions}
        browseFileOptions={(browseFileOptions ?? []).map(
          (f: FileOtherDocumentsBrowseQueryResult[number]) => ({
            _id: f._id,
            title: f.title,
            url: f.url ?? null,
          }),
        )}
      />
    </AdminEditPageShell>
  );
}
