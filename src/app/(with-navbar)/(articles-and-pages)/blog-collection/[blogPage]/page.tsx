import BlogPostList from "@/components/BlogPostList";
import Pagination from "@/components/Pagination";
import { countBlogPosts, fetchBlogCollection } from "@/sanity/lib/queries";
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
  const numberOfBlogPosts = await countBlogPosts({ privatePosts: false });
  const totalPages = Math.ceil(numberOfBlogPosts / POSTS_PER_PAGE);

  return Array.from({ length: totalPages }).map((_, i) => ({
    blogPage: `${i + 1}`,
  }));
}

//
// Generate static page for each route with blogposts
//
export default async function BlogCollectionRoute({
  params,
}: BlogCollectionParams) {
  const pageNumber = Number(params.blogPage);

  if (Number.isNaN(pageNumber)) {
    return (
      <>
        <p>Det er ingen blogginnlegg å vise.</p>
      </>
    );
  }

  const data = await fetchBlogCollection({
    pageNumber: pageNumber - 1,
    postsPerPage: POSTS_PER_PAGE,
    isPrivate: false,
  });

  const total = await countBlogPosts({ privatePosts: false });

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const numberOfBlogPosts = data.length;

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

  return (
    <>
      <h1 className="prose lg:prose-xl pb-16 font-thin">SISTE BLOGGINNLEGG</h1>
      <BlogPostList posts={data} />

      <Pagination
        totalPages={totalPages}
        pageNumber={pageNumber}
        url={"blog-collection"}
      />
      {totalPages > 1 && (
        <p className="pb-4 text-center">
          side {`${pageNumber} av ${totalPages}`}
        </p>
      )}
    </>
  );
}
