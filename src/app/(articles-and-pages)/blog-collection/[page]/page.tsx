import BlogPostList from '@/components/BlogPostList';
import Pagination from '@/components/Pagination';
import type { TypeBlogPostSkeleton } from '@/types/contentful-types';
import type { BlogPostItemProps } from '@/types/types';
import * as contentful from 'contentful';
import { redirect } from 'next/navigation';

const POSTS_PER_PAGE = 5;

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

//
// Generate all possible routes
//
export async function generateStaticParams() {
  const posts = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
    // @ts-expect-error
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
        <h1>Siste blogginnlegg</h1>
        <p>Det er ingen blogginnlegg å vise.</p>
      </>
    );
  }

  const posts =
    await client.withoutUnresolvableLinks.getEntries<TypeBlogPostSkeleton>({
      content_type: 'blogPost',
      limit: POSTS_PER_PAGE,
      skip: (pageNumber - 1) * POSTS_PER_PAGE,
      // @ts-expect-error
      'fields.privatePost': false,
    });

  const totalPages = Math.ceil(posts.total / POSTS_PER_PAGE);

  if (pageNumber > totalPages) {
    redirect('/blog-collection/1');
  }

  if (posts.items.length === 0) {
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
      createdAt: post.sys.createdAt,
      updatedAt: post.sys.updatedAt,
    },
    fields: {
      privatePost: post.fields.privatePost,
      title: post.fields.title,
      slug: post.fields.slug,
      excerpt: post.fields.excerpt,
      featuredImage: post.fields
        .featuredImage as BlogPostItemProps['fields']['featuredImage'],
    },
  }));

  return (
    <>
      <h1>Siste blogg­innlegg</h1>
      <BlogPostList posts={postItems} />
      <Pagination totalPages={totalPages} pageNumber={pageNumber} />
      <p className="pb-4 text-center">
        side {`${pageNumber} av ${totalPages}`}
      </p>
    </>
  );
}
