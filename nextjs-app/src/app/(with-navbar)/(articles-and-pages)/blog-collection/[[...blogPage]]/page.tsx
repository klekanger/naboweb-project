import BlogPostList from "@/components/BlogPostList";
import Pagination from "@/components/Pagination";
import {
  BLOG_COLLECTION_POSTS_PER_PAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/constants";
import {
  groqSliceRange,
  pageNumberFromOptionalCatchAll,
  totalPagesFromCount,
} from "@/lib/pagination";
import { sanityFetch } from "@/sanity/lib/live";
import {
  allBlogCollectionQuery,
  blogCollectionQuery,
  countBlogPosts,
} from "@/sanity/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type BlogCollectionParams = {
  params: Promise<{ blogPage: string[] | undefined }>;
};

export async function generateMetadata(
  props: BlogCollectionParams,
): Promise<Metadata> {
  const params = await props.params;
  const pageNumber = pageNumberFromOptionalCatchAll(params.blogPage);
  const canonicalPath =
    pageNumber === 1 || pageNumber === null
      ? "/blog-collection"
      : `/blog-collection/${pageNumber}`;

  return {
    title: SITE_NAME,
    description: "Siste blogginnlegg",
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
    },
    openGraph: {
      type: "website",
      title: SITE_NAME,
      description: "Siste blogginnlegg",
      locale: "nb_NO",
      siteName: SITE_NAME,
      url: `${SITE_URL}${canonicalPath}`,
    },
  };
}

export async function generateStaticParams() {
  const numberOfBlogPosts = await countBlogPosts({ privatePosts: false });
  const totalPages = Math.ceil(
    numberOfBlogPosts / BLOG_COLLECTION_POSTS_PER_PAGE,
  );

  const out: { blogPage: string[] | undefined }[] = [{ blogPage: undefined }];
  for (let i = 2; i <= totalPages; i++) {
    out.push({ blogPage: [`${i}`] });
  }
  return out;
}

async function BlogCollectionContent(props: BlogCollectionParams) {
  const params = await props.params;
  const segments = params.blogPage;

  if (segments?.length === 1 && segments[0] === "1") {
    redirect("/blog-collection");
  }

  const pageNumber = pageNumberFromOptionalCatchAll(segments);

  const user = await currentUser();
  const roles = (user?.publicMetadata?.roles as string[]) || [];
  let isLoggedIn = false;

  if (roles.includes("user")) isLoggedIn = true;

  if (pageNumber === null) {
    return (
      <>
        <p>Det er ingen blogginnlegg å vise.</p>
      </>
    );
  }

  const slice = groqSliceRange(pageNumber, BLOG_COLLECTION_POSTS_PER_PAGE);

  const { data } = await sanityFetch({
    query: isLoggedIn ? allBlogCollectionQuery : blogCollectionQuery,
    params: isLoggedIn
      ? slice
      : {
          ...slice,
          isPrivate: false,
        },
  });

  const total = await countBlogPosts(
    isLoggedIn ? { allPosts: true } : { privatePosts: false },
  );
  const totalPages = totalPagesFromCount(total, BLOG_COLLECTION_POSTS_PER_PAGE);
  const numberOfBlogPosts = data?.length ?? 0;

  if (pageNumber > totalPages || pageNumber < 1) {
    redirect("/blog-collection");
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
      <h1 className="lg:prose-xl pb-8 md:pb-16 font-thin">
        SISTE BLOGGINNLEGG
      </h1>
      {!isLoggedIn && (
        <p className="mb-8 text-brand-dark-danger italic">
          Logg inn for å også se blogginnlegg beregnet kun for beboere.
        </p>
      )}
      <BlogPostList posts={data} />
      <Pagination
        totalPages={totalPages}
        pageNumber={pageNumber}
        url="blog-collection"
        useRootUrlForFirstPage
      />
      {totalPages > 1 && (
        <p className="pb-4 text-center">
          side {`${pageNumber} av ${totalPages}`}
        </p>
      )}
    </section>
  );
}

export default async function BlogCollectionRoute(props: BlogCollectionParams) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BlogCollectionContent {...props} />
    </Suspense>
  );
}
