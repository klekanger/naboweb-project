import DocumentCollectionPage from "@/components/document-library/DocumentCollectionPage";
import DocumentTable from "@/components/document-library/DocumentTable";
import { sanityFetch } from "@/sanity/lib/live";
import NotLoggedIn from "@/components/NotLoggedIn";
import { getUserWithRole, RESIDENT_ROLES } from "@/lib/requireRole";
import { otherDocumentsQuery } from "@/sanity/lib/queries";

export default async function Page() {
  // Check the role here, not only in the layout, and before fetching data.
  if (!(await getUserWithRole(RESIDENT_ROLES))) return <NotLoggedIn />;

  const { data: documents } = await sanityFetch({
    query: otherDocumentsQuery,
  });

  return (
    <DocumentCollectionPage
      title="Diverse dokumenter"
      documents={documents}
      headingClassName="text-center text-2xl md:text-left md:text-4xl prose lg:prose-xl mb-8"
    >
      <DocumentTable documents={documents ?? []} />
    </DocumentCollectionPage>
  );
}
