import BlogPostList from '@/components/BlogPostList';
import Pagination from '@/components/Pagination';
import { getBlogPostCollection } from '@/lib/api';
import type { TypeBlogPostSkeleton } from '@/types/contentful-types';
import type { BlogPostItemProps } from '@/types/types';
import * as contentful from 'contentful';
import { redirect } from 'next/navigation';

const POSTS_PER_PAGE = 3;

type Props = {
  params: { page: number | undefined };
};

const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

export const metadata = {
  title: 'Boligsameiet Gartnerihagen',
  description: 'Siste blogginnlegg',
  openGraph: {
    type: 'website',
    title: 'Boligsameiet Gartnerihagen',
    description: 'Siste blogginnlegg',
    locale: 'nb_NO',
    siteName: 'Boligsameiet Gartnerihagen',
  },
};

type CustomEntriesQueries = TypeBlogPostSkeleton & {
  'fields.privatePost': boolean;
};

//
// Generate all possible routes
//
export async function generateStaticParams() {
  const posts = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
    // @ts-ignore
    'fields.privatePost': false,
  });

  const totalPages = Math.ceil(posts.total / POSTS_PER_PAGE);

  return Array.from({ length: totalPages }, (_, i) => ({
    page: `${i + 1}`,
  }));
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

  const data = await getBlogPostCollection({
    pageNumber,
    postsPerPage: POSTS_PER_PAGE,
    isPrivate: false,
  });
  const { total, items } = data || {};

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const numberOfBlogPosts = items.length;

  if (pageNumber > totalPages) {
    redirect('/blog-collection/1');
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
        url={`blog-collection`}
      />
      <p className="pb-4 text-center">
        side {`${pageNumber} av ${totalPages}`}
      </p>
    </>
  );
}
