import BlogPostList from "@/components/BlogPostList";
import DocumentMenu from "@/components/document-library/DocumentMenu";
import InfoBox from "@/components/InfoBox";
import Pagination from "@/components/Pagination";
import RoleDisplay from "@/components/userAdmin/RoleDisplay";
import { sanityFetch } from "@/sanity/lib/live";
import {
  blogCollectionQuery,
  countBlogPosts,
  documentMenuQuery,
} from "@/sanity/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { Info, Pencil, RefreshCw, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ page: number | undefined }>;
};

const POSTS_PER_PAGE = 20;

//
// Generate all possible routes
//
export async function generateStaticParams() {
  const numberOfBlogPosts = await countBlogPosts({ privatePosts: true });
  const totalPages = Math.ceil(numberOfBlogPosts / POSTS_PER_PAGE);

  return Array.from({ length: totalPages }).map((_, i) => ({
    page: `${i + 1}`,
  }));
}

//
// Information page for logged in users with file downloads and private blog posts
//
export default async function PrivateInfoPage(props: Props) {
  const params = await props.params;
  const user = await currentUser();
  const { firstName, lastName } = user ?? {};
  const roles = (user?.publicMetadata?.roles as string[]) || [];
  const isAdmin = roles.includes("admin") || false;
  const isEditor = roles.includes("editor") || false;

  const pageNumber = Number(params.page);

  if (Number.isNaN(pageNumber)) {
    return (
      <>
        <p>Det er ingen sider å vise.</p>
      </>
    );
  }

  const { data: blogPosts } = await sanityFetch({
    query: blogCollectionQuery,
    params: {
      start: (pageNumber - 1) * POSTS_PER_PAGE,
      end: pageNumber * POSTS_PER_PAGE,
      isPrivate: true,
    },
  });

  // const documentMenu = (await loadDocumentMenu()) ?? [];
  const { data: documentMenu } = await sanityFetch({
    query: documentMenuQuery,
  });

  const total = await countBlogPosts({ privatePosts: true });
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const numberOfBlogPosts = blogPosts.length;

  if (pageNumber > totalPages || pageNumber < 1) {
    redirect("/information/1");
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
      <div className="my-16 rounded-xl border border-dashed border-brand-black/60 p-4 pt-8 dark:border-brand-white/60">
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
              className="animate duration-100 hover:text-brand-black/70 "
              href="/studio/structure/dokumentmeny"
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
        url="/information/"
      />
      {totalPages > 1 && (
        <p className="pb-4 text-center">
          side {`${pageNumber} av ${totalPages}`}
        </p>
      )}
    </>
  );
}

// TODO Søk i alle dokumenter
