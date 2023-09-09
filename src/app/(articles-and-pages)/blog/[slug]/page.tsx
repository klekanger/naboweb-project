import Article from '@/components/Article';
import { parseContentfulImage } from '@/lib/parse-contentful-image';
import type { TypeBlogPostSkeleton } from '@/types/contentful-types';
import type { ArticleProps } from '@/types/types';
import * as contentful from 'contentful';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { slug: string };
};

const client = contentful.createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

//
// Generate all possible routes
//
export async function generateStaticParams() {
  const posts = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
  });

  return posts.items.map((post) => ({
    slug: post.fields?.slug ?? '',
  }));
}

//
// Generate metadata for the current page
//
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  const post =
    await client.withoutUnresolvableLinks.getEntries<TypeBlogPostSkeleton>({
      content_type: 'blogPost',
      limit: 1,
      'fields.slug': slug,
    });

  // Optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images ?? [];

  const ogImage = post?.items[0]?.fields?.featuredImage?.fields.file?.url ?? '';

  return {
    title: post?.items[0]?.fields.title,
    description: post?.items[0]?.fields.excerpt,
    openGraph: {
      images: [`https://${ogImage}?w=1200&h=630&fit=fill`, ...previousImages],
      type: 'article',
      title: post?.items[0]?.fields.title ?? '',
      description: post?.items[0]?.fields.excerpt ?? '',
      locale: 'nb_NO',
      siteName: 'Boligsameiet Gartnerihagen',
      url: `https://gartnerihagen-askim.no/blog/${slug}`,
    },
  };
}

//
// Generate the blog page
//
export default async function Page({ params }: Props) {
  const post =
    await client.withoutUnresolvableLinks.getEntries<TypeBlogPostSkeleton>({
      content_type: 'blogPost',
      limit: 1,
      'fields.slug': params.slug,
    });

  if (!post.items[0]) {
    return (
      <>
        <h1>404</h1>
        <p>Det finnes ingen blogginnlegg her...</p>
      </>
    );
  }

  const { title, author, featuredImage } = post.items[0]?.fields ?? {};
  const bodyText = post.items[0]?.fields
    .bodyText as unknown as contentful.EntryFieldTypes.RichText;
  const { createdAt, updatedAt } = post.items[0]?.sys ?? {};

  const parsedImage = parseContentfulImage(featuredImage);

  if (!title || !bodyText || !createdAt || !updatedAt || !parsedImage) {
    throw new Error('Missing data');
  }

  return (
    <div>
      <Article
        title={title}
        bodyText={bodyText}
        createdAt={createdAt}
        updatedAt={updatedAt}
        mainImage={parsedImage}
        authors={author as ArticleProps['authors']}
        buttonLink="/blog"
      />
    </div>
  );
}
