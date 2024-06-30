import { urlForImage } from "@/sanity/lib/utils";
import { BLOG_BY_SLUG_QUERYResult } from "@/types/sanity.types";
import { toPlainText } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import type { Image as SanityImage } from "sanity";

export type BlogPostItemProps = {
  post: BLOG_BY_SLUG_QUERYResult;
};

export default function BlogPostItem({ post }: BlogPostItemProps) {
  const { title, excerpt, featuredImage, slug, privatePost } = post ?? {};

  let imageUrl: string;
  let imageAlt = "";

  imageUrl =
    urlForImage(featuredImage as SanityImage)
      ?.height(1600)
      .width(900)
      .fit("crop")
      .url() ?? "";
  imageAlt = featuredImage?.alt ?? "";

  if (!title || !excerpt || !featuredImage || !slug) {
    console.warn("[blog-post.item.tsx] Missing data in post prop.");
    return null;
  }

  const urlToPost = privatePost ? `/informasjon/post/${slug}` : `/blog/${slug}`;

  return (
    <article key={post?._id}>
      <div className="grid-cols-12 gap-2 pb-2 md:grid md:pb-8 lg:gap-8">
        <div className="relative order-last overflow-hidden rounded-3xl md:col-span-5 lg:col-span-6">
          <Link href={urlToPost} passHref>
            <Image
              className="aspect-[16/10] rounded-3xl object-cover duration-200 transition hover:scale-[102%]"
              src={imageUrl}
              alt={imageAlt}
              width={1600}
              height={900}
              placeholder="blur"
              blurDataURL={featuredImage?.lqip ?? ""}
              sizes="(min-width: 1024px) 50vw,100vw"
            />
          </Link>
        </div>

        <div className="md:col-span-7 md:pr-8 lg:col-span-6 prose lg:prose-xl">
          <Link href={urlToPost} passHref>
            <h2 className="text-2xl mt-0 lg:mt-0">{title}</h2>
          </Link>
          <p>
            {excerpt && `${toPlainText(excerpt).slice(0, 500)}`}
            <Link href={urlToPost} className="pt-4 no-underline md:block">
              Les&nbsp;mer »
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}
