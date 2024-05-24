import BackButton from "@/components/BackButton";
import { formatDate } from "@/lib/format-date";
import { renderRichTextOptions } from "@/lib/render-rich-text-options";
import type { ArticleProps } from "@/types/types";
import {
  type Options,
  documentToReactComponents,
} from "@contentful/rich-text-react-renderer";

import Image from "next/image";
import Link from "next/link";

export default function Article({
  title,
  authors,
  bodyText,
  firstPublishedAt: createdAt,
  publishedAt: updatedAt,
  mainImage,
  buttonLink,
}: ArticleProps) {
  // Put the rich text JSON and the linked entries into separate constants
  // that should be passed into documentToReactComponents
  const { json: richTextJson } = bodyText;
  const { links } = bodyText;

  const publishDate: string =
    updatedAt === createdAt
      ? `Publisert: ${formatDate(createdAt)}`
      : `Publisert: ${formatDate(createdAt)} (oppdatert: ${formatDate(
          updatedAt,
        )})`;

  let blurDataURL: string;

  if (mainImage && "src" in mainImage) {
    blurDataURL = `${mainImage.url}?w=10&h=10&fit=fill`;
  } else {
    blurDataURL =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOsWDvtPwAGHAK8KBlg/wAAAABJRU5ErkJggg==";
  }

  return (
    <article className="prose lg:prose-xl">
      <h1>{title}</h1>
      {mainImage && (
        <div className="image relative mb-8 aspect-video md:mb-16">
          <Image
            src={mainImage.url}
            alt={mainImage.description}
            sizes="100vw"
            priority
            fill
            blurDataURL={blurDataURL}
            placeholder="blur"
            className="rounded-3xl object-cover shadow-md"
          />
        </div>
      )}
      <div>
        {documentToReactComponents(
          richTextJson,
          renderRichTextOptions(links) as Options,
        )}
      </div>

      <section className="py-8">
        <em className="text-sm">{publishDate}</em>
        <br />
        {authors && (
          <em className="text-sm">
            Av{" "}
            {authors.map((author, index) => {
              const isLastAuthor = index === authors.length - 1;
              return (
                <span
                  className="text-sm"
                  key={`${author.fields.firstName}-${author.fields.lastName}`}
                >
                  {author.fields.firstName} {author.fields.lastName}
                  {!isLastAuthor && ", "}
                </span>
              );
            })}
          </em>
        )}
      </section>

      <BackButton buttonLink={buttonLink} />
    </article>
  );
}
