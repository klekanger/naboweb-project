import type { TypeBlogPostSkeleton } from '@/types/contentful-types';
import * as contentful from 'contentful';
import Image from 'next/image';
import Link from 'next/link';

async function getArticleGridData() {
  const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  });

  const data =
    await client.withoutUnresolvableLinks.getEntries<TypeBlogPostSkeleton>({
      content_type: 'blogPost',
      limit: 4,
      // @ts-expect-error
      'fields.privatePost': false,
    });

  return data;
}

export default async function ArticleGrid() {
  const articles = await getArticleGridData();

  return (
    <section className="container mt-32 grid gap-16 px-1 md:grid-cols-2">
      {articles.items.map((article) => {
        const { url } = article.fields.featuredImage?.fields.file || {};

        if (!url) {
          console.error(`Missing featured image for article ${article.sys.id}`);
          return null;
        }

        return (
          <article>
            <div
              key={article.sys.id}
              className="relative aspect-[16/10] overflow-hidden rounded-md "
            >
              <Link href={`/blog/${article.fields.slug}`} passHref>
                <Image
                  src={`https:${url}`}
                  sizes="50vw"
                  fill
                  style={{
                    objectFit: 'cover',
                  }}
                  alt="sdfs"
                  className="rounded-md duration-75 transition hover:scale-105"
                />
              </Link>
            </div>
            <h2 className="my-4 duration-75 transition hover:text-brand-black/70">
              <Link href={`/blog/${article.fields.slug}`}>
                {article.fields.title}
              </Link>
            </h2>
            <p>
              {article.fields.excerpt.length > 130
                ? article.fields.excerpt.slice(0, 147).padEnd(150, '.')
                : article.fields.excerpt}
            </p>
            <Link href={`/blog/${article.fields.slug}`}>Les mer »</Link>
          </article>
        );
      })}
    </section>
  );
}
