import type { User } from "@clerk/nextjs/dist/types/server";
import type { UserResource } from "@clerk/types";
import type { Asset, EntryFieldTypes, EntryFields } from "contentful";
import type { TypePageFields } from "./contentful-types";

export type UserRoles = "admin" | "editor" | "user";

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
      email: string;
      roles: string[] | undefined;
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

export type ArticleProps = {
  title: string;
  authors?: Array<{
    fields: {
      firstName: string;
      lastName: string;
    };
  }>;
  bodyText: TypePageFields["pageText"];
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
      menu5FilesCollection?: {
        total: number;
        items: ContentfulFile[];
      };
      menu6FilesCollection?: {
        total: number;
        items: ContentfulFile[];
      };
    };
  };
};

export type DocumentTableProps = {
  documents: {
    total: number;
    items: ContentfulFile[];
  };
  rowsPerPage?: number;
  startPage?: number;
};

export type ReturnTypeForGetBlogPostRoutes = {
  data: {
    blogPostCollection: {
      total: number;
    };
  };
};

export type ReturnTypeForGetSlugsForBlogPosts = {
  data: {
    blogPostCollection: {
      items: Array<{
        slug: string;
      }>;
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

export type ReturnTypeForPage = {
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

type SingleBlogPostItem = {
  sys: {
    id: string;
    publishedAt: `${number}-${number}-${number}T${number}:${number}:${number}Z`;
    firstPublishedAt: `${number}-${number}-${number}T${number}:${number}:${number}Z`;
  };
  privatePost: boolean;
  title: string;
  excerpt: string;
  featuredImage?: ContentImage;
  bodyText: TypePageFields["pageText"];
  author?: {
    firstName: string;
    lastName: string;
    authorImage?: ContentImage;
  };
  slug: string;
};

export type ReturnTypeForSingleBlogPost = {
  data: {
    blogPostCollection: {
      total: number;
      items: Array<SingleBlogPostItem>;
    };
  };
};

export type ReturnTypeForBlogPosts = {
  data: {
    blogPostCollection: {
      total: number;
      items: Array<SingleBlogPostItem>;
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
  pageImage: Asset<"WITHOUT_UNRESOLVABLE_LINKS"> | undefined;
};

type DocumentBoxFields = {
  menu1Name: string;
  menu2Name: string;
  menu3Name: string;
  menu4Name: string;
  menu5Name: string;
  menu6Name: string;
  menu1File: {
    url: string;
  };
  menu2File: {
    url: string;
  };
  menu3File: {
    url: string;
  };
  menu4File: {
    url: string;
  };
};

export type ReturnTypeForDocumentBox = {
  data: {
    serviceMenu: DocumentBoxFields;
  };
};

export type DocumentBoxProps = {
  documentBoxLinks: DocumentBoxFields;
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

export type ServicesContent = {
  fields: {
    description: string;
    title: string;
    icon: string;
    locked: boolean;
    url?: string;
  };
  sys: {
    id: string;
  };
};
