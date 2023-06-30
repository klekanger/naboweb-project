import type { Asset, EntryFieldTypes, EntryFields } from 'contentful';

export type ContentImage = {
  src: string;
  description: string;
  width: number;
  height: number;
};

export type ArticleProps = {
  title: string;
  authors?: string[];
  bodyText: EntryFieldTypes.RichText;
  createdAt: EntryFields.Date;
  updatedAt: EntryFields.Date;
  mainImage: ContentImage | undefined;
  buttonLink: string;
};

export type getPageDataReturnTypes = {
  pageTitle: string;
  excerpt?: string;
  pageText: EntryFieldTypes.RichText;
  slug: string;
  id: string;
  pageImage?: EntryFieldTypes.AssetLink;
  createdAt: EntryFields.Date;
  updatedAt: EntryFields.Date;
};

export type EmbeddedAsset = {
  title: string;
  description: string;
  file: {
    url: string;
    details: {
      size: number;
      image: {
        width: number;
        height: number;
      };
    };
    fileName: string;
    contentType: string;
  };
};

export type HeroWideProps = {
  pageTitle: string;
  excerpt: string;
  pageImage: Asset<'WITHOUT_UNRESOLVABLE_LINKS'> | undefined;
};
