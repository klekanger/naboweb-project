"use client";

import { urlForImage } from "@/sanity/lib/utils";
import { type ShowcaseQueryResult } from "@/types/sanity.types";
import { Spacer } from "@heroui/react";
import { motion } from "motion/react";
import { toPlainText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";

export default function Showcase({
  content,
}: {
  content: ShowcaseQueryResult;
}) {
  if (!content) {
    console.error("Missing articles from sanity");
    return null;
  }

  const { showcaseBlogposts, showcaseTitle = "nyheter" } = content ?? {};

  if (!showcaseBlogposts) {
    console.error("No articles is passed to Showcase component");
    return null;
  }

  return (
    <motion.section
      className="py-8 sm:py-16 max-w-7xl m-auto"
      initial={{ opacity: 0, y: 75 }}
      transition={{ duration: 1, ease: "easeOut" }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
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
              <div className="relative overflow-hidden rounded-xl">
                <Link href={`/blog/${article?.slug?.current ?? ""}`} passHref>
                  <Image
                    src={url}
                    width={1600}
                    height={1000}
                    sizes=" (min-width: 640px) 50vw, 100vw"
                    alt={article?.title ?? ""}
                    placeholder="blur"
                    blurDataURL={article.featuredImage?.lqip ?? ""}
                    className="rounded-xl py-0 my-0"
                  />
                </Link>
              </div>
              <h2 className="my-4 ">
                <Link
                  href={`/blog/${article?.slug?.current ?? ""}`}
                  className="no-underline duration-75 transition hover:text-brand-black/70"
                >
                  {article.title}
                </Link>
              </h2>
              <p>{toPlainText(article.excerpt ?? [])}</p>
              <Link
                href={`/blog/${article?.slug?.current ?? ""}`}
                className="no-underline duration-75 transition hover:text-brand-black/70"
              >
                Les mer »
              </Link>
            </article>
          );
        })}
      </div>
      <Spacer />
      <div className="prose mt-8">
        <Link
          href="/blog-collection"
          className="text-brand-secondary dark:text-brand-dark-secondary"
        >
          <em>Gå til nyhetsarkivet »</em>
        </Link>
      </div>
    </motion.section>
  );
}
