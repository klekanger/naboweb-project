import Pagination from '@/components/pagination';
import type { TypeBlogPostSkeleton } from '@/types/contentful-types';
import * as contentful from 'contentful';
import Link from 'next/link';
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

//
// Generate all possible routes
//
export async function generateStaticParams() {
  const posts = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
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

  const posts = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
    limit: 3,
    skip: (pageNumber - 1) * POSTS_PER_PAGE,
    /* 'fields.privatePost': false, */
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

  return (
    <>
      <h1>Siste blogg­innlegg - {`${pageNumber}`}</h1>
      <ul>
        {posts.items.map((post) => (
          <li key={post.sys.id}>
            <a href={`/blog/${post.fields.slug}`}>{post.fields.title}</a>
          </li>
        ))}
      </ul>
      <Pagination totalPages={totalPages} pageNumber={pageNumber} />
    </>
  );
}
