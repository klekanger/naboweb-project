import type { TypeBlogPostSkeleton } from "@/types/contentful-types";
import * as contentful from "contentful";
import Image from "next/image";
import Link from "next/link";

async function getArticleGridData() {
  const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  });

  const data =
    await client.withoutUnresolvableLinks.getEntries<TypeBlogPostSkeleton>({
      content_type: "blogPost",
      limit: 4,
      // @ts-expect-error: Ignore type mismatch on this one.
      "fields.privatePost": false,
    });

  return data;
}

export default async function ArticleGrid() {
  const articles = await getArticleGridData();

  return (
    <>
      <h2 className="mt-16 pb-4 p-0 font-semibold">Nyheter</h2>
      <section className="grid gap-16 px-1 md:grid-cols-2">
        {articles.items.map((article) => {
          // @ts-expect-error Ignore type mismatch
          const { url } = article.fields.featuredImage?.fields.file ?? {};
          const { width, height } =
            // @ts-expect-error Ignore type mismatch
            article.fields.featuredImage?.fields.file?.details?.image ?? {};

          if (!url) {
            console.error(
              `Missing featured image for article ${article.sys.id}`,
            );
            return null;
          }

          return (
            <article key={article.sys.id}>
              <div className="relative overflow-hidden rounded-3xl">
                <Link href={`/blog/${article.fields.slug}`} passHref>
                  <Image
                    src={`https:${url}`}
                    width={width}
                    height={height}
                    sizes="(min-width: 768px) 40vw, (min-width: 1024px) 50vw,100vw"
                    alt={article.fields.title}
                    className="aspect-[16/10] rounded-3xl object-cover"
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
                  ? article.fields.excerpt.slice(0, 147).padEnd(150, ".")
                  : article.fields.excerpt}
              </p>
              <Link href={`/blog/${article.fields.slug}`}>Les mer »</Link>
            </article>
          );
        })}
        <Link
          href="http://localhost:3000/blog-collection"
          className="text-brand-secondary dark:text-brand-dark-secondary"
        >
          <em>Gå til nyhetsarkivet »</em>
        </Link>
      </section>
    </>
  );
}
