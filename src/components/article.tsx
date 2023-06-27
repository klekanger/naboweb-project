import { formatDate } from '@/lib/format-date';
import { renderRichTextOptions } from '@/lib/render-rich-text-options';
import type { ArticleProps } from '@/types/types';
import {
  documentToReactComponents,
  type Options,
} from '@contentful/rich-text-react-renderer';
import type { Document } from '@contentful/rich-text-types';

export default function Article({
  title,
  bodyText,
  createdAt,
  updatedAt,
  MainImage,
  buttonLink,
}: ArticleProps) {
  // Format the dates shown at the bottom of every article page
  const publishDate: string =
    updatedAt === createdAt
      ? `Publisert: ${formatDate(createdAt)}`
      : `Publisert: ${formatDate(createdAt)} (oppdatert: ${formatDate(
          updatedAt
        )})`;

  return (
    <article>
      <h1>{title}</h1>
      <div>
        {documentToReactComponents(
          bodyText as unknown as Document,
          renderRichTextOptions as Options
        )}
      </div>
      <p>
        <em className="font-extralight">{publishDate}</em>
      </p>
    </article>
  );
}
