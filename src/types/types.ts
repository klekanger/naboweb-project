import type { Asset, EntryFieldTypes, EntryFields } from 'contentful';
import type { TypePageFields } from './contentful-types';

export type ContentImage = {
  title: string;
  url: string;
  description: string;
  width: number;
  height: number;
};

export type ArticleProps = {
  title: string;
  authors?: Array<{
    fields: {
      firstName: string;
      lastName: string;
    };
  }>;
  bodyText: TypePageFields['pageText'];
  firstPublishedAt: EntryFields.Date;
  publishedAt: EntryFields.Date;
  mainImage?: ContentImage;
  buttonLink: string;
};

export type ContentfulFile = {
  sys: {
    id: string;
    firstPublishedAt: `${number}-${number}-${number}T${number}:${number}:${number}Z`;
    publishedAt: `${number}-${number}-${number}T${number}:${number}:${number}Z`;
  };
  title: string;
  description: string;
  contentType: string;
  fileName: string;
  size: number;
  url: string;
};

export type DocumentCollection = {
  data: {
    serviceMenu: {
      menu6FilesCollection: {
        total: number;
        items: ContentfulFile[];
      };
    };
  };
};

export type ReturnTypeForGetBlogPostRoutes = {
  data: {
    blogPostCollection: {
      total: number;
    };
  };
};

export type BlogPostItemProps = {
  sys: {
    id: string;
    createdAt: EntryFields.Date;
    updatedAt: EntryFields.Date;
  };
  fields: {
    privatePost: boolean;
    title: string;
    excerpt: string;
    featuredImage: ContentImage | undefined;
    slug: string;
  };
};

export type BlogPostListProps = {
  sys: {
    id: string;
  };
  posts: BlogPostItemProps[];
};

export type fetchGraphQLReturnTypeForPage = {
  data: {
    page: TypePageFields & {
      sys: {
        id: string;
        publishedAt: EntryFields.Date;
        firstPublishedAt: EntryFields.Date;
      };
    };
  };
};

export type fetchGraphQLReturnTypeForBlogPosts = {
  data: {
    blogPostCollection: {
      total: number;
      items: Array<{
        sys: {
          id: string;
          publishedAt: `${number}-${number}-${number}T${number}:${number}:${number}Z`;
          firstPublishedAt: `${number}-${number}-${number}T${number}:${number}:${number}Z`;
        };
        privatePost: boolean;
        title: string;
        excerpt: string;
        featuredImage?: ContentImage;
        bodyText: EntryFieldTypes.RichText;
        author?: {
          firstName: string;
          lastName: string;
          authorImage?: ContentImage;
        };
        slug: string;
      }>;
    };
  };
};

export type getPageDataReturnTypes = {
  pageTitle: string;
  excerpt?: string;
  pageText: EntryFieldTypes.RichText;
  slug: string;
  id: string;
  pageImage?: ContentImage;
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
