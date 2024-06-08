import AlertUser from "@/components/AlertUser";
import BlogPostList from "@/components/BlogPostList";
import DocumentBox from "@/components/DocumentBox";
import InfoBox from "@/components/InfoBox";
import Pagination from "@/components/Pagination";
import {
  getBlogPostCollection,
  getBlogPostRoutes,
  getDocumentBoxFields,
} from "@/lib/api";
import { BlogPostItemProps, UserWithRoles } from "@/types/types";
import { currentUser } from "@clerk/nextjs/server";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  params: { page: number | undefined };
};

const POSTS_PER_PAGE = 5;

export const metadata = {
  title: "Boligsameiet Gartnerihagen",
  description: "Informasjon for beboere",
  openGraph: {
    type: "website",
    title: "Boligsameiet Gartnerihagen",
    description: "Informasjon for beboere",
    locale: "nb_NO",
    siteName: "Boligsameiet Gartnerihagen",
  },
};

//
// Generate all possible routes
//
export async function generateStaticParams() {
  const data = await getBlogPostRoutes({ isPrivate: true });
  const { total } = data || {};

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const blogPages = Array.from({ length: totalPages }, (_, i) => ({
    page: `${i + 1}`,
  }));

  return blogPages;
}

export default async function Page({ params }: Props) {
  const pageNumber = Number(params.page);

  if (Number.isNaN(pageNumber)) {
    return (
      <>
        <p>Det er ingen blogginnlegg å vise.</p>
      </>
    );
  }

  const user: UserWithRoles | null = await currentUser();

  const haveAccess =
    user?.publicMetadata?.roles && Array.isArray(user.publicMetadata.roles)
      ? user.publicMetadata.roles.includes("user")
      : false;

  if (!haveAccess) {
    return (
      <div className="container flex justify-center">
        <AlertUser
          alertTitle="Du har ikke tilgang"
          alertMessage={`
            På denne siden vil du finne nyttig informasjon fra styret,
            som vedtekter, referater, klippelister og mye mer.
            Ta kontakt med styret for å få tilgang.
          `}
        />
      </div>
    );
  }

  const serviceMenuFields = await getDocumentBoxFields();
  const {
    data: { serviceMenu },
  } = serviceMenuFields;

  const posts = await getBlogPostCollection({
    pageNumber,
    postsPerPage: POSTS_PER_PAGE,
    isPrivate: true,
  });
  const { total, items } = posts || {};

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const numberOfBlogPosts = items.length;

  if (pageNumber > totalPages || pageNumber < 1) {
    redirect("/informasjon/1");
  }

  if (numberOfBlogPosts === 0) {
    return (
      <>
        <h1>Siste blogginnlegg</h1>
        <p>Det er ingen blogginnlegg å vise.</p>
      </>
    );
  }

  const postItems: BlogPostItemProps[] = posts.items.map((post) => ({
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
      <div className="mb-16 rounded-3xl border border-dashed border-brand-black border-opacity-60 p-4 pt-8 dark:border-brand-white">
        <p className="pl-1 prose">
          {user ? (
            <>
              <span>
                <b>Du er innlogget som: </b>
              </span>
              {`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
            </>
          ) : (
            <span>
              <RefreshCw className="animate-spin text-brand-default" />
            </span>
          )}
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 pt-4 pb-8 pl-1 font-semibold prose">
          <Link
            className="animate duration-100 hover:text-brand-black/70"
            href="/min-side"
          >
            Gå til Min side »
          </Link>
        </div>
        <DocumentBox documentBoxLinks={serviceMenu} />
      </div>
      {pageNumber === 1 && (
        <InfoBox
          title="Informasjon fra styret"
          message="På denne siden finner du nyttig informasjon fra styret. Ta kontakt hvis
        det er noe du savner, eller har tilbakemeldinger."
        />
      )}
      <BlogPostList posts={postItems} className="mt-8 md:mt-32" />
      <Pagination
        totalPages={totalPages}
        pageNumber={pageNumber}
        url="/informasjon/"
      />
      <p className="pb-4 text-center">
        side {`${pageNumber} av ${totalPages}`}
      </p>
    </>
  );
}
