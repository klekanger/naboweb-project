/**
 * This file is generated automatically by `cf-content-types-generator-app`.
 * https://github.com/marcolink/cf-content-types-generator-app
 */

import type { Document } from "@contentful/rich-text-types";
import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from "contentful";
import { ContentImage } from "./types";

export interface TypeAuthorsFields {
  firstName: EntryFieldTypes.Symbol;
  lastName: EntryFieldTypes.Symbol;
  authorImage?: ContentImage;
}

export type TypeAuthorsSkeleton = EntrySkeletonType<
  TypeAuthorsFields,
  "authors"
>;
export type TypeAuthors<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode,
> = Entry<TypeAuthorsSkeleton, Modifiers, Locales>;

export interface TypeBlogPostFields {
  privatePost: boolean;
  title: EntryFieldTypes.Symbol;
  excerpt: EntryFieldTypes.Text;
  featuredImage?: ContentImage;
  bodyText: Document;
  author?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<TypeAuthorsSkeleton>
  >;
  slug: EntryFieldTypes.Symbol;
}

export type TypeBlogPostSkeleton = EntrySkeletonType<
  TypeBlogPostFields,
  "blogPost"
>;

export interface TypeForsidetekstFields {
  pageTitle: EntryFieldTypes.Symbol;
  excerpt?: EntryFieldTypes.Text;
  pageImage?: ContentImage;
}

export type TypeForsidetekstSkeleton = EntrySkeletonType<
  TypeForsidetekstFields,
  "forsidetekst"
>;

export interface TypeOfficeFields {
  name?: EntryFieldTypes.Symbol;
  location?: EntryFieldTypes.Location;
  photo?: ContentImage;
  slug?: EntryFieldTypes.Symbol;
  description?: EntryFieldTypes.RichText;
}

export type TypeOfficeSkeleton = EntrySkeletonType<TypeOfficeFields, "office">;
export type TypeOffice<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode,
> = Entry<TypeOfficeSkeleton, Modifiers, Locales>;

export interface TypePageFields {
  pageTitle: string;
  excerpt?: EntryFieldTypes.Text;
  pageImage?: ContentImage;
  pageText: EntryFieldTypes.RichText & {
    json: Document;
    links: {
      assets: {
        block: {
          sys: {
            id: string;
          };
          url: string;
          description: string;
          title: string;
          width: number;
          height: number;
        };
      };
    };
  };
  slug: EntryFieldTypes.Symbol;
}

export type TypePageSkeleton = EntrySkeletonType<TypePageFields, "page">;
export type TypePage<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode,
> = Entry<TypePageSkeleton, Modifiers, Locales>;

export interface TypeServiceMenuFields {
  serviceMenuTitle: EntryFieldTypes.Symbol<"infomeny">;
  menu1?: EntryFieldTypes.Symbol;
  menu1File?: EntryFieldTypes.AssetLink;
  menu2?: EntryFieldTypes.Symbol;
  menu2File?: EntryFieldTypes.AssetLink;
  menu3?: EntryFieldTypes.Symbol;
  menu3File?: EntryFieldTypes.AssetLink;
  menu4?: EntryFieldTypes.Symbol;
  menu4File?: EntryFieldTypes.AssetLink;
  menu5?: EntryFieldTypes.Symbol;
  menu5Files?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink>;
  menu6?: EntryFieldTypes.Symbol;
  menu6Files?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink>;
}

export type TypeServiceMenuSkeleton = EntrySkeletonType<
  TypeServiceMenuFields,
  "serviceMenu"
>;
export type TypeServiceMenu<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode,
> = Entry<TypeServiceMenuSkeleton, Modifiers, Locales>;
