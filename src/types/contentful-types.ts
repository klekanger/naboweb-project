/**
 * This file is generated automatically by `cf-content-types-generator-app`.
 * https://github.com/marcolink/cf-content-types-generator-app
 */

import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful';

export interface TypeAuthorsFields {
  firstName: EntryFieldTypes.Symbol;
  lastName: EntryFieldTypes.Symbol;
  authorImage?: EntryFieldTypes.AssetLink;
}

export type TypeAuthorsSkeleton = EntrySkeletonType<
  TypeAuthorsFields,
  'authors'
>;
export type TypeAuthors<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
> = Entry<TypeAuthorsSkeleton, Modifiers, Locales>;

export function isTypeAuthors<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>
): entry is TypeAuthors<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'authors';
}

export interface TypeBlogPostFields {
  privatePost: EntryFieldTypes.Boolean;
  title: EntryFieldTypes.Symbol;
  excerpt: EntryFieldTypes.Text;
  featuredImage?: EntryFieldTypes.AssetLink;
  bodyText: EntryFieldTypes.RichText;
  author?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<TypeAuthorsSkeleton>
  >;
  slug: EntryFieldTypes.Symbol;
}

export type TypeBlogPostSkeleton = EntrySkeletonType<
  TypeBlogPostFields,
  'blogPost'
>;
export type TypeBlogPost<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
> = Entry<TypeBlogPostSkeleton, Modifiers, Locales>;

export function isTypeBlogPost<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>
): entry is TypeBlogPost<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'blogPost';
}

export interface TypeEmployeeFields {
  name?: EntryFieldTypes.Symbol;
  photo?: EntryFieldTypes.AssetLink;
  startDate?: EntryFieldTypes.Date;
  jobTitle?: EntryFieldTypes.Symbol;
}

export type TypeEmployeeSkeleton = EntrySkeletonType<
  TypeEmployeeFields,
  'employee'
>;
export type TypeEmployee<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
> = Entry<TypeEmployeeSkeleton, Modifiers, Locales>;

export function isTypeEmployee<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>
): entry is TypeEmployee<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'employee';
}

export interface TypeForsidetekstFields {
  pageTitle: EntryFieldTypes.Symbol;
  excerpt?: EntryFieldTypes.Text;
  pageImage?: EntryFieldTypes.AssetLink;
}

export type TypeForsidetekstSkeleton = EntrySkeletonType<
  TypeForsidetekstFields,
  'forsidetekst'
>;
export type TypeForsidetekst<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
> = Entry<TypeForsidetekstSkeleton, Modifiers, Locales>;

export function isTypeForsidetekst<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>
): entry is TypeForsidetekst<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'forsidetekst';
}

export interface TypeOfficeFields {
  name?: EntryFieldTypes.Symbol;
  location?: EntryFieldTypes.Location;
  photo?: EntryFieldTypes.AssetLink;
  slug?: EntryFieldTypes.Symbol;
  description?: EntryFieldTypes.RichText;
}

export type TypeOfficeSkeleton = EntrySkeletonType<TypeOfficeFields, 'office'>;
export type TypeOffice<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
> = Entry<TypeOfficeSkeleton, Modifiers, Locales>;

export function isTypeOffice<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>
): entry is TypeOffice<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'office';
}

export interface TypePageFields {
  pageTitle: EntryFieldTypes.Symbol;
  excerpt?: EntryFieldTypes.Text;
  pageImage?: EntryFieldTypes.AssetLink;
  pageText: EntryFieldTypes.RichText;
  slug: EntryFieldTypes.Symbol;
}

export type TypePageSkeleton = EntrySkeletonType<TypePageFields, 'page'>;
export type TypePage<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
> = Entry<TypePageSkeleton, Modifiers, Locales>;

export function isTypePage<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>
): entry is TypePage<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'page';
}

export interface TypeServiceMenuFields {
  serviceMenuTitle: EntryFieldTypes.Symbol<'infomeny'>;
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
  'serviceMenu'
>;
export type TypeServiceMenu<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
> = Entry<TypeServiceMenuSkeleton, Modifiers, Locales>;

export function isTypeServiceMenu<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode
>(
  entry: Entry<EntrySkeletonType, Modifiers, Locales>
): entry is TypeServiceMenu<Modifiers, Locales> {
  return entry.sys.contentType.sys.id === 'serviceMenu';
}
