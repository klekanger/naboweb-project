import BlogPostList from "@/components/BlogPostList";
import DocumentMenu from "@/components/document-library/DocumentMenu";
import InfoBox from "@/components/InfoBox";
import Pagination from "@/components/Pagination";
import RoleDisplay from "@/components/userAdmin/RoleDisplay";
import { INFORMATION_PRIVATE_BLOG_POSTS_PER_PAGE } from "@/lib/constants";
import {
  groqSliceRange,
  pageNumberFromOptionalCatchAll,
  totalPagesFromCount,
} from "@/lib/pagination";
import { sanityFetch } from "@/sanity/lib/live";
import {
  blogCollectionQuery,
  countBlogPosts,
  documentMenuQuery,
} from "@/sanity/lib/queries";
import NotLoggedIn from "@/components/NotLoggedIn";
import { getUserWithRole, RESIDENT_ROLES } from "@/lib/requireRole";
import { Info, Pencil, RefreshCw, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

type Props = {
  params: Promise<{ page: string[] | undefined }>;
};

async function PrivateInfoContent(props: Props) {
  // Check the role here, not only in the layout, and before fetching data.
  const user = await getUserWithRole(RESIDENT_ROLES);
  if (!user) return <NotLoggedIn />;

  const params = await props.params;
  const segments = params.page;

  if (segments?.length === 1 && segments[0] === "1") {
    redirect("/information");
  }

  const pageNumber = pageNumberFromOptionalCatchAll(segments);

  const { firstName, lastName } = user;
  const roles = (user?.publicMetadata?.roles as string[]) || [];
  const isAdmin = roles.includes("admin") || false;
  const isEditor = roles.includes("editor") || false;

  if (pageNumber === null) {
    return (
      <>
        <p>Det er ingen sider å vise.</p>
      </>
    );
  }

  const slice = groqSliceRange(pageNumber, INFORMATION_PRIVATE_BLOG_POSTS_PER_PAGE);

  const { data: blogPosts } = await sanityFetch({
    query: blogCollectionQuery,
    params: {
      ...slice,
      isPrivate: true,
    },
  });

  const { data: documentMenu } = await sanityFetch({
    query: documentMenuQuery,
  });

  const total = await countBlogPosts({ privatePosts: true });
  const totalPages = totalPagesFromCount(
    total,
    INFORMATION_PRIVATE_BLOG_POSTS_PER_PAGE,
  );
  const numberOfBlogPosts = blogPosts.length;

  if (pageNumber > totalPages || pageNumber < 1) {
    redirect("/information");
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
      {pageNumber === 1 && (
        <InfoBox
          title="Informasjon fra styret"
          message="På denne siden finner du nyttig informasjon fra styret. Ta kontakt hvis
        det er noe du savner, eller du har tilbakemeldinger."
          icon={<Info />}
        />
      )}
      <div className="my-16 rounded-xl border border-dashed border-brand-black/60 p-4 pt-8">
        <div className="pl-1">
          {user ? (
            <div className="flex gap-4">
              <span>
                <b>Innlogget som: </b>
              </span>
              {`${firstName ?? ""} ${lastName ?? ""}`}
              <RoleDisplay roles={roles} />
            </div>
          ) : (
            <span>
              <RefreshCw className="animate-spin text-brand-default" />
            </span>
          )}
        </div>

        <div className="pt-4 pb-2 pl-1 font-semibold">
          <Link
            className="animate duration-100 hover:text-brand-black/70"
            href="/min-side"
          >
            <span className="flex gap-2">
              <User className="text-brand-secondary" />
              Gå til Min side
            </span>
          </Link>
        </div>
        {(isAdmin || isEditor) && (
          <div className="pl-1 font-semibold">
            <Link
              className="animate duration-100 hover:text-brand-black/70"
              href="/admin/document-menu"
            >
              <span className="flex gap-2">
                <Pencil className="text-brand-secondary" />
                Rediger denne dokumentmenyen
              </span>
            </Link>
          </div>
        )}
        <div className="h-8" />
        <DocumentMenu content={documentMenu} />
      </div>

      <h2 className="lg:prose-xl font-thin ">
        SISTE NYHETSARTIKLER FRA STYRET
      </h2>
      <BlogPostList posts={blogPosts} className="mt-8 md:mt-32" />
      <Pagination
        totalPages={totalPages}
        pageNumber={pageNumber}
        url="information"
        useRootUrlForFirstPage
      />
      {totalPages > 1 && (
        <p className="pb-4 text-center">
          side {`${pageNumber} av ${totalPages}`}
        </p>
      )}
    </>
  );
}

export default async function PrivateInfoPage(props: Props) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PrivateInfoContent {...props} />
    </Suspense>
  );
}

// TODO Søk i alle dokumenter
