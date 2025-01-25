import type { UserData, UserResource } from "@clerk/types";
import type { Image } from "sanity";
import type {
  Authors,
  BlogPost,
  FRONTPAGE_HERO_QUERYResult,
  FRONTPAGE_SERVICES_QUERYResult,
  Page,
  SHOWCASE_QUERYResult,
  MESSAGE_BY_ID_QUERYResult,
} from "./sanity.types";
import { PortableTextBlock } from "@portabletext/types";

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

export type UserWithRoles = UserResource & {
  email?: string;
  publicMetadata?: {
    roles?: UserRoles[];
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
  mainImage: Image & { alt?: string; caption?: string; lqip?: string };
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
  messageImage: any; // TODO replace any with Image
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
  data?: MESSAGE_BY_ID_QUERYResult;
};
