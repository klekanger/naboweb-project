import Article from '@/components/article';
import { TypeBlogPostSkeleton } from '@/types/contentful-types';
import * as contentful from 'contentful';
import { Metadata, ResolvingMetadata } from 'next';

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
    slug: post.fields.slug,
  }));
}

//
// Generate metadata for the current page
//
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const slug = params.slug;

  // fetch data
  const post =
    await client.withoutUnresolvableLinks.getEntries<TypeBlogPostSkeleton>({
      content_type: 'blogPost',
      limit: 1,
      'fields.slug': slug,
      'fields.privatePost': false,
    });

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = post?.items[0]?.fields?.featuredImage?.fields.file?.url || '';

  return {
    title: post?.items[0]?.fields.title,
    description: post?.items[0]?.fields.excerpt,
    openGraph: {
      images: [`https://${ogImage}?w=1200&h=630&fit=fill`, ...previousImages],
      type: 'article',
      title: post?.items[0]?.fields.title,
      description: post?.items[0]?.fields.excerpt,
      locale: 'nb_NO',
      siteName: 'Boligsameiet Gartnerihagen',
      url: `https://gartnerihagen-askim.no/blog/${slug}`,
    },
  };
}

//
// Generate the blog page
//
export default async function BlogPage({ params }: Props) {
  const post = await client.getEntries<TypeBlogPostSkeleton>({
    content_type: 'blogPost',
    limit: 1,
    'fields.slug': params.slug,
    'fields.privatePost': false,
  });

  const { title, bodyText, author, featuredImage } = post?.items[0]?.fields;

  // console.log(post?.items[0]?.fields);

  return (
    <div>
      <h1>{title}</h1>
      {/*     <Article
        title={title}
        bodyText={bodyText}
        createdAt={createdAt}
        updatedAt={updatedAt}
        MainImage={pageImage}
        buttonLink="/"
      /> */}
    </div>
  );
}
