import BlogEditor from "@/components/admin/BlogEditorClient";
import BackButton from "@/components/BackButton";
import { CMS_ROLES, requireRoleOrRedirect } from "@/lib/requireRole";
import { getAuthorPortraitUrlForClerkUser } from "@/sanity/lib/get-author-portrait-url";

export default async function NewBlogPostPage() {
  // Check the role here, not only in the layout.
  const user = await requireRoleOrRedirect(CMS_ROLES);
  const roles = (user?.publicMetadata?.roles as string[]) ?? [];
  const currentAuthorPortraitUrl = await getAuthorPortraitUrlForClerkUser(
    user?.id ?? "",
    user?.primaryEmailAddress?.emailAddress ?? "",
  );
  const authorDisplayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Ukjent bruker";

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-semibold mb-2">Nytt blogginnlegg</h1>
      <p className="text-foreground/60 mb-8">Fyll ut feltene nedenfor og publiser.</p>

      <BlogEditor
        mode="create"
        currentAuthorId={user?.id ?? ""}
        authorDisplayName={authorDisplayName}
        currentUserEmail={user?.primaryEmailAddress?.emailAddress ?? ""}
        currentAuthorPortraitUrl={currentAuthorPortraitUrl}
        isAdmin={roles.includes("admin")}
      />

      <div className="mt-10">
        <BackButton buttonLink="/admin/blog" />
      </div>
    </div>
  );
}
