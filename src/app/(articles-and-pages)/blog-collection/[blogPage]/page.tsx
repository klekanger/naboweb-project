import BlogPostList from "@/components/BlogPostList";
import Pagination from "@/components/Pagination";
import { getBlogPostCollection } from "@/lib/api";
import type { BlogPostItemProps } from "@/types/types";
import { redirect } from "next/navigation";

const POSTS_PER_PAGE = 5;

type BlogCollectionParams = {
  params: { blogPage: number | undefined };
};

export const metadata = {
  title: "Boligsameiet Gartnerihagen",
  description: "Siste blogginnlegg",
  openGraph: {
    type: "website",
    title: "Boligsameiet Gartnerihagen",
    description: "Siste blogginnlegg",
    locale: "nb_NO",
    siteName: "Boligsameiet Gartnerihagen",
  },
};

//
// Generate all possible routes
//

export async function generateStaticParams() {
  const data = await getBlogPostCollection({
    pageNumber: 1,
    postsPerPage: POSTS_PER_PAGE,
    isPrivate: false,
  });

  const { total } = data || {};
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return Array.from({ length: totalPages }).map((_, i) => ({
    blogPage: `${i + 1}`,
  }));
}

export default async function Page({ params }: BlogCollectionParams) {
  const pageNumber = Number(params.blogPage);

  if (Number.isNaN(pageNumber)) {
    return (
      <>
        <p>Det er ingen blogginnlegg å vise.</p>
      </>
    );
  }

  const data = await getBlogPostCollection({
    pageNumber,
    postsPerPage: POSTS_PER_PAGE,
    isPrivate: false,
  });
  const { total, items } = data || {};

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const numberOfBlogPosts = items.length;

  if (pageNumber > totalPages || pageNumber < 1) {
    redirect("/blog-collection/1");
  }

  if (numberOfBlogPosts === 0) {
    return (
      <>
        <h1>Siste blogginnlegg</h1>
        <p>Det er ingen blogginnlegg å vise.</p>
      </>
    );
  }

  const postItems: BlogPostItemProps[] = items.map((post) => ({
    sys: {
      id: post.sys.id,
      createdAt: post.sys.firstPublishedAt,
      updatedAt: post.sys.publishedAt,
    },
    fields: {
      privatePost: post.privatePost,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
    },
  }));

  return (
    <>
      <h1>Siste blogg­innlegg</h1>
      <BlogPostList posts={postItems} />
      <Pagination
        totalPages={totalPages}
        pageNumber={pageNumber}
        url={"blog-collection"}
      />
      <p className="pb-4 text-center">
        side {`${pageNumber} av ${totalPages}`}
      </p>
    </>
  );
}
