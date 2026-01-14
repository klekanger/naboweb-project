import BackButton from "@/components/BackButton";
import ShareButtons from "@/components/ShareButtons";
import { formatDate } from "@/lib/format-date";
import { urlForImage } from "@/sanity/lib/utils";
import { CustomPortableText } from "@/lib/CustomPortableText";
import Image from "next/image";
import { ArticleProps } from "@/types/types";

export default function Article({
  title,
  authors,
  bodyText,
  createdAt,
  updatedAt,
  mainImage,
  buttonLink,
}: ArticleProps) {
  let publishDate = "";
  if (createdAt && updatedAt) {
    publishDate =
      updatedAt === createdAt
        ? `Publisert: ${formatDate(createdAt)}`
        : `Publisert: ${formatDate(createdAt)} (oppdatert: ${formatDate(
            updatedAt,
          )})`;
  }

  return (
    <article>
      <h1 className="prose lg:prose-xl text-4xl lg:text-5xl mb-8 font-semibold ">
        {title}
      </h1>
      {mainImage && (
        <div className="relative mb-16 md:max-w-4xl">
          <Image
            src={urlForImage(mainImage)?.dpr(2).url() ?? ""}
            alt={(mainImage?.alt as string) ?? ""}
            sizes="100vw"
            width={1600}
            height={1000}
            blurDataURL={mainImage.lqip ?? undefined}
            placeholder="blur"
            priority
            className="rounded-xl w-full h-full mb-0 pb-0"
          />

          {(mainImage?.caption as string) && (
            <div className="absolute bottom-0 left-0 right-0 rounded-b-xl text-sm py-4 !pl-4 pr-16 bg-slate-200/70">
              <em>{mainImage?.caption as string}</em>
            </div>
          )}
        </div>
      )}

      <div className="prose lg:prose-xl">
        <CustomPortableText
          value={bodyText}
          paragraphClasses="prose lg:prose-xl"
        />
      </div>
      <ShareButtons title={title ?? ""} />
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
                  key={`${author.firstName}-${author.lastName}`}
                >
                  {author.firstName} {author.lastName}
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

// TODO fix types for mainImage (or ArticleProps)
