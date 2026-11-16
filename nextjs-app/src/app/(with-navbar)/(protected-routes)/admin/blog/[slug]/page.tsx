import BackButton from "@/components/BackButton";
import Pagination from "@/components/Pagination";
import { BLOG_COLLECTION_POSTS_PER_PAGE } from "@/lib/constants";
import { groqSliceRange, totalPagesFromCount } from "@/lib/pagination";
import { formatDate } from "@/lib/format-date";
import { client } from "@/sanity/lib/client";
import { blogPostsAdminPagedQuery, countBlogPosts } from "@/sanity/lib/queries";
import { Lock, PenLine, Plus } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CMS_ROLES, requireRoleOrRedirect } from "@/lib/requireRole";

type BlogAdminPost = {
  _id: string;
  _createdAt: string;
  title: string | null;
  slug: string | null;
  privatePost: boolean | null;
};

type Props = {
  params: Promise<{ slug: string }>;
};

function isAdminBlogListPageSlug(slug: string) {
  return /^\d+$/.test(slug);
}

export default async function AdminBlogPagedPage({ params }: Props) {
  // Check the role here, not only in the layout, and before fetching data.
  await requireRoleOrRedirect(CMS_ROLES);

  const { slug } = await params;

  if (!isAdminBlogListPageSlug(slug)) notFound();

  const pageNumber = Number(slug);
  const total = await countBlogPosts({ allPosts: true });
  const totalPages = totalPagesFromCount(total, BLOG_COLLECTION_POSTS_PER_PAGE);

  if (pageNumber > totalPages || pageNumber < 1) {
    redirect("/admin/blog/1");
  }

  const posts = (await client.fetch(
    blogPostsAdminPagedQuery,
    groqSliceRange(pageNumber, BLOG_COLLECTION_POSTS_PER_PAGE),
  )) as BlogAdminPost[] | null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Blogginnlegg</h1>
          <p className="text-foreground/60 mt-1">
            {total} innlegg totalt
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-brand-secondary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-secondary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nytt innlegg
        </Link>
      </div>

      {!posts?.length ? (
        <div className="text-center py-16 text-foreground/50">
          <PenLine className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>Ingen blogginnlegg ennå.</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <div
                key={post._id}
                className="flex items-start justify-between py-4 gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{post.title}</span>
                    {post.privatePost && (
                      <span className="flex items-center gap-1 text-xs bg-gray-200 text-foreground/60 px-2 py-0.5 rounded-full">
                        <Lock className="h-3 w-3" />
                        Privat
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/50 mt-0.5">
                    {formatDate(post._createdAt)} · /{post.slug}
                  </p>
                </div>
                <Link
                  href={`/admin/blog/${post.slug}/edit`}
                  className="shrink-0 flex items-center gap-1 text-sm text-brand-secondary hover:underline"
                >
                  <PenLine className="h-4 w-4" />
                  Rediger
                </Link>
              </div>
            ))}
          </div>
          <Pagination
            totalPages={totalPages}
            pageNumber={pageNumber}
            url="admin/blog"
          />
          {totalPages > 1 && (
            <p className="pb-4 text-center">
              side {`${pageNumber} av ${totalPages}`}
            </p>
          )}
        </>
      )}

      <div className="mt-10">
        <BackButton buttonLink="/admin" />
      </div>
    </div>
  );
}
