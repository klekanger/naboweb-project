import { formatDate } from '@/lib/formatDate';
import { renderRichTextOptions } from '@/lib/renderRichTextOptions';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Entry, EntryFieldTypes, EntryFields } from 'contentful';

interface ArticleProps {
  title: string;
  bodyText: EntryFieldTypes.RichText;
  createdAt: EntryFields.Date;
  updatedAt: EntryFields.Date;
  MainImage: EntryFieldTypes.AssetLink;
  buttonLink: string;
}

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
    createdAt !== updatedAt
      ? `Publisert: ${formatDate(createdAt)} (oppdatert: ${formatDate(
          updatedAt
        )})`
      : `Publisert: ${formatDate(createdAt)}`;

  return (
    <article>
      <h1>{title}</h1>
      <div>{documentToReactComponents(bodyText, renderRichTextOptions)}</div>
      <p>
        <em className="font-extralight">{publishDate}</em>
      </p>
    </article>
  );
}
