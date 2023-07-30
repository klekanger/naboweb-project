import { formatDate } from '@/lib/format-date';
import { renderRichTextOptions } from '@/lib/render-rich-text-options';
import type { ArticleProps } from '@/types/types';
import {
  documentToReactComponents,
  type Options,
} from '@contentful/rich-text-react-renderer';
import type { Document } from '@contentful/rich-text-types';
import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from './ui/button';

export default function Article({
  title,
  authors,
  bodyText,
  createdAt,
  updatedAt,
  mainImage,
  buttonLink,
}: ArticleProps) {
  const publishDate: string =
    updatedAt === createdAt
      ? `Publisert: ${formatDate(createdAt)}`
      : `Publisert: ${formatDate(createdAt)} (oppdatert: ${formatDate(
          updatedAt
        )})`;

  let blurDataURL: string;

  if (mainImage && 'src' in mainImage) {
    blurDataURL = mainImage.src + '?w=10&h=10&fit=fill';
  } else {
    blurDataURL =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOsWDvtPwAGHAK8KBlg/wAAAABJRU5ErkJggg==';
  }

  return (
    <article>
      <h1>{title}</h1>
      {mainImage && (
        <div className="relative aspect-video">
          <Image
            src={mainImage.src}
            alt={mainImage.description}
            sizes="100vw"
            priority
            fill
            blurDataURL={blurDataURL}
            placeholder="blur"
            className="rounded-md object-cover shadow-md"
          />
        </div>
      )}
      <div>
        {documentToReactComponents(
          bodyText as unknown as Document,
          renderRichTextOptions as Options
        )}
      </div>

      <section className="py-8">
        <em className="text-sm">{publishDate}</em>
        <br />
        {authors && (
          <em className="text-sm">
            Av{' '}
            {authors.map((author, index) => {
              const isLastAuthor = index === authors.length - 1;
              return (
                <span
                  className="text-sm"
                  key={`${author.fields.firstName}-${author.fields.lastName}`}
                >
                  {author.fields.firstName} {author.fields.lastName}
                  {!isLastAuthor && ', '}
                </span>
              );
            })}
          </em>
        )}
      </section>
      <Link
        href={buttonLink}
        className={buttonVariants({
          variant: 'secondary',
        })}
      >
        Gå tilbake
      </Link>
    </article>
  );
}
