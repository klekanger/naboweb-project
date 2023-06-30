import type { TypeBlogPostSkeleton } from '@/types/contentful-types';
import * as contentful from 'contentful';

type Props = {
  searchParams: { page: number | undefined };
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

export default async function Page({ searchParams }: Props) {
  const { page = 0 } = searchParams;

  const posts = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
    limit: 3,
    skip: page * 3,
    'fields.privatePost': false,
  });

  return (
    <>
      <h1>Siste blogg­innlegg</h1>
      <ul>
        {posts.items.map((post) => (
          <li key={post.sys.id}>
            <a href={`/blog/${post.fields.slug}`}>{post.fields.title}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
