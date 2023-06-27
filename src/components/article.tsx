import { formatDate } from '@/lib/format-date';
import { renderRichTextOptions } from '@/lib/render-rich-text-options';
import {
  documentToReactComponents,
  type Options,
} from '@contentful/rich-text-react-renderer';
import type { Document } from '@contentful/rich-text-types';
import type { EntryFields, EntryFieldTypes } from 'contentful';

type ArticleProps = {
  title: string;
  bodyText: EntryFieldTypes.RichText;
  createdAt: EntryFields.Date;
  updatedAt: EntryFields.Date;
  MainImage: EntryFieldTypes.AssetLink;
  buttonLink: string;
};

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
