import AdminEditPageShell from "@/components/admin/AdminEditPageShell";
import WebsiteSettingsEditor from "@/components/admin/WebsiteSettingsEditor";
import { client } from "@/sanity/lib/client";
import {
  pagesBrowseQuery,
  settingsAdminQuery,
} from "@/sanity/lib/queries";
import type { PagesBrowseQueryResult } from "@/types/sanity.types";
import { connection } from "next/server";

const PAGES_BROWSE_LIMIT = 100;

export default async function WebsiteSettingsPage() {
  await connection();

  const [settings, browsePages] = await Promise.all([
    client.fetch(settingsAdminQuery),
    client.fetch(pagesBrowseQuery, { END: PAGES_BROWSE_LIMIT }),
  ]);

  if (!settings) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <p>Ingen innstillinger funnet. Opprett Innstillinger i Sanity Studio først.</p>
      </div>
    );
  }

  return (
    <AdminEditPageShell
      title="Nettstedinnstillinger"
      backHref="/admin"
      containerClassName="max-w-3xl"
      description="Her kan du oppdatere firmainformasjon, SEO-felter og de to redigerbare menyelementene."
    >
      <WebsiteSettingsEditor
        initialSettings={settings}
        browsePages={(browsePages ?? []).map(
          (page: PagesBrowseQueryResult[number]) => ({
            _id: page._id,
            title: page.title,
            slug: page.slug,
          }),
        )}
      />
    </AdminEditPageShell>
  );
}
