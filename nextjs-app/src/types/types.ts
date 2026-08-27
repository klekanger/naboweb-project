import { type SanityImageAsset } from "@/types/sanity.types";
import type { User } from "@clerk/nextjs/server";
import { PortableTextBlock } from "@portabletext/types";
import type { Image as SanityImage } from "sanity";
import type {
  Authors,
  BlogPost,
  FrontpageHeroQueryResult,
  FrontpageServicesQueryResult,
  MessageByIdQueryResult,
  Page,
  ShowcaseQueryResult,
} from "./sanity.types";

export type UserRoles = "admin" | "editor" | "user";

export type DeleteUserSuccessType = {
  success: {
    message: string;
    deletedClerkUserId: string;
    sanityUserHasBeenDeleted: boolean;
    deletedSanityUserId: string;
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
      emailSubscription?: boolean | undefined;
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
      emailSubscription?: boolean;
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

export type PaginationData = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type UserTableProps = {
  users: UserWithEmails[];
  className?: string;
  pagination?: PaginationData;
};

export type UserAdminProps = {
  users: UserWithEmails[];
  /**
   * All users with the "admin" or "editor" role, fetched independently of the
   * paginated `users` list so the overview is never limited to the current page.
   */
  superUsers: UserWithEmails[];
  pagination?: PaginationData;
};

export type ShowRolesTableProps = {
  users: UserWithEmails[];
  className?: string;
};

export type UserWithRoles = User & {
  email?: string;
  publicMetadata?: {
    roles?: UserRoles[];
    emailSubscription?: boolean;
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
  emailSubscription?: boolean | undefined;
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
  password?: string;
  roles?: string[];
  emailSubscription?: boolean;
};

export type UpdateUserType = Omit<NewUser, "password" | "email"> & {
  id: string;
};

export type UserOverviewProps = {
  user: UserWithRoles;
  className?: string;
};

export type UserWithEmails = Pick<
  UserWithRoles,
  "id" | "firstName" | "lastName" | "email"
> & {
  /** Milliseconds since epoch (Clerk backend `User` uses numbers; UI uses `formatDate` / `new Date`) */
  createdAt: number;
  roles: string[] | undefined;
  imageUrl?: string;
  emailSubscription?: boolean;
};

// ************
// Sanity Types
// ************

export type HeroProps = {
  data: FrontpageHeroQueryResult;
};

export type ServicesProps = {
  data: FrontpageServicesQueryResult;
};

export type ShowcaseProps = {
  data: ShowcaseQueryResult;
};

export type HomePagePayload = {
  frontpageHeroContent: { data: FrontpageHeroQueryResult };
  frontpageServicesContent: { data: FrontpageServicesQueryResult };
  frontpageShowcaseContent: { data: ShowcaseQueryResult };
};

export type HomePageProps = {
  data?: HomePagePayload;
};

export type SanityReference = {
  _type: string;
  _ref: string;
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
  // bodyText: PortableTextBlock[] | undefined;
  bodyText: any; // TODO fix type later
  createdAt: string | undefined;
  updatedAt: string | undefined;
  mainImage: SanityImage & { lqip?: string | null };
  buttonLink: string | undefined;
};

export type MessageType = {
  title: string;
  bodyText: PortableTextBlock[] | undefined | null;
  author: {
    firstName: string;
    lastName: string;
  };
  userId?: string;
  messageImage: SanityImageAsset;
  fromAdmin: boolean;
};

export type MessageCardProps = {
  title: string;
  id: string;
  description: PortableTextBlock;
  commentCount: number;
  url?: string;
  imageUrl: string | null;
  author?: { firstName?: string; lastName?: string };
  fromAdmin?: boolean;
  userIsMessageAuthor?: boolean;
  createdAt: string;
  comments: Array<{
    _key: string;
    commentText: string | null;
    commentTitle: string | null;
    commentAuthor: {
      _id: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
  }> | null;
};

export type MessagePageProps = {
  data?: MessageByIdQueryResult;
};
