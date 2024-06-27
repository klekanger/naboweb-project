import { urlForImage } from "@/sanity/lib/utils";
import { toPlainText } from "next-sanity";
import { Spacer } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";
import { ShowcaseProps } from "@/types/types";

export default function Showcase({ content }: { content: ShowcaseProps }) {
  if (!content || !content?.data) {
    console.error("Missing articles from sanity");
    return null;
  }

  const {
    showcaseBlogposts,
    showcaseTitle = "nyheter",
    _id,
  } = content.data ?? {};

  if (!showcaseBlogposts) {
    console.error("No articles is passed to Showcase component");
    return null;
  }

  return (
    <section className="py-8 sm:py-16 max-w-8xl m-auto">
      <h2 className="prose text-3xl mb-8 font-semibold">{showcaseTitle}</h2>
      <div className="grid gap-16 px-1 md:grid-cols-2">
        {showcaseBlogposts.map((article) => {
          const url = urlForImage(article.featuredImage as any)
            ?.width(1600)
            .height(1000)
            .url();

          if (!url) {
            console.error(
              `Missing featured image for article with id #${article._id}`,
            );
            return null;
          }

          return (
            <article key={article?._id} className="prose">
              <div className="relative overflow-hidden rounded-3xl">
                <Link href={`/blog/${article?.slug?.current ?? ""}`} passHref>
                  <Image
                    src={url}
                    width={1600}
                    height={1000}
                    sizes=" (min-width: 640px) 50vw, 100vw"
                    alt={article?.title ?? ""}
                    placeholder="blur"
                    blurDataURL={article.featuredImage?.lqip ?? ""}
                    className="rounded-3xl py-0 my-0"
                  />
                </Link>
              </div>
              <h2 className="my-4 duration-75 transition hover:text-brand-black/70">
                <Link href={`/blog/${article?.slug?.current ?? ""}`}>
                  {article.title}
                </Link>
              </h2>
              <p>{toPlainText(article.excerpt ?? [])}</p>
              <Link href={`/blog/${article?.slug?.current ?? ""}`}>
                Les mer »
              </Link>
            </article>
          );
        })}
      </div>
      <Spacer />
      <div className="prose mt-8">
        <Link
          href="http://localhost:3000/blog-collection"
          className="text-brand-secondary dark:text-brand-dark-secondary"
        >
          <em>Gå til nyhetsarkivet »</em>
        </Link>
      </div>
    </section>
  );
}
