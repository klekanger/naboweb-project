import type { User } from '@clerk/nextjs/dist/types/server';

export type UserRoles = 'admin' | 'editor' | 'user';

export type UserWithRoles = User & {
  publicMetadata: {
    roles?: UserRoles[];
  };
};
