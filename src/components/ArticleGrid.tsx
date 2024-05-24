import { TypeBlogPostFields } from "@/types/contentful-types";
import { BlogPostItemProps, ContentImage } from "@/types/types";
import Image from "next/image";
import Link from "next/link";

export default function ArticleGrid({
  articles,
}: { articles: BlogPostItemProps[] }) {
  if (!articles) {
    console.error("No articles is passed to ArticleGrid");
    return null;
  }

  return (
    <section className="py-8 sm:py-16 max-w-8xl m-auto">
      <h2 className="prose text-3xl mb-8">Nyheter</h2>
      <div className="grid gap-16 px-1 md:grid-cols-2">
        {articles.map((article) => {
          const { url } = article.fields.featuredImage?.fields.file ?? {};
          const { width, height } =
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
      </div>
      <Link
        href="http://localhost:3000/blog-collection"
        className="text-brand-secondary dark:text-brand-dark-secondary"
      >
        <em>Gå til nyhetsarkivet »</em>
      </Link>
    </section>
  );
}
