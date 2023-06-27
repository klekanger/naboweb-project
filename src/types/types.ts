import type { Asset, EntryFieldTypes, EntryFields } from 'contentful';

export type ArticleProps = {
  title: string;
  bodyText: EntryFieldTypes.RichText;
  createdAt: EntryFields.Date;
  updatedAt: EntryFields.Date;
  MainImage: EntryFieldTypes.AssetLink;
  buttonLink: string;
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
