import AlertUser from '@/components/AlertUser';
import Article from '@/components/Article';
import { getBlogPostWithSlug, getSlugsForBlogPost } from '@/lib/api';
import type { ArticleProps } from '@/types/types';
import type { Metadata, ResolvingMetadata } from 'next';

type BlogParams = {
  params: { slug: string };
};

//
// Generate all possible routes
//
export async function generateStaticParams() {
  const posts = await getSlugsForBlogPost({ isPrivate: true });

  return posts.data.blogPostCollection.items.map((post) => ({
    slug: post.slug,
  }));
}

//
// Generate metadata for the current page
//
export async function generateMetadata(
  { params }: BlogParams,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;

  const data = await getBlogPostWithSlug({
    slug: params.slug,
    isPrivate: true,
  });
  const post = data.items[0]; // We're fetching only one post

  if (!post) {
    return {};
  }

  const { title, excerpt, author, featuredImage } = post;

  // Optionally access and extend (rather than replace) parent metadata
  const parentResult = await parent;
  const previousImages = parentResult.openGraph?.images ?? [];

  const ogImage = featuredImage?.url ?? '';

  return {
    title: title,
    description: excerpt,
    openGraph: {
      images: [`${ogImage}?w=1200&h=630&fit=fill`, ...previousImages],
      type: 'article',
      title: title ?? '',
      description: excerpt ?? '',
      locale: 'nb_NO',
      siteName: 'Boligsameiet Gartnerihagen',
      url: `https://gartnerihagen-askim.no/informasjon/post/${slug}`,
    },
  };
}

//
// Generate the blog page
//
export default async function Page({ params }: BlogParams) {
  const data = await getBlogPostWithSlug({
    slug: params.slug,
    isPrivate: true,
  });
  const post = data.items[0]; // We're fetching only one post

  if (!post) {
    return (
      <>
        <AlertUser
          alertTitle="404"
          alertMessage="Det finnes ingen blogginnlegg her..."
        />
      </>
    );
  }

  const {
    title,
    bodyText,
    author,
    featuredImage,
    sys: { firstPublishedAt, publishedAt },
  } = post;

  if (!title || !bodyText) {
    throw new Error('Missing data');
  }

  return (
    <div>
      <Article
        title={title}
        bodyText={bodyText}
        firstPublishedAt={firstPublishedAt}
        publishedAt={publishedAt}
        mainImage={featuredImage}
        authors={author as ArticleProps['authors']}
        buttonLink="/blog"
      />
    </div>
  );
}

// TODO Generate only public posts
// private posts should be on another route under (protected-routes)
