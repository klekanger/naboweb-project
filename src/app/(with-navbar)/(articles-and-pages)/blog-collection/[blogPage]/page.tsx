import BlogPostList from "@/app/components/BlogPostList";
import Pagination from "@/app/components/Pagination";
import { countBlogPosts } from "@/sanity/lib/queries";
import { sanityFetch } from "@/sanity/lib/live";
import { blogCollectionQuery } from "@/sanity/lib/queries";
import { redirect } from "next/navigation";

const POSTS_PER_PAGE = 5;

type BlogCollectionParams = {
  params: Promise<{ blogPage: number | undefined }>;
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
export default async function BlogCollectionRoute(props: BlogCollectionParams) {
  const params = await props.params;
  const pageNumber = Number(params.blogPage);

  if (Number.isNaN(pageNumber)) {
    return (
      <>
        <p>Det er ingen blogginnlegg å vise.</p>
      </>
    );
  }

  const { data } = await sanityFetch({
    query: blogCollectionQuery,
    params: {
      start: (pageNumber - 1) * POSTS_PER_PAGE,
      end: pageNumber * POSTS_PER_PAGE,
      isPrivate: false,
    },
  });

  const total = await countBlogPosts({ privatePosts: false });
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const numberOfBlogPosts = data?.length ?? 0;

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
    <section className="">
      <h1 className="lg:prose-xl pb-16 font-thin">SISTE BLOGGINNLEGG</h1>
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
    </section>
  );
}
