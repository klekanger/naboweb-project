import BlogEditor from "@/components/admin/BlogEditorClient";
import BackButton from "@/components/BackButton";
import { client } from "@/sanity/lib/client";
import { allAuthorsQuery } from "@/sanity/lib/queries";

export default async function NewBlogPostPage() {
  const authors = await client.fetch(allAuthorsQuery);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-semibold mb-2">Nytt blogginnlegg</h1>
      <p className="text-foreground/60 mb-8">Fyll ut feltene nedenfor og publiser.</p>

      <BlogEditor mode="create" authors={authors ?? []} />

      <div className="mt-10">
        <BackButton buttonLink="/admin/blog" />
      </div>
    </div>
  );
}
