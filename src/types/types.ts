import type { User } from "@clerk/nextjs/dist/types/server";
import type { Image, PortableTextBlock } from "sanity";
import {
  Authors,
  BlogPost,
  FRONTPAGE_HERO_QUERYResult,
  FRONTPAGE_SERVICES_QUERYResult,
  Page,
  SHOWCASE_QUERYResult,
} from "./sanity.types";

export type UserRoles = "admin" | "editor" | "user";

export type Slug = {
  _type: "slug";
  current?: string;
  source?: string;
};

export type DeleteUserSuccessType = {
  success: {
    message: string;
    userId: string;
  };
  status: number;
};

export type DeleteUserErrorType = {
  error: {
    message: string;
  };
  status: number;
};
export type UpdateUserSuccessType = {
  success: {
    message: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    id: string;
  };
  status: number;
};

export type UpdateUserErrorType = {
  error: {
    errorName?: string;
    code?: string;
    message: string;
    longMessage?: string;
  };
  status: number;
};

export type DeleteUserReturnType = DeleteUserSuccessType | DeleteUserErrorType;
export type UpdateUserReturnType = UpdateUserSuccessType | UpdateUserErrorType;

export type CreateNewUserSuccessType = {
  success: {
    message: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    id: string;
  };
  status: number;
};

export type CreateNewUserErrorType = {
  error: {
    errorName?: string;
    code?: string;
    message: string;
    longMessage?: string;
  };
  status: number;
};

export type CreateNewUserReturnType =
  | CreateNewUserSuccessType
  | CreateNewUserErrorType;

export type GetUserSuccessType = {
  success: {
    message: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      createdAt: number | null;
      lastSignInAt: number | null;
      roles: string[];
      imageUrl: string;
      hasImage: boolean;
    };
    status: number;
  };
};

export type GetUserErrorType = {
  error: {
    message: string;
    errorName?: string;
    code?: string;
    longMessage?: string;
  };
  status: number;
};

export type GetUserReturnType = GetUserSuccessType | GetUserErrorType;

export type SearchUserSuccessType = {
  success: {
    message: string;
    users: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      roles: string[] | undefined;
      email: string;
      imageUrl: string;
      createdAt: number;
    }[];
    status: number;
  };
};

export type SearchUserErrorType = {
  error: {
    message: string;
    errorName?: string;
    code?: string;
    longMessage?: string;
  };
  status: number;
};

export type SearchUserReturnType = SearchUserSuccessType | SearchUserErrorType;

export type SearchUserType = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  roles?: string[];
  email: string;
  publicMetadata?: {
    roles?: UserRoles[];
  };
  emailAddresses?: {
    id: string;
    emailAddress: string;
  }[];
};

export type UserTableProps = {
  users: UserWithEmails[];
  className?: string;
};

export type UserWithRoles = User & {
  email?: string;
  publicMetadata?: {
    roles?: UserRoles[];
  };
};

export type ContentImage = {
  title: string;
  url: string;
  description: string;
  width: number;
  height: number;
  fields: {
    file: {
      url: string;
      details: {
        image: {
          width: number;
          height: number;
        };
      };
    };
  };
};

export type ClerkError = {
  name: string;
  errors: Array<{
    code: string;
    longMessage?: string;
  }>;
  message: string;
  status?: number;
};

export type ShowUserProps = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: number | null;
  imageUrl?: string;
  lastSignInAt: number | null;
  roles?: string[];
};

export type ReturnTypeForUserSuccess = {
  success: {
    message: string;
  };
  user: {
    firstName: string;
    lastName: string;
    emailAddresses: {
      id: string;
      emailAddress: string;
    }[];
    createdAt: number | null;
    imageUrl: string;
    lastSignInAt: number | null;
    publicMetadata: {
      roles: string[] | undefined;
    };
  };
};

export type ReturnTypeForUserError = {
  error:
    | string
    | {
        errorName: string;
        code: string;
        message: string;
        longMessage: string;
      };
  status?: number;
};

export type IconProps = {
  fill?: string;
  stroke?: string;
  width?: number;
  height?: number;
  className?: string;
};

export type NewUser = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles?: string[];
};

export type UpdateUserType = Omit<NewUser, "password" | "email"> & {
  id: string;
};

export type UserCardProps = {
  user: UserWithRoles;
  className?: string;
};

export type UserWithEmails = Pick<
  UserWithRoles,
  "id" | "createdAt" | "firstName" | "lastName" | "email"
> & {
  roles: string[] | undefined;
  imageUrl?: string;
};

// ************
// Sanity Types
// ************

export type HeroProps = {
  data: FRONTPAGE_HERO_QUERYResult;
};

export type Services = {
  title1: string;
  title2: string;
  title3: string;
  description1: string;
  description2: string;
  description3: string;
  icon1: string;
  icon2: string;
  icon3: string;
  url1: string;
  url2: string;
  url3: string;
  private1: boolean;
  private2: boolean;
  private3: boolean;
};

export type Showcase = {
  _id: string;
  showcaseTitle?: string;
  excerpt: PortableTextBlock[];
  showcaseBlogposts: BlogPost[];
};

export type ServicesProps = {
  data: FRONTPAGE_SERVICES_QUERYResult;
};

export type ShowcaseProps = {
  data: SHOWCASE_QUERYResult;
};

export type HomePagePayload = {
  frontpageHeroContent: { data: FRONTPAGE_HERO_QUERYResult };
  frontpageServicesContent: { data: FRONTPAGE_SERVICES_QUERYResult };
  frontpageShowcaseContent: { data: SHOWCASE_QUERYResult };
};

export type HomePageProps = {
  data?: HomePagePayload;
};

export type SanityReference = {
  _type: string;
  _ref: string;
};

export type FigureProps = {
  value: {
    alt?: string;
    caption?: string;
    asset: SanityReference;
    _key: string;
    _type: string;
  };
};

export type PagePayload = {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  mainImage: Image & { alt?: string };
  overview: PortableTextBlock[];
  body: PortableTextBlock[];
  slug: Slug;
};

export type PageProps = {
  data?: Page;
};

export type BlogPageProps = {
  data?: BlogPost;
};

export type ArticleProps = {
  title: string | undefined;
  authors?: Array<Authors>;
  bodyText: PortableTextBlock[] | undefined;
  createdAt: string | undefined;
  updatedAt: string | undefined;
  mainImage: Image & { alt?: string; caption?: string; lqip?: string };
  buttonLink: string | undefined;
};

export type BlogPagePayload = {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  privatePost?: boolean;
  title?: string;
  excerpt: PortableTextBlock[];
  featuredImage: Image & { alt: string };
  bodyText: PortableTextBlock[];
  slug: Slug;
  author: {
    firstName: string;
    lastName: string;
    authorImage: Image;
  };
};

export type DocumentMenu = {
  button1Text: string;
  button2Text: string;
  button3Text: string;
  button4Text: string;
  file1: { url: string };
  file2: { url: string };
  file3: { url: string };
  file4: { url: string };
};
